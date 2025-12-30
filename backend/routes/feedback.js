import express from 'express';
import Feedback from '../models/Feedback.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all feedback (paginated)
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const feedback = await Feedback.find()
            .populate('user', 'firstName lastName profilePhoto')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Feedback.countDocuments();

        res.json({
            feedback,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create feedback
router.post('/', protect, async (req, res) => {
    try {
        const { text, category } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ message: 'Feedback text is required' });
        }

        const feedback = new Feedback({
            user: req.user.id,
            text: text.trim(),
            category: category || 'general',
        });

        await feedback.save();
        await feedback.populate('user', 'firstName lastName profilePhoto');

        res.status(201).json(feedback);
    } catch (error) {
        console.error('Error creating feedback:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle like on feedback
router.post('/:id/like', protect, async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        const userId = req.user.id;
        const likeIndex = feedback.likes.indexOf(userId);

        if (likeIndex === -1) {
            feedback.likes.push(userId);
        } else {
            feedback.likes.splice(likeIndex, 1);
        }

        await feedback.save();
        await feedback.populate('user', 'firstName lastName profilePhoto');

        res.json(feedback);
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete feedback (only by owner)
router.delete('/:id', protect, async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        if (feedback.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await feedback.deleteOne();
        res.json({ message: 'Feedback deleted' });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
