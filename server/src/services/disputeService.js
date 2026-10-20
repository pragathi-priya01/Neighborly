import { Dispute } from '../models/Dispute.js';
import { Booking, BOOKING_STATUS } from '../models/Booking.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/apiError.js';
import { emitToUser } from '../sockets/socketHandler.js';

export class DisputeService {
  static async createDispute(userId, { bookingId, reason, description, evidence }) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const isRequester = booking.requester.toString() === userId.toString();
    const isProvider = booking.provider.toString() === userId.toString();

    if (!isRequester && !isProvider) {
      throw ApiError.forbidden('You are not a participant in this booking');
    }

    // Check if open dispute already exists
    const existing = await Dispute.findOne({
      booking: bookingId,
      status: { $in: ['OPEN', 'UNDER_REVIEW'] },
    });
    if (existing) {
      throw ApiError.conflict('An active dispute is already opened for this booking.');
    }

    const dispute = await Dispute.create({
      booking: bookingId,
      raisedBy: userId,
      reason,
      description,
      evidence: evidence || [],
      status: 'OPEN',
    });

    // Advance booking status to DISPUTED
    booking.status = BOOKING_STATUS.DISPUTED;
    await booking.save();

    // Notify the other party
    const counterpartId = isRequester ? booking.provider : booking.requester;
    const notif = await Notification.create({
      recipient: counterpartId,
      type: 'DISPUTE_UPDATE',
      title: 'Dispute Raised for Booking',
      message: `A dispute has been raised regarding booking #${booking._id.toString().slice(-6)}. Neighbourly admin team will mediate.`,
      link: isRequester ? `/provider/bookings/${booking._id}` : `/resident/bookings/${booking._id}`,
      relatedEntity: { entityType: 'Dispute', entityId: dispute._id },
    });
    emitToUser(counterpartId, 'new_notification', notif);

    return dispute;
  }

  static async getUserDisputes(userId) {
    const disputes = await Dispute.find({ raisedBy: userId })
      .populate('booking')
      .sort({ createdAt: -1 });
    return disputes;
  }

  static async getAllDisputes({ status, page = 1, limit = 20 }) {
    const filter = status ? { status } : {};
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [disputes, total] = await Promise.all([
      Dispute.find(filter)
        .populate('raisedBy', 'name email role')
        .populate({
          path: 'booking',
          populate: [
            { path: 'requester', select: 'name email phone' },
            { path: 'provider', select: 'name email phone' },
            { path: 'payment' },
          ],
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Dispute.countDocuments(filter),
    ]);

    return {
      disputes,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  static async resolveDispute(disputeId, adminUserId, { status, resolution, adminNotes }) {
    const dispute = await Dispute.findById(disputeId).populate('booking');
    if (!dispute) {
      throw ApiError.notFound('Dispute not found');
    }

    dispute.status = status;
    dispute.resolution = resolution;
    dispute.adminNotes = adminNotes || dispute.adminNotes;
    dispute.resolvedAt = new Date();
    dispute.resolvedBy = adminUserId;
    await dispute.save();

    // If resolved, update booking back to COMPLETED or CANCELLED based on resolution
    const booking = dispute.booking;
    if (booking) {
      if (status === 'RESOLVED') {
        booking.status = BOOKING_STATUS.COMPLETED;
      }
      await booking.save();
    }

    // Notify both parties of resolution
    const participants = [booking.requester, booking.provider];
    for (const uid of participants) {
      const notif = await Notification.create({
        recipient: uid,
        type: 'DISPUTE_UPDATE',
        title: `Dispute ${status}`,
        message: `Dispute #${dispute._id.toString().slice(-6)} has been updated: ${resolution}`,
        link: `/resident/bookings/${booking._id}`,
        relatedEntity: { entityType: 'Dispute', entityId: dispute._id },
      });
      emitToUser(uid, 'new_notification', notif);
    }

    return dispute;
  }
}
