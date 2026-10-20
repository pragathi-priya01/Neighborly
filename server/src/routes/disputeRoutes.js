import express from 'express';
import { DisputeController } from '../controllers/disputeController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createDisputeSchema, resolveDisputeSchema } from '../validators/reviewValidator.js';

const router = express.Router();

router.use(authenticate);

// User files dispute
router.post('/', validate(createDisputeSchema), DisputeController.create);

// User lists their disputes
router.get('/my', DisputeController.getMyDisputes);

// Admin-only endpoints
router.get('/', authorize('ADMIN'), DisputeController.listAll);
router.patch('/:id/resolve', authorize('ADMIN'), validate(resolveDisputeSchema), DisputeController.resolve);

export default router;
