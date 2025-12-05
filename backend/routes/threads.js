import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    createThread,
    getThreads,
    getThread,
    markThreadRead,
} from '../controllers/threadController.js';
import { threadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .post(threadLimiter, createThread)
    .get(getThreads);

router.route('/:id')
    .get(getThread);

router.route('/:id/read')
    .put(markThreadRead);

export default router;
