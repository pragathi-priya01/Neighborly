import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let razorpayInstance = null;

export const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      logger.warn('Razorpay credentials missing in environment variables');
      return null;
    }

    try {
      razorpayInstance = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
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
  const secret = env.RAZORPAY_KEY_SECRET;
  if (!secret || !orderId || !paymentId || !signature) return false;

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
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;
  if (!signature || !rawBody || !webhookSecret) return false;

  const generatedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return generatedSignature === signature;
};
