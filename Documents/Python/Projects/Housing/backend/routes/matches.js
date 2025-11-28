import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getMyMatches,
    requestMatch,
    respondToMatch,
} from '../controllers/matchController.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyMatches);
router.post('/request', requestMatch);
router.put('/:id/respond', respondToMatch);

export default router;
