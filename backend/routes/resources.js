import express from 'express';
import { VIBE_TAGS, INTERESTS } from '../config/appConstants.js';

const router = express.Router();

/**
 * @desc    Get all available vibe tags
 * @route   GET /api/resources/vibes
 * @access  Public
 */
router.get('/vibes', (req, res) => {
    res.json({
        success: true,
        vibes: VIBE_TAGS
    });
});

/**
 * @desc    Get all available interests
 * @route   GET /api/resources/interests
 * @access  Public
 */
router.get('/interests', (req, res) => {
    res.json({
        success: true,
        interests: INTERESTS
    });
});

export default router;
