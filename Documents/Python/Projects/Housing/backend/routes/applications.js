import express from 'express';
import { body } from 'express-validator';
import {
  submitApplication,
  getMyApplications,
  getReceivedApplications,
  getListingApplications,
  updateApplicationStatus,
  scheduleTour,
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

// All routes are protected
router.use(protect);

router.post('/', applicationValidation, submitApplication);
router.get('/', getMyApplications);
router.get('/received', checkLandlord, getReceivedApplications);
router.get('/listing/:id', getListingApplications);
router.patch('/:id', updateApplicationStatus);
router.post('/:id/tour', scheduleTour);

export default router;

