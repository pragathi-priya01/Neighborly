import { ProviderOffer } from '../models/ProviderOffer.js';
import { ServiceRequest } from '../models/ServiceRequest.js';
import { Booking, BOOKING_STATUS } from '../models/Booking.js';
import { Conversation } from '../models/Conversation.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/apiError.js';
import { emitToUser } from '../sockets/socketHandler.js';

export class OfferService {
  static async submitOffer(providerUserId, requestId, { proposedPrice, message, estimatedServiceTime }) {
    const request = await ServiceRequest.findById(requestId);
    if (!request) {
      throw ApiError.notFound('Service request not found');
    }

    if (!['OPEN', 'OFFERS_RECEIVED'].includes(request.status)) {
      throw ApiError.badRequest(`Cannot submit offer. Request is currently ${request.status}.`);
    }

    // Check if provider already submitted an offer
    const existingOffer = await ProviderOffer.findOne({
      request: requestId,
      provider: providerUserId,
    });

    if (existingOffer) {
      throw ApiError.conflict('You have already submitted an offer for this service request.');
    }

    const offer = await ProviderOffer.create({
      request: requestId,
      provider: providerUserId,
      proposedPrice,
      message,
      estimatedServiceTime,
      status: 'PENDING',
    });

    // Update request status if it was OPEN
    if (request.status === 'OPEN') {
      request.status = 'OFFERS_RECEIVED';
      await request.save();
    }

    // Notify requester
    const notif = await Notification.create({
      recipient: request.requester,
      type: 'OFFER_RECEIVED',
      title: 'New Offer Received!',
      message: `A provider has submitted an offer of ₹${proposedPrice} for your request "${request.category}".`,
      link: `/resident/requests/${request._id}`,
      relatedEntity: {
        entityType: 'ProviderOffer',
        entityId: offer._id,
      },
    });
    emitToUser(request.requester, 'new_notification', notif);
    emitToUser(request.requester, 'new_offer', { requestId: request._id, offer });

    return offer;
  }

  static async acceptOffer(residentUserId, offerId) {
    const offer = await ProviderOffer.findById(offerId).populate('request');
    if (!offer) {
      throw ApiError.notFound('Offer not found');
    }

    const request = offer.request;
    if (!request) {
      throw ApiError.notFound('Associated service request not found');
    }

    if (request.requester.toString() !== residentUserId.toString()) {
      throw ApiError.forbidden('You do not own this service request');
    }

    if (offer.status !== 'PENDING') {
      throw ApiError.badRequest(`This offer cannot be accepted because it is ${offer.status}`);
    }

    // 1. Mark this offer ACCEPTED
    offer.status = 'ACCEPTED';
    await offer.save();

    // 2. Reject all other pending offers for this request
    await ProviderOffer.updateMany(
      { request: request._id, _id: { $ne: offer._id }, status: 'PENDING' },
      { status: 'REJECTED' }
    );

    // 3. Mark request as ASSIGNED
    request.status = 'ASSIGNED';
    request.selectedOffer = offer._id;
    await request.save();

    // 4. Create Booking
    const booking = await Booking.create({
      requester: residentUserId,
      provider: offer.provider,
      request: request._id,
      offer: offer._id,
      serviceCategory: request.category,
      scheduledDate: request.preferredDate,
      scheduledTime: request.preferredTime,
      amount: offer.proposedPrice,
      status: BOOKING_STATUS.PAYMENT_PENDING,
      address: request.neighborhood,
      notes: request.description,
    });

    // 5. Create or get Conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [residentUserId, offer.provider] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [residentUserId, offer.provider],
        booking: booking._id,
        lastMessage: 'Booking created. You can now coordinate service details here.',
        lastMessageAt: new Date(),
      });
    } else {
      conversation.booking = booking._id;
      await conversation.save();
    }

    // 6. Notify provider
    const notif = await Notification.create({
      recipient: offer.provider,
      type: 'OFFER_ACCEPTED',
      title: 'Offer Accepted! Booking Created',
      message: `Your offer of ₹${offer.proposedPrice} for "${request.category}" was accepted by the resident.`,
      link: `/provider/bookings/${booking._id}`,
      relatedEntity: {
        entityType: 'Booking',
        entityId: booking._id,
      },
    });
    emitToUser(offer.provider, 'new_notification', notif);
    emitToUser(offer.provider, 'booking_created', booking);

    return {
      offer,
      booking,
      conversationId: conversation._id,
    };
  }

  static async withdrawOffer(providerUserId, offerId) {
    const offer = await ProviderOffer.findOne({ _id: offerId, provider: providerUserId });
    if (!offer) {
      throw ApiError.notFound('Offer not found or unauthorized');
    }

    if (offer.status !== 'PENDING') {
      throw ApiError.badRequest('Can only withdraw pending offers');
    }

    offer.status = 'WITHDRAWN';
    await offer.save();
    return offer;
  }
}
