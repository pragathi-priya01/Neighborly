import { Notification } from '../models/Notification.js';

export class NotificationService {
  static async getUserNotifications(userId, { unreadOnly = false, limit = 30 }) {
    const filter = { recipient: userId };
    if (unreadOnly) {
      filter.read = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit, 10)),
      Notification.countDocuments({ recipient: userId, read: false }),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }

  static async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true },
      { new: true }
    );
    return notification;
  }

  static async markAllAsRead(userId) {
    await Notification.updateMany({ recipient: userId, read: false }, { read: true });
    return { success: true };
  }
}
