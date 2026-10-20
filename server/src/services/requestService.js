import { ServiceRequest } from '../models/ServiceRequest.js';
import { ProviderProfile } from '../models/ProviderProfile.js';
import { ProviderOffer } from '../models/ProviderOffer.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/apiError.js';
import { emitToUser } from '../sockets/socketHandler.js';

export class RequestService {
  static async createRequest(userId, requestData) {
    const serviceRequest = await ServiceRequest.create({
      requester: userId,
      ...requestData,
      status: 'OPEN',
    });

    // Notify matching providers in the neighborhood or category asynchronously
    try {
      const matchingProfiles = await ProviderProfile.find({
        neighborhood: new RegExp(requestData.neighborhood, 'i'),
        verificationStatus: { $in: ['VERIFIED', 'IN_REVIEW', 'PENDING'] },
        'availability.isAcceptingRequests': true,
      }).select('user');

      for (const profile of matchingProfiles) {
        if (profile.user.toString() !== userId.toString()) {
          const notif = await Notification.create({
            recipient: profile.user,
            type: 'SYSTEM',
            title: `New Service Request in ${requestData.neighborhood}`,
            message: `A resident needs ${requestData.category}: "${requestData.description.substring(0, 60)}..."`,
            link: `/provider/requests/${serviceRequest._id}`,
            relatedEntity: {
              entityType: 'ServiceRequest',
              entityId: serviceRequest._id,
            },
          });
          emitToUser(profile.user, 'new_notification', notif);
        }
      }
    } catch {
      // Don't fail request creation if notification dispatch fails
    }

    return serviceRequest;
  }

  static async getMyRequests(userId) {
    const requests = await ServiceRequest.find({ requester: userId })
      .sort({ createdAt: -1 });

    // Attach offers count to each request
    const requestIds = requests.map((r) => r._id);
    const offers = await ProviderOffer.find({ request: { $in: requestIds } });

    const offersByRequest = {};
    for (const offer of offers) {
      offersByRequest[offer.request.toString()] = (offersByRequest[offer.request.toString()] || 0) + 1;
    }

    return requests.map((req) => ({
      ...req.toObject(),
      offersCount: offersByRequest[req._id.toString()] || 0,
    }));
  }

  static async getOpenRequestsForProvider(providerUserId) {
    const providerProfile = await ProviderProfile.findOne({ user: providerUserId }).populate('services');
    if (!providerProfile) {
      throw ApiError.forbidden('Only registered providers can view open requests');
    }

    const serviceCategories = providerProfile.services.map((s) => s.category);

    const query = {
      status: { $in: ['OPEN', 'OFFERS_RECEIVED'] },
    };

    // Filter by matching categories if provider has services configured
    if (serviceCategories.length > 0) {
      query.category = { $in: serviceCategories };
    }

    const openRequests = await ServiceRequest.find(query)
      .populate('requester', 'name neighborhood') // Omit sensitive phone/email
      .sort({ createdAt: -1 })
      .limit(30);

    // Check which ones this provider has already offered on
    const existingOffers = await ProviderOffer.find({
      provider: providerUserId,
      request: { $in: openRequests.map((r) => r._id) },
    });

    const offeredMap = {};
    for (const off of existingOffers) {
      offeredMap[off.request.toString()] = off;
    }

    return openRequests.map((req) => ({
      ...req.toObject(),
      hasOffered: !!offeredMap[req._id.toString()],
      myOffer: offeredMap[req._id.toString()] || null,
    }));
  }

  static async getRequestById(requestId, requestingUserId, role) {
    const request = await ServiceRequest.findById(requestId)
      .populate('requester', 'name email phone neighborhood profileImage');

    if (!request) {
      throw ApiError.notFound('Service request not found');
    }

    const isOwner = request.requester._id.toString() === requestingUserId.toString();

    // If resident is owner, load all provider offers with detailed provider profiles
    if (isOwner || role === 'ADMIN') {
      const offers = await ProviderOffer.find({ request: requestId })
        .populate('provider', 'name phone neighborhood profileImage')
        .sort({ proposedPrice: 1 });

      // Populate provider profile details (rating, trust score, verification) for each offer
      const providerUserIds = offers.map((o) => o.provider._id);
      const profiles = await ProviderProfile.find({ user: { $in: providerUserIds } });
      const profileMap = {};
      profiles.forEach((p) => {
        profileMap[p.user.toString()] = p;
      });

      const enrichedOffers = offers.map((offer) => ({
        ...offer.toObject(),
        providerProfile: profileMap[offer.provider._id.toString()] || null,
      }));

      return {
        request,
        offers: enrichedOffers,
        isOwner: true,
      };
    }

    // Provider viewing: sanitize sensitive requester phone/email
    const sanitizedRequest = {
      _id: request._id,
      category: request.category,
      title: request.title,
      description: request.description,
      preferredDate: request.preferredDate,
      preferredTime: request.preferredTime,
      budget: request.budget,
      neighborhood: request.neighborhood,
      status: request.status,
      createdAt: request.createdAt,
      requester: {
        name: request.requester.name,
        neighborhood: request.requester.neighborhood,
      },
    };

    const myOffer = await ProviderOffer.findOne({
      request: requestId,
      provider: requestingUserId,
    });

    return {
      request: sanitizedRequest,
      myOffer,
      isOwner: false,
    };
  }

  static async cancelRequest(requestId, userId) {
    const request = await ServiceRequest.findOne({ _id: requestId, requester: userId });
    if (!request) {
      throw ApiError.notFound('Request not found or access denied');
    }

    if (['ASSIGNED', 'COMPLETED'].includes(request.status)) {
      throw ApiError.badRequest('Cannot cancel a request that has already been assigned or completed.');
    }

    request.status = 'CANCELLED';
    await request.save();
    return request;
  }
}
