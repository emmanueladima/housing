import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  sendMessage,
  getMessages,
  getUnreadCount,
} from '../controllers/messageController.js';
import { messageLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

router.get('/unread/count', getUnreadCount);
router.post('/', messageLimiter, sendMessage);
router.get('/:threadId', getMessages);

export default router;

