import express from 'express';
import { PaymentController } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Razorpay Webhook endpoint (Public, verified via cryptographic HMAC header)
router.post('/webhook', PaymentController.webhook);

// Authenticated Resident Payment Endpoints
router.post('/order/:bookingId', authenticate, PaymentController.createOrder);
router.post('/verify', authenticate, PaymentController.verify);

export default router;
