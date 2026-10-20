import { ChatService } from '../services/chatService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class ChatController {
  static async listConversations(req, res, next) {
    try {
      const conversations = await ChatService.getConversations(req.user._id);
      return ApiResponse.success(res, conversations);
    } catch (error) {
      next(error);
    }
  }

  static async getConversation(req, res, next) {
    try {
      const conversation = await ChatService.getConversationById(req.params.id, req.user._id);
      return ApiResponse.success(res, conversation);
    } catch (error) {
      next(error);
    }
  }

  static async getMessages(req, res, next) {
    try {
      const messages = await ChatService.getMessages(req.params.id, req.user._id, req.query);
      return ApiResponse.success(res, messages);
    } catch (error) {
      next(error);
    }
  }

  static async sendMessage(req, res, next) {
    try {
      const message = await ChatService.sendMessage(req.params.id, req.user._id, req.body.text);
      return ApiResponse.created(res, message, 'Message sent');
    } catch (error) {
      next(error);
    }
  }
}
