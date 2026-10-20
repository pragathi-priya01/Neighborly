import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Service category is required'],
      trim: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    preferredDate: {
      type: String, // YYYY-MM-DD or descriptive date
      required: true,
    },
    preferredTime: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Flexible'],
      default: 'Morning',
    },
    budget: {
      type: Number,
      required: true,
      min: [50, 'Budget must be at least ₹50'],
    },
    neighborhood: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'OFFERS_RECEIVED', 'ASSIGNED', 'CANCELLED', 'COMPLETED'],
      default: 'OPEN',
      index: true,
    },
    selectedOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderOffer',
      default: null,
    },
    aiAssisted: {
      type: Boolean,
      default: false,
    },
    aiExtractedData: {
      rawPrompt: String,
      confidence: Number,
      extractedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
