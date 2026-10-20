import { Booking, BOOKING_STATUS, ALLOWED_TRANSITIONS } from '../models/Booking.js';
import { ProviderProfile } from '../models/ProviderProfile.js';
import { Conversation } from '../models/Conversation.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/apiError.js';
import { emitToUser } from '../sockets/socketHandler.js';

export class BookingService {
  static async createDirectBooking(requesterUserId, bookingData) {
    const {
      providerId,
      serviceId,
      serviceCategory,
      scheduledDate,
      scheduledTime,
      amount,
      address,
      notes,
    } = bookingData;

    // Check if provider exists
    const providerProfile = await ProviderProfile.findOne({
      $or: [{ _id: providerId }, { user: providerId }],
    }).populate('user');

    if (!providerProfile) {
      throw ApiError.notFound('Provider not found');
    }

    const providerUserId = providerProfile.user._id;

    if (requesterUserId.toString() === providerUserId.toString()) {
      throw ApiError.badRequest('You cannot book your own service');
    }

    const booking = await Booking.create({
      requester: requesterUserId,
      provider: providerUserId,
      service: serviceId || null,
      serviceCategory: serviceCategory || 'General Service',
      scheduledDate,
      scheduledTime,
      amount,
      address,
      notes,
      status: BOOKING_STATUS.PENDING,
    });

    // Create or find Conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [requesterUserId, providerUserId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [requesterUserId, providerUserId],
        booking: booking._id,
        lastMessage: 'Direct booking request submitted.',
        lastMessageAt: new Date(),
      });
    } else {
      conversation.booking = booking._id;
      await conversation.save();
    }

    // Notify Provider
    const notif = await Notification.create({
      recipient: providerUserId,
      type: 'BOOKING_CREATED',
      title: 'New Booking Request!',
      message: `You have received a new booking request for ${booking.serviceCategory} on ${scheduledDate}.`,
      link: `/provider/bookings/${booking._id}`,
      relatedEntity: {
        entityType: 'Booking',
        entityId: booking._id,
      },
    });
    emitToUser(providerUserId, 'new_notification', notif);
    emitToUser(providerUserId, 'booking_created', booking);

    return booking;
  }

  static async getBookings(userId, role, { status, page = 1, limit = 20 }) {
    const filter = {};
    if (role === 'RESIDENT') {
      filter.requester = userId;
    } else if (role === 'PROVIDER') {
      filter.provider = userId;
    }
    // Admins see all bookings if not filtered

    if (status) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('requester', 'name email phone neighborhood profileImage')
        .populate('provider', 'name email phone neighborhood profileImage')
        .populate('service', 'name category icon')
        .populate('payment')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Booking.countDocuments(filter),
    ]);

    return {
      bookings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  static async getBookingById(bookingId, userId, role) {
    const booking = await Booking.findById(bookingId)
      .populate('requester', 'name email phone neighborhood profileImage')
      .populate('provider', 'name email phone neighborhood profileImage')
      .populate('service', 'name category icon')
      .populate('payment');

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const isRequester = booking.requester._id.toString() === userId.toString();
    const isProvider = booking.provider._id.toString() === userId.toString();
    const isAdmin = role === 'ADMIN';

    if (!isRequester && !isProvider && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to view this booking');
    }

    return booking;
  }

  static async updateStatus(bookingId, userId, role, { status: nextStatus, cancellationReason }) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const isRequester = booking.requester.toString() === userId.toString();
    const isProvider = booking.provider.toString() === userId.toString();
    const isAdmin = role === 'ADMIN';

    if (!isRequester && !isProvider && !isAdmin) {
      throw ApiError.forbidden('Unauthorized access to booking');
    }

    // Role-specific transition rules:
    // Providers can accept/reject pending bookings, start progress, complete
    // Residents can cancel if not yet completed/in-progress
    // State machine check
    const currentStatus = booking.status;
    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];

    if (!allowedNext.includes(nextStatus) && !isAdmin) {
      throw ApiError.badRequest(
        `Invalid status transition from ${currentStatus} to ${nextStatus}. Allowed transitions: [${allowedNext.join(', ')}]`
      );
    }

    // Authorization checks for specific transitions:
    if (nextStatus === BOOKING_STATUS.ACCEPTED && !isProvider && !isAdmin) {
      throw ApiError.forbidden('Only the assigned provider can accept this booking');
    }

    if (nextStatus === BOOKING_STATUS.REJECTED && !isProvider && !isAdmin) {
      throw ApiError.forbidden('Only the assigned provider can reject this booking');
    }

    if (nextStatus === BOOKING_STATUS.IN_PROGRESS && !isProvider && !isAdmin) {
      throw ApiError.forbidden('Only the provider can mark the service as in progress');
    }

    if (nextStatus === BOOKING_STATUS.COMPLETED && !isProvider && !isAdmin) {
      throw ApiError.forbidden('Only the service provider can mark the service as completed');
    }

    // When provider accepts, advance status to PAYMENT_PENDING so resident can pay
    let targetStatus = nextStatus;
    if (nextStatus === BOOKING_STATUS.ACCEPTED) {
      targetStatus = BOOKING_STATUS.PAYMENT_PENDING;
    }

    booking.status = targetStatus;

    if (targetStatus === BOOKING_STATUS.CANCELLED && cancellationReason) {
      booking.cancellationReason = cancellationReason;
    }

    if (targetStatus === BOOKING_STATUS.COMPLETED) {
      booking.completedAt = new Date();

      // Recalculate provider metrics
      const providerProfile = await ProviderProfile.findOne({ user: booking.provider });
      if (providerProfile) {
        providerProfile.completedBookings += 1;
        providerProfile.recalculateTrustScore();
        await providerProfile.save();
      }
    }

    await booking.save();

    // Notify the other party
    const counterpartId = isRequester ? booking.provider : booking.requester;
    const notif = await Notification.create({
      recipient: counterpartId,
      type: 'BOOKING_STATUS',
      title: `Booking Update: ${targetStatus}`,
      message: `Booking for ${booking.serviceCategory} is now ${targetStatus}.`,
      link: isRequester ? `/provider/bookings/${booking._id}` : `/resident/bookings/${booking._id}`,
      relatedEntity: {
        entityType: 'Booking',
        entityId: booking._id,
      },
    });
    emitToUser(counterpartId, 'new_notification', notif);
    emitToUser(counterpartId, 'booking_status_updated', {
      bookingId: booking._id,
      status: targetStatus,
    });

    return booking;
  }
}
