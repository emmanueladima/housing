import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createGroup,
  updateGroup,
  getMyGroup,
  getAllGroups,
  getGroupById,
  addChore,
  addExpense,
  addRule,
  requestJoin,
  getJoinRequests,
  handleJoinRequest,
  deleteMyGroup
} from '../controllers/roommateGroupController.js';

const router = express.Router();

router.use(protect);

router.post('/', createGroup);
router.put('/:id', updateGroup);
router.get('/', getAllGroups);
router.get('/my-group', getMyGroup);
router.delete('/my-group', deleteMyGroup);
router.get('/:id', getGroupById);

// Join Request Routes
router.post('/:id/request-join', requestJoin);
router.get('/:id/requests', getJoinRequests);
router.put('/:id/requests/:requestId', handleJoinRequest);

// Toolkit Routes
router.post('/:id/chores', addChore);
router.post('/:id/expenses', addExpense);
router.post('/:id/rules', addRule);

export default router;
