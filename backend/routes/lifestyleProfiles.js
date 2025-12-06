import express from 'express';
import { protect } from '../middleware/auth.js';
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
} from '../controllers/lifestyleProfileController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile management
router.get('/me', getMyProfile);
router.put('/me', createOrUpdateProfile); // Support PUT for updates
router.post('/me', createOrUpdateProfile); // Support POST for creation/updates
router.post('/me/boost', boostMyProfile); // Boost profile visibility

// Discovery & Matching
router.get('/all', getAllProfiles);
router.get('/matches', getMatches);
router.post('/save/:id', toggleSavedProfile);
router.get('/saved', getSavedProfiles);
router.post('/compatibility-test', saveCompatibilityTest);
router.get('/:id', getProfile);

export default router;





