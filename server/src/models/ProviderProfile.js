import mongoose from 'mongoose';

const providerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],
    experienceYears: {
      type: Number,
      default: 1,
      min: 0,
      max: 50,
    },
    pricing: {
      hourlyRate: { type: Number, default: 400 },
      baseConsultationFee: { type: Number, default: 150 },
    },
    neighborhood: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },
    serviceRadiusKm: {
      type: Number,
      default: 10,
      min: 1,
      max: 50,
    },
    availability: {
      days: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
      timeSlots: {
        type: [String],
        default: ['Morning', 'Afternoon', 'Evening'], // 'Morning', 'Afternoon', 'Evening'
      },
      isAvailableNow: {
        type: Boolean,
        default: true,
      },
      isAcceptingRequests: {
        type: Boolean,
        default: true,
      },
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'IN_REVIEW', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    verificationDocuments: [
      {
        title: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    completedBookings: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 100, // percentage 0 - 100
    },
    trustScore: {
      type: Number,
      default: 50, // 0 - 100 transparently computed composite metric
    },
  },
  {
    timestamps: true,
  }
);

// Helper to recalculate trust score transparently
providerProfileSchema.methods.recalculateTrustScore = function () {
  // Trust formula:
  // Base 30
  // + 35 for VERIFIED status
  // + (rating / 5) * 20
  // + min(completedBookings * 1.5, 15)
  let score = 30;
  if (this.verificationStatus === 'VERIFIED') score += 35;
  if (this.reviewCount > 0) {
    score += (this.rating / 5) * 20;
  } else {
    score += 10;
  }
  score += Math.min(this.completedBookings * 1.5, 15);
  this.trustScore = Math.min(100, Math.round(score));
  return this.trustScore;
};

export const ProviderProfile = mongoose.model('ProviderProfile', providerProfileSchema);
