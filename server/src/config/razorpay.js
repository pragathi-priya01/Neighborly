import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let razorpayInstance = null;

export const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    try {
      razorpayInstance = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id',
        key_secret: env.RAZORPAY_KEY_SECRET || 'placeholder_secret_key',
      });
      logger.info(`Razorpay SDK initialized in ${env.RAZORPAY_MODE} mode`);
    } catch (err) {
      logger.warn({ err: err.message }, 'Failed to initialize Razorpay instance');
    }
  }
  return razorpayInstance;
};

/**
 * Verifies Razorpay checkout signature HMAC SHA256:
 * hmac_sha256(order_id + "|" + razorpay_payment_id, secret) == razorpay_signature
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const secret = env.RAZORPAY_KEY_SECRET || 'placeholder_secret_key';
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

/**
 * Verifies Razorpay Webhook signature:
 * hmac_sha256(rawRequestBody, webhookSecret) == x-razorpay-signature
 */
export const verifyWebhookSignature = (rawBody, signature) => {
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || 'placeholder_webhook_secret';
  if (!signature || !rawBody) return false;

  const generatedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return generatedSignature === signature;
};
