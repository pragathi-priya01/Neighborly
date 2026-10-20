import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let ioInstance = null;

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        // Allow unauthenticated connection for public status if needed, but tag as guest
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.user = decoded; // { id, role, email }
      next();
    } catch (err) {
      logger.warn({ err: err.message }, 'Socket authentication error');
      // Still proceed, but without authenticated user context
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id, user: socket.user?.id }, 'Client connected to Socket.IO');

    if (socket.user?.id) {
      // Automatically join the user's private notification & update room
      socket.join(`user:${socket.user.id}`);
      logger.debug(`User ${socket.user.id} joined personal room user:${socket.user.id}`);
    }

    // Join a specific conversation room
    socket.on('join_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`);
        logger.debug(`Socket ${socket.id} joined conversation:${conversationId}`);
      }
    });

    // Leave a specific conversation room
    socket.on('leave_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
        logger.debug(`Socket ${socket.id} left conversation:${conversationId}`);
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId, userName }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        conversationId,
        userId: socket.user?.id,
        userName
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        conversationId,
        userId: socket.user?.id
      });
    });

    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, reason }, 'Client disconnected from Socket.IO');
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = () => {
  return ioInstance;
};

// Helper to emit events to a user's private room
export const emitToUser = (userId, event, data) => {
  if (ioInstance && userId) {
    ioInstance.to(`user:${userId.toString()}`).emit(event, data);
  }
};

// Helper to emit events to a conversation room
export const emitToConversation = (conversationId, event, data) => {
  if (ioInstance && conversationId) {
    ioInstance.to(`conversation:${conversationId.toString()}`).emit(event, data);
  }
};
