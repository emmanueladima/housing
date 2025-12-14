import express from 'express';
import { body, param } from 'express-validator';
import {
  submitApplication,
  quickApply,
  getPrefillData,
  getMyApplications,
  getReceivedApplications,
  getListingApplications,
  getApplication,
  updateApplicationStatus,
  bulkUpdateStatus,
  withdrawApplication,
  compareApplications,
  scheduleTour,
  confirmTour,
} from '../controllers/applicationController.js';
import { protect, checkLandlord } from '../middleware/auth.js';

const router = express.Router();

const applicationValidation = [
  body('listingId').notEmpty().withMessage('Listing ID is required'),
  body('moveInDate').isISO8601().withMessage('Valid move-in date is required'),
  body('leaseTerm')
    .isIn(['month-to-month', '6-months', '1-year', 'academic-year'])
    .withMessage('Valid lease term is required'),
];

const quickApplyValidation = [
  body('listingId').notEmpty().withMessage('Listing ID is required'),
];

const statusValidation = [
  body('status')
    .isIn(['submitted', 'under_review', 'interview_scheduled', 'approved', 'rejected', 'withdrawn'])
    .withMessage('Valid status is required'),
];

const bulkStatusValidation = [
  body('applicationIds').isArray({ min: 1 }).withMessage('Application IDs required'),
  body('status')
    .isIn(['submitted', 'under_review', 'interview_scheduled', 'approved', 'rejected'])
    .withMessage('Valid status is required'),
];

const tourValidation = [
  body('date').notEmpty().withMessage('Tour date is required'),
  body('time').notEmpty().withMessage('Tour time is required'),
];

// All routes are protected
router.use(protect);

// Applicant routes
router.post('/', applicationValidation, submitApplication);
router.post('/quick', quickApplyValidation, quickApply);
router.get('/', getMyApplications);
router.get('/prefill/:listingId', getPrefillData);
router.patch('/:id/withdraw', withdrawApplication);

// Landlord routes
router.get('/received', checkLandlord, getReceivedApplications);
router.get('/listing/:id', getListingApplications);
router.post('/compare', checkLandlord, compareApplications);
router.patch('/bulk-status', checkLandlord, bulkStatusValidation, bulkUpdateStatus);
router.patch('/:id', statusValidation, updateApplicationStatus);

// Shared routes
router.get('/:id', getApplication);
router.post('/:id/tour', tourValidation, scheduleTour);
router.patch('/:id/tour', confirmTour);

export default router;
