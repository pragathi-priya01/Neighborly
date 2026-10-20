import mongoose from 'mongoose';

const providerOfferSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
      index: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    proposedPrice: {
      type: Number,
      required: [true, 'Proposed price is required'],
      min: [50, 'Price must be at least ₹50'],
    },
    message: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    estimatedServiceTime: {
      type: String,
      trim: true,
      default: '1-2 hours',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
      default: 'PENDING',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate offers from the same provider on the same request
providerOfferSchema.index({ request: 1, provider: 1 }, { unique: true });

export const ProviderOffer = mongoose.model('ProviderOffer', providerOfferSchema);
