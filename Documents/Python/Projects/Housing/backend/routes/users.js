import express from 'express';
import User from '../models/User.js';
import LifestyleProfile from '../models/LifestyleProfile.js';
import Report from '../models/Report.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET users with lifestyle profiles (for roommate browse)
router.get('/with-profiles', protect, async (req, res) => {
  try {
    // Find all users who have lifestyle profiles
    const profileUserIds = await LifestyleProfile.find().distinct('user');

    // Exclude current user
    const userIds = profileUserIds.filter(id => id.toString() !== req.user.id);

    const users = await User.find({ _id: { $in: userIds } })
      .select('firstName lastName email school graduationYear verification userType')
      .limit(50);

    res.json(users);
  } catch (error) {
    console.error('Error fetching users with profiles:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('firstName lastName email school graduationYear verification userType');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Block a user
router.post('/:id/block', protect, async (req, res) => {
  try {
    const userToBlockId = req.params.id;
    const currentUser = await User.findById(req.user.id);

    if (!currentUser.blockedUsers.includes(userToBlockId)) {
      currentUser.blockedUsers.push(userToBlockId);
      await currentUser.save();
    }

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unblock a user
router.post('/:id/unblock', protect, async (req, res) => {
  try {
    const userToUnblockId = req.params.id;
    const currentUser = await User.findById(req.user.id);

    currentUser.blockedUsers = currentUser.blockedUsers.filter(
      id => id.toString() !== userToUnblockId
    );
    await currentUser.save();

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Report a user
router.post('/:id/report', protect, async (req, res) => {
  try {
    const { reason, description } = req.body;
    const reportedUserId = req.params.id;

    const report = await Report.create({
      reporter: req.user.id,
      reportedUser: reportedUserId,
      reason,
      description,
      status: 'pending'
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Error reporting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;




