import { ProviderProfile } from '../models/ProviderProfile.js';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { ApiError } from '../utils/apiError.js';
import { Notification } from '../models/Notification.js';

export class ProviderService {
  static async searchProviders(queryParams = {}) {
    const {
      serviceId,
      category,
      neighborhood,
      keyword,
      verifiedOnly,
      minRating,
      maxPrice,
      day,
      timeSlot,
      sortBy = 'trustScore', // trustScore, rating, price_asc, price_desc
      page = 1,
      limit = 10,
    } = queryParams;

    const filter = {
      'availability.isAcceptingRequests': true,
    };

    if (verifiedOnly === 'true' || verifiedOnly === true) {
      filter.verificationStatus = 'VERIFIED';
    }

    if (neighborhood) {
      filter.neighborhood = new RegExp(neighborhood, 'i');
    }

    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    if (maxPrice) {
      filter['pricing.hourlyRate'] = { $lte: parseFloat(maxPrice) };
    }

    if (day) {
      filter['availability.days'] = day;
    }

    if (timeSlot) {
      filter['availability.timeSlots'] = timeSlot;
    }

    if (serviceId) {
      filter.services = serviceId;
    }

    if (keyword) {
      filter.$or = [
        { skills: { $in: [new RegExp(keyword, 'i')] } },
        { bio: new RegExp(keyword, 'i') },
      ];
    }

    const sortOptions = {};
    if (sortBy === 'rating') sortOptions.rating = -1;
    else if (sortBy === 'price_asc') sortOptions['pricing.hourlyRate'] = 1;
    else if (sortBy === 'price_desc') sortOptions['pricing.hourlyRate'] = -1;
    else if (sortBy === 'completedBookings') sortOptions.completedBookings = -1;
    else sortOptions.trustScore = -1; // Default: prioritize trust and verification

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [providers, total] = await Promise.all([
      ProviderProfile.find(filter)
        .populate('user', 'name email phone neighborhood profileImage')
        .populate('services', 'name category icon')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      ProviderProfile.countDocuments(filter),
    ]);

    return {
      providers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  static async getProviderById(providerId) {
    let profile = await ProviderProfile.findById(providerId)
      .populate('user', 'name email phone neighborhood profileImage')
      .populate('services');

    if (!profile) {
      // Check if passed ID was the user ID instead
      profile = await ProviderProfile.findOne({ user: providerId })
        .populate('user', 'name email phone neighborhood profileImage')
        .populate('services');
    }

    if (!profile) {
      throw ApiError.notFound('Provider profile not found');
    }

    // Fetch verified reviews for this provider
    const reviews = await Review.find({ provider: profile.user._id })
      .populate('reviewer', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      profile,
      reviews,
    };
  }

  static async getMyProfile(userId) {
    const profile = await ProviderProfile.findOne({ user: userId })
      .populate('user', 'name email phone neighborhood profileImage')
      .populate('services');

    if (!profile) {
      throw ApiError.notFound('Provider profile not found for this account.');
    }
    return profile;
  }

  static async updateMyProfile(userId, updateData) {
    const profile = await ProviderProfile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('Provider profile not found');
    }

    Object.assign(profile, updateData);
    profile.recalculateTrustScore();
    await profile.save();

    return ProviderProfile.findById(profile._id)
      .populate('user', 'name email phone neighborhood profileImage')
      .populate('services');
  }

  static async submitVerification(userId, { documentTitle, documentUrl, notes }) {
    const profile = await ProviderProfile.findOne({ user: userId });
    if (!profile) {
      throw ApiError.notFound('Provider profile not found');
    }

    profile.verificationDocuments.push({
      title: documentTitle,
      fileUrl: documentUrl,
      uploadedAt: new Date(),
    });
    profile.verificationStatus = 'IN_REVIEW';
    if (notes) {
      profile.verificationNotes = notes;
    }
    profile.recalculateTrustScore();
    await profile.save();

    // Create Notification for admin or user
    await Notification.create({
      recipient: userId,
      type: 'VERIFICATION_UPDATE',
      title: 'Verification Documents Submitted',
      message: 'Your documents have been submitted to Neighbourly administrators for review.',
      link: '/provider/dashboard',
    });

    return profile;
  }
}
