import express from 'express';
import { OfferController } from '../controllers/offerController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createProviderOfferSchema } from '../validators/requestValidator.js';

const router = express.Router();

router.use(authenticate);

// Provider submits an offer for a request
router.post('/request/:requestId', authorize('PROVIDER'), validate(createProviderOfferSchema), OfferController.submit);

// Resident accepts a provider's offer
router.post('/:offerId/accept', authorize('RESIDENT'), OfferController.accept);

// Provider withdraws their offer
router.post('/:offerId/withdraw', authorize('PROVIDER'), OfferController.withdraw);

export default router;
