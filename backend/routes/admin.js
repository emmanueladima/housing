import express from 'express';
import { protect, checkAdmin } from '../middleware/auth.js';
import {
  getDashboardStats,
  getUsers,
  impersonateUser,
  toggleBanUser,
  getAuditLogs,
  deletePost
} from '../controllers/adminController.js';
import {
  getListings,
  deleteListing
} from '../controllers/adminListingController.js';

const router = express.Router();

// Base Middleware for all admin routes
router.use(protect);
router.use(checkAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/logs', getAuditLogs);
router.post('/users/:id/impersonate', impersonateUser);
router.post('/users/:id/toggle-ban', toggleBanUser);

// Listing Routes
router.get('/listings', getListings);
router.delete('/listings/:id', deleteListing);

// Post Routes
router.delete('/posts/:id', deletePost);

// Messaging Routes
import { sendAnnouncement } from '../controllers/adminMessagingController.js';
router.post('/messaging/send', sendAnnouncement);

export default router;
