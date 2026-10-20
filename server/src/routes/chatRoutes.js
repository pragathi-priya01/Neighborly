import express from 'express';
import { ChatController } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/conversations', ChatController.listConversations);
router.get('/conversations/:id', ChatController.getConversation);
router.get('/conversations/:id/messages', ChatController.getMessages);
router.post('/conversations/:id/messages', ChatController.sendMessage);

export default router;
