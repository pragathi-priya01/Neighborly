import { RequestService } from '../services/requestService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class RequestController {
  static async create(req, res, next) {
    try {
      const result = await RequestService.createRequest(req.user._id, req.body);
      return ApiResponse.created(res, result, 'Service request published successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMyRequests(req, res, next) {
    try {
      const requests = await RequestService.getMyRequests(req.user._id);
      return ApiResponse.success(res, requests);
    } catch (error) {
      next(error);
    }
  }

  static async getOpenRequests(req, res, next) {
    try {
      const requests = await RequestService.getOpenRequestsForProvider(req.user._id);
      return ApiResponse.success(res, requests);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const result = await RequestService.getRequestById(req.params.id, req.user._id, req.user.role);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req, res, next) {
    try {
      const result = await RequestService.cancelRequest(req.params.id, req.user._id);
      return ApiResponse.success(res, result, 'Service request cancelled');
    } catch (error) {
      next(error);
    }
  }
}
