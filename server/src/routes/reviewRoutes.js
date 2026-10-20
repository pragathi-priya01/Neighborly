import express from 'express';
import { ReviewController } from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createReviewSchema } from '../validators/reviewValidator.js';

const router = express.Router();

// Public: view reviews for a provider
router.get('/provider/:providerId', ReviewController.getByProvider);

// Resident submits review for completed booking
router.post('/', authenticate, authorize('RESIDENT'), validate(createReviewSchema), ReviewController.create);

export default router;
