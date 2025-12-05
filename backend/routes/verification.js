import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET verification status
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      verification: user.verification,
      verificationBadges: user.verificationBadges,
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST verify government ID (mock flow)
router.post('/verify-id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // In production, this would handle actual ID upload and verification
    // For now, we just set the flag
    user.verification.governmentId = true;
    user.verification.idUploadDate = new Date();
    await user.save();

    res.json({
      message: 'ID verification successful',
      verification: user.verification,
      verificationBadges: user.verificationBadges,
    });
  } catch (error) {
    console.error('Error verifying ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST verify email (mark as verified)
router.post('/verify-email', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.verification.email = true;
    await user.save();

    res.json({
      message: 'Email verified successfully',
      verification: user.verification,
      verificationBadges: user.verificationBadges,
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;





