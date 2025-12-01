import express from 'express';
import RoommateGroup from '../models/RoommateGroup.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET all roommate groups
router.get('/', async (req, res) => {
  try {
    const groups = await RoommateGroup.find()
      .populate('members', 'firstName lastName email')
      .populate('admin', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create new roommate group
router.post('/', protect, async (req, res) => {
  try {
    console.log('Creating group with body:', req.body);
    console.log('User:', req.user.id);
    const { name, description, budget, location, vibe, lookingFor, moveInDate } = req.body;

    const group = await RoommateGroup.create({
      name,
      description,
      admin: req.user.id,
      members: [req.user.id],
      budget,
      location,
      vibe,
      lookingFor,
      moveInDate,
    });

    await group.populate('members', 'firstName lastName email');
    await group.populate('admin', 'firstName lastName');

    console.log('Group created successfully:', group._id);
    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET specific roommate group
router.get('/:groupId', async (req, res) => {
  try {
    const group = await RoommateGroup.findById(req.params.groupId)
      .populate('members', 'firstName lastName email')
      .populate('admin', 'firstName lastName');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update roommate group
router.put('/:groupId', protect, async (req, res) => {
  try {
    const group = await RoommateGroup.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Only admin can update
    if (group.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, budget, location, vibe, lookingFor, moveInDate } = req.body;

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (budget) group.budget = budget;
    if (location) group.location = location;
    if (vibe) group.vibe = vibe;
    if (lookingFor) group.lookingFor = lookingFor;
    if (moveInDate) group.moveInDate = moveInDate;

    await group.save();
    await group.populate('members', 'firstName lastName email');
    await group.populate('admin', 'firstName lastName');

    res.json(group);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET roommate group for a listing
router.get('/listing/:listingId', protect, async (req, res) => {
  try {
    let group = await RoommateGroup.findOne({ listing: req.params.listingId })
      .populate('members', 'firstName lastName email');

    if (!group) {
      // Create new group
      group = await RoommateGroup.create({
        listing: req.params.listingId,
        members: [req.user.id],
      });
      await group.populate('members', 'firstName lastName email');
    }

    res.json(group);
  } catch (error) {
    console.error('Error fetching roommate group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST generate chore rotation
router.post('/listing/:listingId/chores/generate', protect, async (req, res) => {
  try {
    const group = await RoommateGroup.findOne({ listing: req.params.listingId })
      .populate('members', 'firstName lastName');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Generate weekly rotation
    const currentWeek = Math.ceil(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const assignments = [];

    group.choreRotation.chores.forEach((chore, index) => {
      const memberIndex = index % group.members.length;
      assignments.push({
        chore: chore.name,
        assignedTo: group.members[memberIndex]._id,
      });
    });

    group.choreRotation.schedule.push({
      week: currentWeek,
      assignments,
    });
    group.choreRotation.lastGenerated = new Date();

    await group.save();
    await group.populate('members', 'firstName lastName');

    res.json(group);
  } catch (error) {
    console.error('Error generating chore rotation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update chores
router.put('/listing/:listingId/chores', protect, async (req, res) => {
  try {
    const { chores } = req.body;

    const group = await RoommateGroup.findOne({ listing: req.params.listingId });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.choreRotation.chores = chores;
    await group.save();

    res.json(group);
  } catch (error) {
    console.error('Error updating chores:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST add expense
router.post('/listing/:listingId/expenses', protect, async (req, res) => {
  try {
    const { name, amount, splitType, customSplits, dueDate } = req.body;

    const group = await RoommateGroup.findOne({ listing: req.params.listingId });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.expenses.push({
      name,
      amount,
      splitType,
      customSplits,
      paidBy: req.user.id,
      dueDate,
    });

    await group.save();
    res.json(group);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update house rules
router.put('/listing/:listingId/rules', protect, async (req, res) => {
  try {
    const { houseRules } = req.body;

    const group = await RoommateGroup.findOne({ listing: req.params.listingId });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.houseRules = houseRules;
    await group.save();

    res.json(group);
  } catch (error) {
    console.error('Error updating house rules:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;




