import { AuthService } from '../services/authService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      return ApiResponse.created(res, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const result = await AuthService.getMe(req.user._id);
      return ApiResponse.success(res, result, 'User details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const result = await AuthService.updateProfile(req.user._id, req.body);
      return ApiResponse.success(res, result, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res) {
    return ApiResponse.success(res, null, 'Logged out successfully');
  }
}
