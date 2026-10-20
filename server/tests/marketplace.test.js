import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Service } from '../src/models/Service.js';
import { ProviderProfile } from '../src/models/ProviderProfile.js';
import { RequestService } from '../src/services/requestService.js';
import { OfferService } from '../src/services/offerService.js';
import { BookingService } from '../src/services/bookingService.js';
import { BOOKING_STATUS } from '../src/models/Booking.js';

describe('Marketplace Request, Offer & Booking Lifecycle', () => {
  let residentUser;
  let providerUser;
  let providerProfile;
  let serviceCat;
  let createdRequest;
  let createdOffer;
  let createdBooking;

  before(async () => {
    await connectDB();

    // Create test service category
    serviceCat = await Service.findOneAndUpdate(
      { category: 'Plumbing' },
      {
        name: 'Plumbing & Pipe Repair',
        category: 'Plumbing',
        description: 'Taps, pipes, leaks',
        basePriceEstimate: 500,
      },
      { upsert: true, new: true }
    );

    // Create resident user
    residentUser = await User.create({
      name: 'Test Resident M',
      email: `res_market_${Date.now()}@neighbourly.local`,
      passwordHash: 'hash_test_123',
      role: 'RESIDENT',
      neighborhood: 'Indiranagar',
    });

    // Create provider user
    providerUser = await User.create({
      name: 'Test Plumber Master',
      email: `prov_market_${Date.now()}@neighbourly.local`,
      passwordHash: 'hash_test_123',
      role: 'PROVIDER',
      neighborhood: 'Indiranagar',
    });

    // Create provider profile
    providerProfile = await ProviderProfile.create({
      user: providerUser._id,
      bio: 'Certified plumber for 5 years',
      skills: ['Pipe Fitting', 'Tap Repair'],
      services: [serviceCat._id],
      experienceYears: 5,
      pricing: { hourlyRate: 400, baseConsultationFee: 150 },
      neighborhood: 'Indiranagar',
      verificationStatus: 'VERIFIED',
    });
  });

  after(async () => {
    await disconnectDB();
  });

  it('1. Resident creates a service request', async () => {
    createdRequest = await RequestService.createRequest(residentUser._id, {
      category: 'Plumbing',
      title: 'Bathroom washbasin leak',
      description: 'Leaking pipe under the bathroom washbasin',
      preferredDate: '2026-10-01',
      preferredTime: 'Morning',
      budget: 600,
      neighborhood: 'Indiranagar',
    });

    assert.ok(createdRequest._id);
    assert.equal(createdRequest.category, 'Plumbing');
    assert.equal(createdRequest.status, 'OPEN');
    assert.equal(createdRequest.budget, 600);
  });

  it('2. Provider submits an offer for the request', async () => {
    createdOffer = await OfferService.submitOffer(providerUser._id, createdRequest._id.toString(), {
      proposedPrice: 550,
      estimatedServiceTime: '2 hours',
      message: 'I can fix the bathroom basin leak tomorrow morning.',
    });

    assert.ok(createdOffer._id);
    assert.equal(createdOffer.proposedPrice, 550);
    assert.equal(createdOffer.status, 'PENDING');
  });

  it('3. Resident accepts provider offer -> creates Booking with PAYMENT_PENDING status', async () => {
    const result = await OfferService.acceptOffer(residentUser._id, createdOffer._id.toString());

    assert.ok(result.booking);
    createdBooking = result.booking;
    assert.equal(createdBooking.status, BOOKING_STATUS.PAYMENT_PENDING);
    assert.equal(createdBooking.amount, 550);
    assert.equal(createdBooking.requester.toString(), residentUser._id.toString());
  });

  it('4. Direct booking lifecycle: Create direct booking -> Provider accepts -> PAYMENT_PENDING', async () => {
    const directBooking = await BookingService.createDirectBooking(residentUser._id, {
      providerId: providerProfile._id.toString(),
      serviceId: serviceCat._id.toString(),
      serviceCategory: 'Plumbing',
      scheduledDate: '2026-10-02',
      scheduledTime: 'Afternoon',
      amount: 400,
      address: '100 Feet Rd, Indiranagar',
      notes: 'Please check the kitchen tap',
    });

    assert.equal(directBooking.status, BOOKING_STATUS.PENDING);

    const acceptedBooking = await BookingService.updateStatus(
      directBooking._id.toString(),
      providerUser._id,
      'PROVIDER',
      { status: BOOKING_STATUS.ACCEPTED }
    );

    assert.equal(acceptedBooking.status, BOOKING_STATUS.PAYMENT_PENDING);
  });
});
