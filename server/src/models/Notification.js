import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'OFFER_RECEIVED',
        'OFFER_ACCEPTED',
        'BOOKING_CREATED',
        'BOOKING_ACCEPTED',
        'BOOKING_REJECTED',
        'BOOKING_STATUS',
        'PAYMENT_SUCCESS',
        'NEW_MESSAGE',
        'REVIEW_RECEIVED',
        'DISPUTE_UPDATE',
        'VERIFICATION_UPDATE',
        'SYSTEM',
      ],
      default: 'SYSTEM',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: '',
    },
    relatedEntity: {
      entityType: { type: String, default: '' },
      entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
