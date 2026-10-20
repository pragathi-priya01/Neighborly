import { NotificationService } from '../services/notificationService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class NotificationController {
  static async list(req, res, next) {
    try {
      const result = await NotificationService.getUserNotifications(req.user._id, req.query);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const updated = await NotificationService.markAsRead(req.params.id, req.user._id);
      return ApiResponse.success(res, updated, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      await NotificationService.markAllAsRead(req.user._id);
      return ApiResponse.success(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}
