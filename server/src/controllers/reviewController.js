import { ReviewService } from '../services/reviewService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class ReviewController {
  static async create(req, res, next) {
    try {
      const review = await ReviewService.createReview(req.user._id, req.body);
      return ApiResponse.created(res, review, 'Review submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getByProvider(req, res, next) {
    try {
      const reviews = await ReviewService.getProviderReviews(req.params.providerId);
      return ApiResponse.success(res, reviews);
    } catch (error) {
      next(error);
    }
  }
}
