import { User } from '../models/User.js';
import { ProviderProfile } from '../models/ProviderProfile.js';
import { Booking, BOOKING_STATUS } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Dispute } from '../models/Dispute.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/apiError.js';
import { emitToUser } from '../sockets/socketHandler.js';

export class AdminService {
  /**
   * Aggregates platform statistics and trend data for Recharts visual analytics
   */
  static async getDashboardAnalytics() {
    const [
      totalUsers,
      totalProviders,
      verifiedProviders,
      pendingVerifications,
      activeBookings,
      completedBookings,
      openDisputes,
      payments,
    ] = await Promise.all([
      User.countDocuments({ role: 'RESIDENT' }),
      ProviderProfile.countDocuments(),
      ProviderProfile.countDocuments({ verificationStatus: 'VERIFIED' }),
      ProviderProfile.countDocuments({ verificationStatus: { $in: ['PENDING', 'IN_REVIEW'] } }),
      Booking.countDocuments({
        status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.PAID, BOOKING_STATUS.IN_PROGRESS] },
      }),
      Booking.countDocuments({ status: BOOKING_STATUS.COMPLETED }),
      Dispute.countDocuments({ status: { $in: ['OPEN', 'UNDER_REVIEW'] } }),
      Payment.find({ status: 'CAPTURED' }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Bookings by Category Aggregation
    const categoryAggregation = await Booking.aggregate([
      {
        $group: {
          _id: '$serviceCategory',
          count: { $sum: 1 },
          volume: { $sum: '$amount' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // Trend simulation: last 7 days bookings count & revenue
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const bookingTrends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          bookings: { $sum: 1 },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      metrics: {
        totalUsers,
        totalProviders,
        verifiedProviders,
        pendingVerifications,
        activeBookings,
        completedBookings,
        totalRevenue,
        openDisputes,
      },
      charts: {
        categoryDistribution: categoryAggregation.map((c) => ({
          name: c._id || 'General',
          count: c.count,
          volume: c.volume,
        })),
        trends: bookingTrends.map((t) => ({
          date: t._id,
          bookings: t.bookings,
          revenue: t.amount,
        })),
      },
    };
  }

  /**
   * Provider verification queue
   */
  static async getVerificationQueue({ status = 'IN_REVIEW', page = 1, limit = 20 }) {
    const filter = status === 'ALL' ? {} : { verificationStatus: status };
    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      ProviderProfile.find(filter)
        .populate('user', 'name email phone neighborhood profileImage createdAt')
        .populate('services')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      ProviderProfile.countDocuments(filter),
    ]);

    return {
      profiles,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Approve or reject a provider's verification
   */
  static async updateProviderVerification(profileId, { status, adminNotes }) {
    const profile = await ProviderProfile.findById(profileId).populate('user');
    if (!profile) {
      throw ApiError.notFound('Provider profile not found');
    }

    if (!['VERIFIED', 'REJECTED', 'IN_REVIEW'].includes(status)) {
      throw ApiError.badRequest('Invalid verification status');
    }

    profile.verificationStatus = status;
    profile.verificationNotes = adminNotes || profile.verificationNotes;
    profile.recalculateTrustScore();
    await profile.save();

    // Send Notification to provider
    const isApproved = status === 'VERIFIED';
    const notif = await Notification.create({
      recipient: profile.user._id,
      type: 'VERIFICATION_UPDATE',
      title: isApproved ? 'Congratulations! Profile Verified' : 'Verification Status Updated',
      message: isApproved
        ? 'Your profile has been verified! You now carry the official Neighbourly Verified Provider badge.'
        : `Your verification submission was reviewed: ${adminNotes || status}`,
      link: '/provider/dashboard',
      relatedEntity: { entityType: 'ProviderProfile', entityId: profile._id },
    });
    emitToUser(profile.user._id, 'new_notification', notif);

    return profile;
  }

  /**
   * User Management (View, Suspend, Activate)
   */
  static async listUsers({ role, status, search, page = 1, limit = 20 }) {
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.accountStatus = status;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { neighborhood: new RegExp(search, 'i') },
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async updateUserStatus(userId, { accountStatus }) {
    if (!['ACTIVE', 'SUSPENDED'].includes(accountStatus)) {
      throw ApiError.badRequest('Invalid status. Must be ACTIVE or SUSPENDED.');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { accountStatus },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }
}
