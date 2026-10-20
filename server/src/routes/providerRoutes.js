import express from 'express';
import { ProviderController } from '../controllers/providerController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProviderProfileSchema, submitVerificationSchema } from '../validators/providerValidator.js';

const router = express.Router();

// Public routes
router.get('/', ProviderController.search);
router.get('/:id', ProviderController.getById);

// Provider authenticated routes
router.get('/me/profile', authenticate, authorize('PROVIDER'), ProviderController.getMyProfile);
router.patch('/me/profile', authenticate, authorize('PROVIDER'), validate(updateProviderProfileSchema), ProviderController.updateMyProfile);
router.post('/me/verify', authenticate, authorize('PROVIDER'), validate(submitVerificationSchema), ProviderController.submitVerification);

export default router;
