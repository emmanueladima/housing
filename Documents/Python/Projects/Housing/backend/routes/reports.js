import express from 'express';
import { protect } from '../middleware/auth.js';
import { createReport, getReports } from '../controllers/reportController.js';

const router = express.Router();

router.use(protect);

router.post('/', createReport);
router.get('/', getReports); // Should be admin protected

export default router;
