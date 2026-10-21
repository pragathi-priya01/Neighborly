import crypto from 'crypto';
import { Booking, BOOKING_STATUS } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { getRazorpayInstance, verifyRazorpaySignature, verifyWebhookSignature } from '../config/razorpay.js';
import { emitToUser } from '../sockets/socketHandler.js';

export class PaymentService {
  /**
   * 1. Create Razorpay Order on the backend
   */
  static async createOrder(bookingId, residentUserId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.requester.toString() !== residentUserId.toString()) {
      throw ApiError.forbidden('You are not authorized to pay for this booking');
    }

    if (booking.status === BOOKING_STATUS.PAID) {
      throw ApiError.badRequest('This booking has already been paid for.');
    }

    if (![BOOKING_STATUS.PAYMENT_PENDING, BOOKING_STATUS.ACCEPTED].includes(booking.status)) {
      throw ApiError.badRequest(
        `Cannot pay for booking in status ${booking.status}. Booking must be in PAYMENT_PENDING or ACCEPTED status.`
      );
    }

    const amountInINR = booking.amount;
    const amountInPaise = Math.round(amountInINR * 100);

    const rzp = getRazorpayInstance();
    if (!rzp) {
      logger.error('Razorpay SDK is not initialized. Please verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
      throw ApiError.badRequest('Payment gateway is not configured properly.');
    }

    let rzpOrder;
    try {
      rzpOrder = await rzp.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_bk_${booking._id.toString().substring(0, 10)}`,
        notes: {
          bookingId: booking._id.toString(),
          requesterId: residentUserId.toString(),
        },
      });
    } catch (err) {
      console.error('Razorpay order creation failed:', {
        message: err.message,
        statusCode: err.statusCode,
        code: err.error?.code,
        description: err.error?.description,
        reason: err.error?.reason,
        field: err.error?.field,
      });

      const errorMsg =
        err.error?.description ||
        err.message ||
        'Payment gateway order creation failed';

      throw ApiError.badRequest(
        `Failed to create Razorpay order: ${errorMsg}`
      );
    }

    // Persist Payment record in database
    const payment = await Payment.create({
      booking: booking._id,
      requester: residentUserId,
      provider: booking.provider,
      amount: amountInINR,
      amountPaise: amountInPaise,
      currency: 'INR',
      razorpayOrderId: rzpOrder.id,
      status: 'CREATED',
      mode: env.RAZORPAY_MODE,
    });

    booking.payment = payment._id;
    booking.status = BOOKING_STATUS.PAYMENT_PENDING;
    await booking.save();

    return {
      orderId: rzpOrder.id,
      amount: amountInPaise,
      amountINR: amountInINR,
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID,
      mode: env.RAZORPAY_MODE,
      bookingId: booking._id,
    };
  }

  /**
   * 2. Verify Razorpay Signature on the backend
   * Never trust paymentSuccess=true from frontend!
   */
  static async verifyPayment(residentUserId, { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.requester.toString() !== residentUserId.toString()) {
      throw ApiError.forbidden('Unauthorized payment verification attempt');
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw ApiError.badRequest('Missing required payment verification parameters (order ID, payment ID, signature)');
    }

    // Mock payment verification cannot mark a booking as paid in the deployed application
    if (razorpayOrderId.startsWith('order_test_')) {
      logger.warn({ razorpayOrderId, residentUserId }, 'Mock payment verification rejected');
      throw ApiError.badRequest('Mock payments are not supported. Real Razorpay verification is required.');
    }

    const payment = await Payment.findOne({
      booking: booking._id,
      razorpayOrderId,
    });

    if (!payment) {
      throw ApiError.notFound('Payment order record not found in system');
    }

    if (payment.status === 'CAPTURED') {
      return { success: true, message: 'Payment already processed and verified.' };
    }

    // Cryptographic signature check
    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      payment.status = 'FAILED';
      payment.failureReason = 'Cryptographic signature mismatch';
      await payment.save();
      throw ApiError.badRequest('Invalid payment signature. Verification failed.');
    }

    // Update payment record
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.status = 'CAPTURED';
    payment.signatureVerified = true;
    await payment.save();

    // Transition booking state to PAID
    booking.status = BOOKING_STATUS.PAID;
    await booking.save();

    // Notify Provider and Resident
    const notifProvider = await Notification.create({
      recipient: booking.provider,
      type: 'PAYMENT_SUCCESS',
      title: 'Payment Confirmed!',
      message: `The resident has completed payment of ₹${booking.amount} for booking #${booking._id.toString().slice(-6)}.`,
      link: `/provider/bookings/${booking._id}`,
      relatedEntity: { entityType: 'Booking', entityId: booking._id },
    });
    emitToUser(booking.provider, 'new_notification', notifProvider);
    emitToUser(booking.provider, 'booking_status_updated', {
      bookingId: booking._id,
      status: BOOKING_STATUS.PAID,
    });

    const notifResident = await Notification.create({
      recipient: residentUserId,
      type: 'PAYMENT_SUCCESS',
      title: 'Payment Successful',
      message: `Your payment of ₹${booking.amount} for ${booking.serviceCategory} has been verified and confirmed.`,
      link: `/resident/bookings/${booking._id}`,
      relatedEntity: { entityType: 'Booking', entityId: booking._id },
    });
    emitToUser(residentUserId, 'new_notification', notifResident);

    return {
      success: true,
      bookingId: booking._id,
      paymentId: payment._id,
      status: BOOKING_STATUS.PAID,
    };
  }

  /**
   * 3. Handle Razorpay Webhooks (Idempotent)
   */
  static async handleWebhook(rawBody, signature, payload) {
    if (!signature) {
      logger.warn('Razorpay webhook called without X-Razorpay-Signature header');
      throw ApiError.badRequest('Missing X-Razorpay-Signature header');
    }

    if (!env.RAZORPAY_WEBHOOK_SECRET) {
      logger.error('Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not configured on server');
      throw ApiError.internal('Webhook secret not configured on server');
    }

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      logger.warn('Razorpay webhook signature verification failed');
      throw ApiError.badRequest('Invalid webhook signature');
    }

    const event = payload?.event;
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    logger.info({ event, orderId, paymentId }, 'Razorpay Webhook Received');

    if (!orderId) {
      return { received: true };
    }

    const payment = await Payment.findOne({ razorpayOrderId: orderId });
    if (!payment) {
      logger.warn(`Webhook: No payment record found for order ${orderId}`);
      return { received: true };
    }

    // Idempotent processing: if already captured, don't re-process
    if (payment.status === 'CAPTURED') {
      return { received: true, message: 'Already captured' };
    }

    if (event === 'payment.captured' || event === 'order.paid') {
      payment.status = 'CAPTURED';
      payment.razorpayPaymentId = paymentId || payment.razorpayPaymentId;
      payment.webhookReceived = true;
      payment.signatureVerified = true;
      await payment.save();

      const booking = await Booking.findById(payment.booking);
      if (booking && booking.status !== BOOKING_STATUS.PAID) {
        booking.status = BOOKING_STATUS.PAID;
        await booking.save();
        emitToUser(booking.provider, 'booking_status_updated', {
          bookingId: booking._id,
          status: BOOKING_STATUS.PAID,
        });
      }
    } else if (event === 'payment.failed') {
      payment.status = 'FAILED';
      payment.failureReason = paymentEntity?.error_description || 'Payment failed on Razorpay';
      payment.webhookReceived = true;
      await payment.save();
    }

    return { received: true };
  }
}
