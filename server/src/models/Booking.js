import mongoose from 'mongoose';

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAID: 'PAID',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
};

export const ALLOWED_TRANSITIONS = {
  [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.REJECTED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.ACCEPTED]: [BOOKING_STATUS.PAYMENT_PENDING, BOOKING_STATUS.PAID, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.PAYMENT_PENDING]: [BOOKING_STATUS.PAID, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.PAID]: [BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.DISPUTED],
  [BOOKING_STATUS.IN_PROGRESS]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.DISPUTED],
  [BOOKING_STATUS.COMPLETED]: [BOOKING_STATUS.DISPUTED], // Can be disputed post completion
  [BOOKING_STATUS.REJECTED]: [],
  [BOOKING_STATUS.CANCELLED]: [],
  [BOOKING_STATUS.DISPUTED]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED], // resolved by admin
};

const bookingSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      default: null,
    },
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderOffer',
      default: null,
    },
    serviceCategory: {
      type: String,
      default: 'General',
    },
    scheduledDate: {
      type: String,
      required: true,
    },
    scheduledTime: {
      type: String,
      default: 'Morning',
    },
    amount: {
      type: Number,
      required: true,
      min: [50, 'Booking amount must be at least ₹50'],
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
      index: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Method to validate if a state transition is legal
bookingSchema.methods.canTransitionTo = function (nextStatus) {
  const allowed = ALLOWED_TRANSITIONS[this.status] || [];
  return allowed.includes(nextStatus);
};

export const Booking = mongoose.model('Booking', bookingSchema);
