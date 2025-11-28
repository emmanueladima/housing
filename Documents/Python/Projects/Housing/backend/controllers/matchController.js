import Match from '../models/Match.js';
import LifestyleProfile from '../models/LifestyleProfile.js';
import aiMatchingService from '../services/aiMatchingService.js';

/**
 * @desc    Get my matches (pending, accepted)
 * @route   GET /api/matches
 * @access  Private
 */
export const getMyMatches = async (req, res) => {
    try {
        const matches = await Match.find({
            users: req.user._id,
            status: { $in: ['pending', 'accepted'] },
        })
            .populate('users', 'firstName lastName email school graduationYear')
            .sort({ lastInteraction: -1 });

        res.json({
            success: true,
            count: matches.length,
            matches,
        });
    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching matches',
        });
    }
};

/**
 * @desc    Request a match (Swipe Right)
 * @route   POST /api/matches/request
 * @access  Private
 */
export const requestMatch = async (req, res) => {
    try {
        const { targetUserId } = req.body;

        if (targetUserId === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot match with yourself' });
        }

        // Check if match already exists
        let match = await Match.findOne({
            users: { $all: [req.user._id, targetUserId] },
        });

        if (match) {
            if (match.status === 'rejected') {
                return res.status(400).json({ error: 'Match was previously rejected' });
            }
            if (match.status === 'accepted') {
                return res.status(400).json({ error: 'Already matched' });
            }
            if (match.status === 'pending' && match.initiator.toString() !== req.user._id.toString()) {
                // If pending and other user initiated, accept it!
                match.status = 'accepted';
                match.lastInteraction = Date.now();
                await match.save();
                return res.json({ success: true, match, message: 'It\'s a match!' });
            }
            if (match.status === 'pending' && match.initiator.toString() === req.user._id.toString()) {
                return res.status(400).json({ error: 'Request already sent' });
            }
        }

        // Calculate compatibility if not exists or update it
        const myProfile = await LifestyleProfile.findOne({ user: req.user._id });
        const targetProfile = await LifestyleProfile.findOne({ user: targetUserId });

        if (!myProfile || !targetProfile) {
            return res.status(404).json({ error: 'Profiles not found' });
        }

        const compatibility = aiMatchingService.calculateCompatibility(myProfile, targetProfile);

        if (!match) {
            match = await Match.create({
                users: [req.user._id, targetUserId],
                compatibilityScore: compatibility.score,
                breakdown: compatibility.categoryScores,
                topReasons: compatibility.reasons,
                status: 'pending',
                initiator: req.user._id,
            });
        } else {
            // Update existing 'suggested' match to 'pending'
            match.status = 'pending';
            match.initiator = req.user._id;
            match.lastInteraction = Date.now();
            await match.save();
        }

        res.json({ success: true, match });
    } catch (error) {
        console.error('Request match error:', error);
        res.status(500).json({
            success: false,
            error: 'Error requesting match',
        });
    }
};

/**
 * @desc    Respond to match request (Accept/Reject)
 * @route   PUT /api/matches/:id/respond
 * @access  Private
 */
export const respondToMatch = async (req, res) => {
    try {
        const { action } = req.body; // 'accept' or 'reject'
        const match = await Match.findById(req.params.id);

        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        // Verify user is part of match and NOT the initiator (unless rejecting?)
        // Usually only the recipient can accept.
        if (!match.users.includes(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (match.status !== 'pending') {
            return res.status(400).json({ error: 'Match is not pending' });
        }

        if (match.initiator.toString() === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot respond to your own request' });
        }

        if (action === 'accept') {
            match.status = 'accepted';
        } else if (action === 'reject') {
            match.status = 'rejected';
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        match.lastInteraction = Date.now();
        await match.save();

        res.json({ success: true, match });
    } catch (error) {
        console.error('Respond match error:', error);
        res.status(500).json({
            success: false,
            error: 'Error responding to match',
        });
    }
};
