import express from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Strict RBAC: All Admin routes require ADMIN role verified by backend token
router.use(authenticate, authorize('ADMIN'));

router.get('/analytics', AdminController.getAnalytics);
router.get('/verifications', AdminController.getVerificationQueue);
router.patch('/verifications/:id', AdminController.updateVerification);
router.get('/users', AdminController.listUsers);
router.patch('/users/:id/status', AdminController.updateUserStatus);

export default router;
