import express from 'express';
import { body } from 'express-validator';
import {
  createReview,
  getListingReviews,
  getUserReviews,
  respondToReview,
  reportReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('reviewText')
    .trim()
    .notEmpty()
    .withMessage('Review text is required')
    .isLength({ max: 1000 })
    .withMessage('Review cannot exceed 1000 characters'),
];

// Public routes
router.get('/listing/:id', getListingReviews);
router.get('/user/:id', getUserReviews);

// Protected routes
router.post('/', protect, reviewValidation, createReview);
router.post('/:id/response', protect, respondToReview);
router.post('/:id/report', protect, reportReview);
router.delete('/:id', protect, deleteReview);

export default router;

