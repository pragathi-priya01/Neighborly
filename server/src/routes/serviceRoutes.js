import express from 'express';
import { ServiceController } from '../controllers/serviceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', ServiceController.list);
router.get('/:id', ServiceController.getById);

// Admin-only management routes
router.post('/', authenticate, authorize('ADMIN'), ServiceController.create);
router.put('/:id', authenticate, authorize('ADMIN'), ServiceController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), ServiceController.delete);

export default router;
