import express from 'express';
import { RequestController } from '../controllers/requestController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createServiceRequestSchema } from '../validators/requestValidator.js';

const router = express.Router();

router.use(authenticate);

// Resident routes
router.post('/', authorize('RESIDENT'), validate(createServiceRequestSchema), RequestController.create);
router.get('/my', authorize('RESIDENT'), RequestController.getMyRequests);
router.patch('/:id/cancel', authorize('RESIDENT'), RequestController.cancel);

// Provider routes
router.get('/feed', authorize('PROVIDER'), RequestController.getOpenRequests);

// Shared authenticated view
router.get('/:id', RequestController.getById);

export default router;
