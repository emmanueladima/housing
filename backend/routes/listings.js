import express from 'express';
import { body } from 'express-validator';
import {
  getListings,
  getFavoriteListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  toggleFavorite,
  convertToSublease,
  getMyListings,
} from '../controllers/listingController.js';
import { protect, checkLandlord } from '../middleware/auth.js';
import { uploadListingImages } from '../middleware/multer.js';
import { optimizeListingImages } from '../middleware/imageOptimizer.js';

const router = express.Router();

// Validation for creating listing
const listingValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('zipCode').trim().notEmpty().withMessage('ZIP code is required'),
  body('rent').isNumeric().withMessage('Rent must be a number'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms must be a positive number'),
  body('bathrooms').isNumeric({ min: 0 }).withMessage('Bathrooms must be a positive number'),
  body('university').trim().notEmpty().withMessage('University is required'),
  body('availableDate').isISO8601().withMessage('Valid available date is required'),
  body('leaseTerm').isIn(['month-to-month', '6-months', '1-year', 'academic-year']).withMessage('Valid lease term is required'),
];

// Public routes
router.get('/', getListings);

// Protected routes (must come before /:id to avoid conflicts)
router.get('/my/listings', protect, getMyListings);
router.get('/favorites', protect, getFavoriteListings);

// Dynamic ID route (must come after specific routes)
router.get('/:id', getListing);

// Other protected routes
router.post('/', protect, uploadListingImages, optimizeListingImages, listingValidation, createListing);
router.put('/:id', protect, uploadListingImages, optimizeListingImages, updateListing);
router.delete('/:id', protect, deleteListing);
router.post('/:id/favorite', protect, toggleFavorite);
router.post('/:id/sublease', protect, convertToSublease);

export default router;

