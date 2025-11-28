import express from 'express';
import MoveChecklist, { DEFAULT_CHECKLIST_ITEMS } from '../models/MoveChecklist.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET checklist for a listing
router.get('/listing/:listingId', protect, async (req, res) => {
  try {
    let checklist = await MoveChecklist.findOne({
      user: req.user.id,
      listing: req.params.listingId,
    });

    if (!checklist) {
      // Create default checklist
      checklist = await MoveChecklist.create({
        user: req.user.id,
        listing: req.params.listingId,
        items: DEFAULT_CHECKLIST_ITEMS,
      });
    }

    res.json(checklist);
  } catch (error) {
    console.error('Error fetching checklist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update checklist
router.put('/listing/:listingId', protect, async (req, res) => {
  try {
    const { items } = req.body;

    let checklist = await MoveChecklist.findOne({
      user: req.user.id,
      listing: req.params.listingId,
    });

    if (!checklist) {
      checklist = await MoveChecklist.create({
        user: req.user.id,
        listing: req.params.listingId,
        items: items || DEFAULT_CHECKLIST_ITEMS,
      });
    } else {
      checklist.items = items;
      await checklist.save();
    }

    res.json(checklist);
  } catch (error) {
    console.error('Error updating checklist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST add item to checklist
router.post('/listing/:listingId/items', protect, async (req, res) => {
  try {
    const { text } = req.body;

    let checklist = await MoveChecklist.findOne({
      user: req.user.id,
      listing: req.params.listingId,
    });

    if (!checklist) {
      checklist = await MoveChecklist.create({
        user: req.user.id,
        listing: req.params.listingId,
        items: DEFAULT_CHECKLIST_ITEMS,
      });
    }

    checklist.items.push({
      text,
      completed: false,
      order: checklist.items.length + 1,
    });

    await checklist.save();
    res.json(checklist);
  } catch (error) {
    console.error('Error adding checklist item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;




