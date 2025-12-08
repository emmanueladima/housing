import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getDashboardMetrics,
    getLandlordListings,
    boostListing,
    unboostListing
} from '../controllers/landlordController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Dashboard metrics
router.get('/dashboard/metrics', getDashboardMetrics);

// Get landlord's listings
router.get('/listings', getLandlordListings);

// Boost/unboost listings
router.post('/boost/:listingId', boostListing);
router.delete('/boost/:listingId', unboostListing);

export default router;
