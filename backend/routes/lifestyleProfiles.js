import express from 'express';
import { protect } from '../middleware/auth.js';
import { uploadSingleImage } from '../middleware/multer.js';
import { optimizeProfilePhoto } from '../middleware/imageOptimizer.js';
import {
  createOrUpdateProfile,
  getMyProfile,
  getAllProfiles,
  getMatches,
  getProfile,
  toggleSavedProfile,
  getSavedProfiles,
  saveCompatibilityTest,
  boostMyProfile,
  getConstants,
} from '../controllers/lifestyleProfileController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Global Constants (must come before dynamic :id routes)
router.get('/constants', getConstants);

// Profile management
router.get('/me', getMyProfile);
router.put('/me', uploadSingleImage, optimizeProfilePhoto, createOrUpdateProfile); // Support PUT for updates
router.post('/me', uploadSingleImage, optimizeProfilePhoto, createOrUpdateProfile); // Support POST for creation/updates with photo
router.post('/me/boost', boostMyProfile); // Boost profile visibility

// Discovery & Matching
router.get('/all', getAllProfiles);
router.get('/matches', getMatches);
router.post('/save/:id', toggleSavedProfile);
router.get('/saved', getSavedProfiles);
router.post('/compatibility-test', saveCompatibilityTest);
router.get('/:id', getProfile);

export default router;
