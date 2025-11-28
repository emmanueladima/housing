import express from 'express';
import { body } from 'express-validator';
import {
  saveSearch,
  getSavedSearches,
  updateSavedSearch,
  deleteSavedSearch,
  checkNewListings,
} from '../controllers/savedSearchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const saveSearchValidation = [
  body('name').trim().notEmpty().withMessage('Search name is required'),
  body('searchCriteria').isObject().withMessage('Search criteria must be an object'),
];

// All routes are protected
router.use(protect);

router.post('/', saveSearchValidation, saveSearch);
router.get('/', getSavedSearches);
router.put('/:id', updateSavedSearch);
router.delete('/:id', deleteSavedSearch);
router.get('/:id/new-listings', checkNewListings);

export default router;

