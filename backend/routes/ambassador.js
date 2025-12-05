import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET my referral info
router.get('/my-referrals', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      referralLink: `${process.env.FRONTEND_URL}/signup?ref=${user.referralCode}`,
    });
  } catch (error) {
    console.error('Error fetching referral info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const topAmbassadors = await User.find({})
      .sort({ referralCount: -1 })
      .limit(10)
      .select('firstName lastName referralCount school');

    res.json(topAmbassadors);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST apply referral code during signup (called from auth route)
// This is a helper function, not a route
export const applyReferralCode = async (referralCode) => {
  try {
    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (referrer) {
      referrer.referralCount += 1;
      await referrer.save();
      return referrer.referralCode;
    }
    return null;
  } catch (error) {
    console.error('Error applying referral code:', error);
    return null;
  }
};

export default router;





