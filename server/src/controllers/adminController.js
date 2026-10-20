import { AdminService } from '../services/adminService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AdminController {
  static async getAnalytics(req, res, next) {
    try {
      const data = await AdminService.getDashboardAnalytics();
      return ApiResponse.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async getVerificationQueue(req, res, next) {
    try {
      const result = await AdminService.getVerificationQueue(req.query);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async updateVerification(req, res, next) {
    try {
      const updated = await AdminService.updateProviderVerification(req.params.id, req.body);
      return ApiResponse.success(res, updated, 'Verification status updated');
    } catch (error) {
      next(error);
    }
  }

  static async listUsers(req, res, next) {
    try {
      const result = await AdminService.listUsers(req.query);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req, res, next) {
    try {
      const updated = await AdminService.updateUserStatus(req.params.id, req.body);
      return ApiResponse.success(res, updated, 'User account status updated');
    } catch (error) {
      next(error);
    }
  }
}
