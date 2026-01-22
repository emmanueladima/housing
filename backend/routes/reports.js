import express from 'express';
import { protect, checkAdmin } from '../middleware/auth.js';
import { createReport, getReports, updateReportStatus } from '../controllers/reportController.js';

const router = express.Router();

router.use(protect);

router.post('/', createReport);
router.get('/', checkAdmin, getReports);
router.put('/:id/status', checkAdmin, updateReportStatus);

export default router;
