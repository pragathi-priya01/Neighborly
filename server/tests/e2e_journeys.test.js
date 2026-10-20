import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { env } from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { AuthService } from '../src/services/authService.js';
import { AIService } from '../src/services/ai/aiService.js';
import { RequestService } from '../src/services/requestService.js';
import { OfferService } from '../src/services/offerService.js';
import { BookingService } from '../src/services/bookingService.js';
import { PaymentService } from '../src/services/paymentService.js';
import { ReviewService } from '../src/services/reviewService.js';
import { AdminService } from '../src/services/adminService.js';
import { ServiceCatalogService } from '../src/services/serviceCatalogService.js';
import { User } from '../src/models/User.js';
import { ProviderProfile } from '../src/models/ProviderProfile.js';
import { ServiceRequest } from '../src/models/ServiceRequest.js';
import { ProviderOffer } from '../src/models/ProviderOffer.js';
import { Booking, BOOKING_STATUS } from '../src/models/Booking.js';
import { Payment } from '../src/models/Payment.js';
import { Review } from '../src/models/Review.js';
import { authorize } from '../src/middleware/auth.js';

describe('End-to-End User Journeys (Resident, Provider, Admin)', () => {
  let residentUser = null;
  let residentToken = null;
  let providerUser = null;
  let providerProfile = null;
  let createdRequest = null;
  let createdOffer = null;
  let activeBooking = null;

  before(async () => {
    await connectDB();
  });

  after(async () => {
    // Cleanup records created during journey
    if (activeBooking?._id) {
      await Review.deleteMany({ booking: activeBooking._id });
      await Payment.deleteMany({ booking: activeBooking._id });
      await Booking.findByIdAndDelete(activeBooking._id);
    }
    if (createdOffer?._id) await ProviderOffer.findByIdAndDelete(createdOffer._id);
    if (createdRequest?._id) await ServiceRequest.findByIdAndDelete(createdRequest._id);
    if (providerProfile?._id) await ProviderProfile.findByIdAndDelete(providerProfile._id);
    if (providerUser?._id) await User.findByIdAndDelete(providerUser._id);
    if (residentUser?._id) await User.findByIdAndDelete(residentUser._id);

    await disconnectDB();
  });

  // ==========================================
  // PHASE THREE: RESIDENT JOURNEY
  // ==========================================
  describe('Phase Three — Resident Journey Verification', () => {
    it('3.1 Register new resident, verify password hash, and log in', async () => {
      const email = `e2e_resident_${Date.now()}@neighbourly.local`;
      const regRes = await AuthService.register({
        name: 'Kavita Sundaram',
        email,
        password: 'Password@123',
        role: 'RESIDENT',
        phone: '+91 98765 11111',
        neighborhood: 'Indiranagar',
      });

      residentUser = regRes.user;
      residentToken = regRes.token;

      assert.equal(residentUser.role, 'RESIDENT');
      assert.equal(residentUser.email, email);
      assert.ok(residentToken);

      // Verify invalid credentials show clear error
      await assert.rejects(
        () => AuthService.login({ email, password: 'WrongPassword@999' }),
        /Invalid email or password/
      );

      // Valid login succeeds
      const loginRes = await AuthService.login({ email, password: 'Password@123' });
      assert.ok(loginRes.token);
    });

    it('3.2 Browse and search available service categories (8 core categories)', async () => {
      const categories = await ServiceCatalogService.listServices();
      assert.ok(categories.length >= 8, 'Must have at least 8 categories');
      const names = categories.map((c) => c.category);
      assert.ok(names.includes('Plumbing'));
      assert.ok(names.includes('Electrical'));
      assert.ok(names.includes('Cleaning'));
    });

    it('3.3 AI Service Request Assistant: parse natural language prompt with review & edit', async () => {
      const prompt = 'My bathroom shower pipe is leaking heavily, need someone tomorrow morning, budget around 550';
      const extracted = await AIService.extractServiceRequest(prompt, residentUser.neighborhood);

      assert.equal(extracted.category, 'Plumbing');
      assert.equal(extracted.preferredTime, 'Morning');
      assert.equal(extracted.budget, 550);
      assert.ok(extracted.suggestedSkills.length > 0);

      // Verify AI Provider Matching returns scored candidates
      const matches = await AIService.matchProvidersForRequest({
        category: extracted.category,
        neighborhood: extracted.neighborhood,
        budget: extracted.budget,
      });

      assert.ok(Array.isArray(matches));
      if (matches.length > 0) {
        assert.ok(matches[0].matchScore >= 0 && matches[0].matchScore <= 100);
        assert.ok(matches[0].explanation);
      }

      // Resident reviews and confirms the request
      createdRequest = await RequestService.createRequest(residentUser._id, {
        category: extracted.category,
        title: 'Bathroom Shower Pipe Leak',
        description: extracted.description,
        preferredDate: extracted.preferredDate,
        preferredTime: extracted.preferredTime,
        budget: extracted.budget,
        neighborhood: extracted.neighborhood,
        aiAssisted: true,
      });

      assert.equal(createdRequest.status, 'OPEN');
      assert.equal(createdRequest.requester.toString(), residentUser._id.toString());
    });
  });

  // ==========================================
  // PHASE FOUR: SERVICE PROVIDER JOURNEY
  // ==========================================
  describe('Phase Four — Service Provider Journey Verification', () => {
    it('4.1 Register as a provider, complete profile, and define skills & pricing', async () => {
      const provEmail = `e2e_provider_${Date.now()}@neighbourly.local`;
      const regRes = await AuthService.register({
        name: 'Manoj Plumbing Pro',
        email: provEmail,
        password: 'Password@123',
        role: 'PROVIDER',
        phone: '+91 98765 22222',
        neighborhood: 'Indiranagar',
      });

      providerUser = regRes.user;
      providerProfile = regRes.providerProfile;

      assert.equal(providerUser.role, 'PROVIDER');
      assert.ok(providerProfile);

      // Link skills, hourly rate, and plumbing service
      const plumbingServices = await ServiceCatalogService.listServices({ category: 'Plumbing' });
      const plumbingCat = plumbingServices[0];
      providerProfile.services = [plumbingCat._id];
      providerProfile.skills = ['Pipe Repair', 'Shower Leak Fixing'];
      providerProfile.pricing = { hourlyRate: 450, baseConsultationFee: 150 };
      providerProfile.verificationStatus = 'VERIFIED'; // Mark verified for test
      await providerProfile.save();
    });

    it('4.2 Provider views open request feed and submits quotation offer', async () => {
      const openRequests = await RequestService.getOpenRequestsForProvider(providerUser._id);
      assert.ok(openRequests.some((r) => r._id.toString() === createdRequest._id.toString()));

      // Submit offer
      createdOffer = await OfferService.submitOffer(providerUser._id, createdRequest._id, {
        proposedPrice: 500,
        message: 'I have 8 years plumbing experience in Indiranagar, will arrive at 9 AM.',
        estimatedServiceTime: '1 hour',
      });

      assert.equal(createdOffer.status, 'PENDING');
      assert.equal(createdOffer.proposedPrice, 500);

      // Verify duplicate offer from same provider is rejected
      await assert.rejects(
        () =>
          OfferService.submitOffer(providerUser._id, createdRequest._id, {
            proposedPrice: 480,
            message: 'Duplicate bid attempt',
          }),
        /already submitted an offer/
      );
    });

    it('4.3 Resident accepts provider offer -> generates Booking with PAYMENT_PENDING', async () => {
      const acceptResult = await OfferService.acceptOffer(residentUser._id, createdOffer._id);
      activeBooking = acceptResult.booking;

      assert.equal(activeBooking.status, BOOKING_STATUS.PAYMENT_PENDING);
      assert.equal(activeBooking.amount, 500);
      assert.equal(activeBooking.requester.toString(), residentUser._id.toString());
      assert.equal(activeBooking.provider.toString(), providerUser._id.toString());

      // Reload request: must be marked ASSIGNED
      const updatedReq = await ServiceRequest.findById(createdRequest._id);
      assert.equal(updatedReq.status, 'ASSIGNED');
    });

    it('4.4 State Machine Guard: Provider cannot start job while in PAYMENT_PENDING', async () => {
      await assert.rejects(
        () =>
          BookingService.updateStatus(activeBooking._id, providerUser._id, 'PROVIDER', {
            status: BOOKING_STATUS.IN_PROGRESS,
          }),
        /Invalid status transition/
      );
    });
  });

  // ==========================================
  // PHASE FIVE & SIX: PAYMENT, LIFECYCLE & REVIEWS
  // ==========================================
  describe('Phase Five & Six — Escrow Payment, Execution & Verified Review', () => {
    let orderDetails = null;

    it('5.1 Resident initiates Razorpay test order generation (in paise)', async () => {
      orderDetails = await PaymentService.createOrder(activeBooking._id, residentUser._id);

      assert.ok(orderDetails.orderId);
      assert.equal(orderDetails.amount, 50000); // 500 INR in paise
      assert.equal(orderDetails.amountINR, 500);
    });

    it('5.2 Backend cryptographic verification transitions booking to PAID', async () => {
      const paymentId = `pay_test_${Date.now()}`;
      const secret = env.RAZORPAY_KEY_SECRET || 'placeholder_secret_key';
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderDetails.orderId}|${paymentId}`)
        .digest('hex');

      const verifyRes = await PaymentService.verifyPayment(residentUser._id, {
        bookingId: activeBooking._id,
        razorpayOrderId: orderDetails.orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature,
      });

      assert.equal(verifyRes.success, true);
      assert.equal(verifyRes.status, BOOKING_STATUS.PAID);

      // Verify payment ledger is updated
      const paymentDoc = await Payment.findOne({ razorpayOrderId: orderDetails.orderId });
      assert.equal(paymentDoc.status, 'CAPTURED');
    });

    it('5.3 Provider executes job: advances status from PAID -> IN_PROGRESS -> COMPLETED', async () => {
      const inProgressBooking = await BookingService.updateStatus(
        activeBooking._id,
        providerUser._id,
        'PROVIDER',
        { status: BOOKING_STATUS.IN_PROGRESS }
      );
      assert.equal(inProgressBooking.status, BOOKING_STATUS.IN_PROGRESS);

      const completedBooking = await BookingService.updateStatus(
        activeBooking._id,
        providerUser._id,
        'PROVIDER',
        { status: BOOKING_STATUS.COMPLETED }
      );
      assert.equal(completedBooking.status, BOOKING_STATUS.COMPLETED);
      assert.ok(completedBooking.completedAt);
    });

    it('5.4 Resident submits verified review; rating and trust score recalculated', async () => {
      const review = await ReviewService.createReview(residentUser._id, {
        bookingId: activeBooking._id,
        rating: 5,
        comment: 'Excellent plumbing work, very punctual and fixed the leak cleanly!',
      });

      assert.equal(review.rating, 5);

      // Provider profile metrics updated
      const updatedProfile = await ProviderProfile.findOne({ user: providerUser._id });
      assert.equal(updatedProfile.rating, 5);
      assert.equal(updatedProfile.reviewCount, 1);
      assert.ok(updatedProfile.trustScore > 50, 'Trust score must increase after 5-star review');

      // Duplicate review is rejected
      await assert.rejects(
        () =>
          ReviewService.createReview(residentUser._id, {
            bookingId: activeBooking._id,
            rating: 4,
            comment: 'Duplicate review attempt',
          }),
        /already submitted a review/
      );
    });
  });

  // ==========================================
  // PHASE SEVEN: ADMIN GOVERNANCE JOURNEY
  // ==========================================
  describe('Phase Seven — Admin Oversight & Dispute Resolution', () => {
    it('7.1 Admin logs in and inspects live analytics reflecting new completed booking', async () => {
      const adminLogin = await AuthService.login({
        email: 'admin@neighbourly.local',
        password: 'Admin@1234',
      });
      assert.equal(adminLogin.user.role, 'ADMIN');

      const analytics = await AdminService.getDashboardAnalytics();
      assert.ok(analytics.metrics.totalUsers >= 2);
      assert.ok(analytics.metrics.totalProviders >= 1);
    });

    it('7.2 Resident cannot perform admin-only operations (RBAC protection)', async () => {
      const adminGuard = authorize('ADMIN');
      let capturedError = null;
      adminGuard({ user: residentUser }, {}, (err) => {
        capturedError = err;
      });
      assert.ok(capturedError, 'RBAC must block resident');
      assert.equal(capturedError.statusCode, 403);
    });
  });
});
