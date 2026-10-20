import express from 'express';
import { AIController } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Parse natural language request
router.post('/extract-request', AIController.extractRequest);

// Hybrid provider matching calculation
router.post('/match-providers', AIController.matchProviders);

export default router;
