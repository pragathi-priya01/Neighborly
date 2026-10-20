import { PaymentService } from '../services/paymentService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class PaymentController {
  static async createOrder(req, res, next) {
    try {
      const order = await PaymentService.createOrder(req.params.bookingId, req.user._id);
      return ApiResponse.success(res, order, 'Razorpay order created');
    } catch (error) {
      next(error);
    }
  }

  static async verify(req, res, next) {
    try {
      const result = await PaymentService.verifyPayment(req.user._id, req.body);
      return ApiResponse.success(res, result, 'Payment verified successfully');
    } catch (error) {
      next(error);
    }
  }

  static async webhook(req, res, next) {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const result = await PaymentService.handleWebhook(req.rawBody, signature, req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
