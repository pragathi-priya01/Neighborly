import { Review } from '../models/Review.js';
import { Booking, BOOKING_STATUS } from '../models/Booking.js';
import { ProviderProfile } from '../models/ProviderProfile.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/apiError.js';
import { emitToUser } from '../sockets/socketHandler.js';

export class ReviewService {
  static async createReview(residentUserId, { bookingId, rating, comment }) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.requester.toString() !== residentUserId.toString()) {
      throw ApiError.forbidden('You can only review services booked by you');
    }

    // Must be COMPLETED
    if (booking.status !== BOOKING_STATUS.COMPLETED) {
      throw ApiError.badRequest('Reviews can only be submitted for completed bookings.');
    }

    // Check duplicate
    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      throw ApiError.conflict('You have already submitted a review for this booking.');
    }

    const review = await Review.create({
      booking: booking._id,
      reviewer: residentUserId,
      provider: booking.provider,
      rating,
      comment,
    });

    // Recalculate provider average rating and review count
    const allReviews = await Review.find({ provider: booking.provider });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Math.round((totalRating / allReviews.length) * 10) / 10;

    const providerProfile = await ProviderProfile.findOne({ user: booking.provider });
    if (providerProfile) {
      providerProfile.rating = avgRating;
      providerProfile.reviewCount = allReviews.length;
      providerProfile.recalculateTrustScore();
      await providerProfile.save();
    }

    // Notify provider
    const notif = await Notification.create({
      recipient: booking.provider,
      type: 'REVIEW_RECEIVED',
      title: 'New Review Received!',
      message: `A resident gave you a ${rating}★ review for "${booking.serviceCategory}".`,
      link: `/provider/dashboard`,
      relatedEntity: { entityType: 'Review', entityId: review._id },
    });
    emitToUser(booking.provider, 'new_notification', notif);

    return review;
  }

  static async getProviderReviews(providerUserId) {
    return Review.find({ provider: providerUserId })
      .populate('reviewer', 'name profileImage neighborhood')
      .sort({ createdAt: -1 });
  }
}
