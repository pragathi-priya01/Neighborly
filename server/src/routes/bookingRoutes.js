import express from 'express';
import { BookingController } from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createDirectBookingSchema, updateBookingStatusSchema } from '../validators/bookingValidator.js';

const router = express.Router();

router.use(authenticate);

// Direct booking creation (Residents)
router.post('/', authorize('RESIDENT'), validate(createDirectBookingSchema), BookingController.create);

// List user bookings (Residents, Providers, Admins)
router.get('/', BookingController.list);

// Get single booking
router.get('/:id', BookingController.getById);

// Update status transition
router.patch('/:id/status', validate(updateBookingStatusSchema), BookingController.updateStatus);

export default router;
