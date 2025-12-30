import express from 'express';
import { body } from 'express-validator';
import {
  signup,
  login,
  verifyEmail,
  getMe,
  updateProfile,
  resendVerification,
  resendVerificationPublic,
  updateProfilePhoto,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { uploadSingleImage } from '../middleware/multer.js';
import { optimizeProfilePhoto } from '../middleware/imageOptimizer.js';
import { authLimiter, signupLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Validation middleware
const signupValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email')
    .isEmail()
    .withMessage('Must be a valid email')
    .custom((value) => value.endsWith('.edu'))
    .withMessage('Must be a .edu email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('school').notEmpty().withMessage('School name is required'),
  body('graduationYear')
    .isInt({ min: 2024, max: 2035 })
    .withMessage('Graduation year must be between 2024 and 2035'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public routes (with rate limiting for security)
router.post('/signup', signupLimiter, signupValidation, signup);
router.post('/login', authLimiter, loginValidation, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification-public', authLimiter, resendVerificationPublic);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/profile-photo', protect, uploadSingleImage, optimizeProfilePhoto, updateProfilePhoto);
router.post('/resend-verification', protect, resendVerification);

export default router;
