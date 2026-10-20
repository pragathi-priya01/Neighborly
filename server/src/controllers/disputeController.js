import { DisputeService } from '../services/disputeService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class DisputeController {
  static async create(req, res, next) {
    try {
      const dispute = await DisputeService.createDispute(req.user._id, req.body);
      return ApiResponse.created(res, dispute, 'Dispute filed. Admin will review the case.');
    } catch (error) {
      next(error);
    }
  }

  static async getMyDisputes(req, res, next) {
    try {
      const disputes = await DisputeService.getUserDisputes(req.user._id);
      return ApiResponse.success(res, disputes);
    } catch (error) {
      next(error);
    }
  }

  static async listAll(req, res, next) {
    try {
      const result = await DisputeService.getAllDisputes(req.query);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async resolve(req, res, next) {
    try {
      const updated = await DisputeService.resolveDispute(req.params.id, req.user._id, req.body);
      return ApiResponse.success(res, updated, 'Dispute resolution recorded');
    } catch (error) {
      next(error);
    }
  }
}
