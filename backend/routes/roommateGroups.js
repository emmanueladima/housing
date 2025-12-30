import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createGroup,
  updateGroup,
  getMyGroup,
  getAllGroups,
  getGroupById,
  addChore,
  updateChore,
  deleteChore,
  addExpense,
  updateExpense,
  deleteExpense,
  addRule,
  addEvent,
  deleteEvent,
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

// Toolkit Routes - Timeline Events
router.post('/:id/events', addEvent);
router.delete('/:id/events/:eventId', deleteEvent);

// Toolkit Routes - Chores
router.post('/:id/chores', addChore);
router.put('/:id/chores/:choreId', updateChore);
router.delete('/:id/chores/:choreId', deleteChore);

// Toolkit Routes - Expenses
router.post('/:id/expenses', addExpense);
router.put('/:id/expenses/:expenseId', updateExpense);
router.delete('/:id/expenses/:expenseId', deleteExpense);

// Toolkit Routes - Rules
router.post('/:id/rules', addRule);

export default router;
