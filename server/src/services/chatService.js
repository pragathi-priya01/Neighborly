import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/apiError.js';
import { emitToConversation, emitToUser } from '../sockets/socketHandler.js';

export class ChatService {
  static async getConversations(userId) {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name email neighborhood profileImage role')
      .populate('booking', 'serviceCategory scheduledDate status amount')
      .sort({ lastMessageAt: -1 });

    return conversations.map((conv) => {
      const convObj = conv.toObject();
      const otherParticipant = convObj.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );
      const unread = conv.unreadCounts?.get(userId.toString()) || 0;
      return {
        ...convObj,
        otherParticipant,
        unreadCount: unread,
      };
    });
  }

  static async getConversationById(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name email neighborhood profileImage role')
      .populate('booking', 'serviceCategory scheduledDate status amount');

    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    const isMember = conversation.participants.some(
      (p) => p._id.toString() === userId.toString()
    );
    if (!isMember) {
      throw ApiError.forbidden('You are not authorized to view this conversation');
    }

    // Reset unread count for current user
    if (conversation.unreadCounts?.has(userId.toString())) {
      conversation.unreadCounts.set(userId.toString(), 0);
      await conversation.save();
    }

    return conversation;
  }

  static async getMessages(conversationId, userId, { page = 1, limit = 50 }) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    const isMember = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isMember) {
      throw ApiError.forbidden('You are not a participant in this conversation');
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversationId })
        .populate('sender', 'name profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Message.countDocuments({ conversation: conversationId }),
    ]);

    // Mark messages as read
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, read: false },
      { read: true }
    );

    return {
      messages: messages.reverse(), // Chronological order
      total,
      page: pageNum,
    };
  }

  static async sendMessage(conversationId, senderUserId, text) {
    if (!text || text.trim().length === 0) {
      throw ApiError.badRequest('Message content cannot be empty');
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    const isMember = conversation.participants.some(
      (p) => p.toString() === senderUserId.toString()
    );
    if (!isMember) {
      throw ApiError.forbidden('You are not a participant in this conversation');
    }

    // Create message in MongoDB (source of truth)
    const message = await Message.create({
      conversation: conversationId,
      sender: senderUserId,
      text: text.trim(),
    });

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name profileImage');

    // Update conversation metadata
    conversation.lastMessage = text.trim();
    conversation.lastMessageSender = senderUserId;
    conversation.lastMessageAt = new Date();

    // Increment unread count for recipient
    const recipientId = conversation.participants.find(
      (p) => p.toString() !== senderUserId.toString()
    );

    if (recipientId) {
      const recipientKey = recipientId.toString();
      const currentUnread = conversation.unreadCounts?.get(recipientKey) || 0;
      conversation.unreadCounts.set(recipientKey, currentUnread + 1);
    }
    await conversation.save();

    // Real-time broadcast to conversation room
    emitToConversation(conversationId, 'new_message', populatedMessage);

    // If recipient is not in conversation view, send notification event
    if (recipientId) {
      emitToUser(recipientId, 'unread_message_ping', {
        conversationId,
        message: populatedMessage,
      });
    }

    return populatedMessage;
  }
}
