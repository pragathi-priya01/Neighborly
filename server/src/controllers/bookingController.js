import { BookingService } from '../services/bookingService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class BookingController {
  static async create(req, res, next) {
    try {
      const booking = await BookingService.createDirectBooking(req.user._id, req.body);
      return ApiResponse.created(res, booking, 'Booking request created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async list(req, res, next) {
    try {
      const result = await BookingService.getBookings(req.user._id, req.user.role, req.query);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const booking = await BookingService.getBookingById(req.params.id, req.user._id, req.user.role);
      return ApiResponse.success(res, booking);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const updated = await BookingService.updateStatus(
        req.params.id,
        req.user._id,
        req.user.role,
        req.body
      );
      return ApiResponse.success(res, updated, `Booking status updated to ${updated.status}`);
    } catch (error) {
      next(error);
    }
  }
}
