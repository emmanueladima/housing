import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/multer.js';
import {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    addComment,
    getComments,
    reportPost
} from '../controllers/communityController.js';

const router = express.Router();

// Public routes
router.get('/posts', getPosts);
router.get('/posts/:id', getPostById);
router.get('/posts/:id/comments', getComments);

// Protected routes
router.post('/posts', protect, upload.array('images', 5), createPost);
router.put('/posts/:id', protect, upload.array('images', 5), updatePost);
router.delete('/posts/:id', protect, deletePost);
router.post('/posts/:id/comments', protect, addComment);
router.post('/posts/:id/report', protect, reportPost);

export default router;
