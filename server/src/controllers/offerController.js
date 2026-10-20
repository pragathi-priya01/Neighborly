import { OfferService } from '../services/offerService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class OfferController {
  static async submit(req, res, next) {
    try {
      const offer = await OfferService.submitOffer(
        req.user._id,
        req.params.requestId,
        req.body
      );
      return ApiResponse.created(res, offer, 'Offer submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async accept(req, res, next) {
    try {
      const result = await OfferService.acceptOffer(req.user._id, req.params.offerId);
      return ApiResponse.success(res, result, 'Offer accepted and booking created');
    } catch (error) {
      next(error);
    }
  }

  static async withdraw(req, res, next) {
    try {
      const result = await OfferService.withdrawOffer(req.user._id, req.params.offerId);
      return ApiResponse.success(res, result, 'Offer withdrawn');
    } catch (error) {
      next(error);
    }
  }
}
