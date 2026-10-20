import { ProviderService } from '../services/providerService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class ProviderController {
  static async search(req, res, next) {
    try {
      const results = await ProviderService.searchProviders(req.query);
      return ApiResponse.success(res, results);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await ProviderService.getProviderById(req.params.id);
      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async getMyProfile(req, res, next) {
    try {
      const profile = await ProviderService.getMyProfile(req.user._id);
      return ApiResponse.success(res, profile);
    } catch (error) {
      next(error);
    }
  }

  static async updateMyProfile(req, res, next) {
    try {
      const updated = await ProviderService.updateMyProfile(req.user._id, req.body);
      return ApiResponse.success(res, updated, 'Provider profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async submitVerification(req, res, next) {
    try {
      const updated = await ProviderService.submitVerification(req.user._id, req.body);
      return ApiResponse.success(res, updated, 'Verification documents submitted for review');
    } catch (error) {
      next(error);
    }
  }
}
