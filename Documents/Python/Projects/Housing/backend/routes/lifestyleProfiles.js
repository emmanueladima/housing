import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createOrUpdateProfile,
  getMyProfile,
  getAllProfiles,
  getMatches,
  getProfile,
} from '../controllers/lifestyleProfileController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile management
router.get('/me', getMyProfile);
router.put('/me', createOrUpdateProfile); // Support PUT for updates
router.post('/me', createOrUpdateProfile); // Support POST for creation/updates

// Discovery & Matching
router.get('/all', getAllProfiles);
router.get('/matches', getMatches);
router.get('/:id', getProfile);

export default router;




