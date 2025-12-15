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

// ========================================
// PERSONAL MOVE-IN CHECKLIST (no listing required)
// ========================================

// Default personal checklist items
const PERSONAL_CHECKLIST_ITEMS = [
  { text: 'Research neighborhoods and housing options', order: 1, category: 'planning' },
  { text: 'Set a moving budget', order: 2, category: 'planning' },
  { text: 'Start decluttering and packing non-essentials', order: 3, category: 'packing' },
  { text: 'Notify current landlord of move-out date', order: 4, category: 'planning' },
  { text: 'Book moving truck or hire movers', order: 5, category: 'logistics' },
  { text: 'Gather packing supplies (boxes, tape, bubble wrap)', order: 6, category: 'packing' },
  { text: 'Pack room by room, label all boxes', order: 7, category: 'packing' },
  { text: 'Update address with USPS', order: 8, category: 'admin' },
  { text: 'Transfer utilities to new address', order: 9, category: 'admin' },
  { text: 'Cancel or transfer subscriptions and services', order: 10, category: 'admin' },
  { text: 'Get renters insurance', order: 11, category: 'admin' },
  { text: 'Do final walkthrough of old place', order: 12, category: 'move-day' },
  { text: 'Take photos of old place condition', order: 13, category: 'move-day' },
  { text: 'Pack essentials bag (toiletries, clothes, phone charger)', order: 14, category: 'move-day' },
  { text: 'Get keys and access codes for new place', order: 15, category: 'move-day' },
  { text: 'Do walkthrough of new place, note any issues', order: 16, category: 'settling' },
  { text: 'Take photos of new place condition', order: 17, category: 'settling' },
  { text: 'Set up internet and cable', order: 18, category: 'settling' },
  { text: 'Unpack essentials first', order: 19, category: 'settling' },
  { text: 'Meet your new neighbors/roommates', order: 20, category: 'settling' },
];

// GET personal checklist
router.get('/personal', protect, async (req, res) => {
  try {
    let checklist = await MoveChecklist.findOne({
      user: req.user.id,
      listing: null,
    });

    if (!checklist) {
      // Create default personal checklist
      checklist = await MoveChecklist.create({
        user: req.user.id,
        listing: null,
        items: PERSONAL_CHECKLIST_ITEMS,
      });
    }

    res.json(checklist);
  } catch (error) {
    console.error('Error fetching personal checklist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update personal checklist
router.put('/personal', protect, async (req, res) => {
  try {
    const { items } = req.body;

    let checklist = await MoveChecklist.findOne({
      user: req.user.id,
      listing: null,
    });

    if (!checklist) {
      checklist = await MoveChecklist.create({
        user: req.user.id,
        listing: null,
        items: items || PERSONAL_CHECKLIST_ITEMS,
      });
    } else {
      checklist.items = items;
      await checklist.save();
    }

    res.json(checklist);
  } catch (error) {
    console.error('Error updating personal checklist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST add item to personal checklist
router.post('/personal/items', protect, async (req, res) => {
  try {
    const { text, category = 'custom' } = req.body;

    let checklist = await MoveChecklist.findOne({
      user: req.user.id,
      listing: null,
    });

    if (!checklist) {
      checklist = await MoveChecklist.create({
        user: req.user.id,
        listing: null,
        items: PERSONAL_CHECKLIST_ITEMS,
      });
    }

    checklist.items.push({
      text,
      completed: false,
      order: checklist.items.length + 1,
      category,
    });

    await checklist.save();
    res.json(checklist);
  } catch (error) {
    console.error('Error adding personal checklist item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE item from personal checklist
router.delete('/personal/items/:itemId', protect, async (req, res) => {
  try {
    const checklist = await MoveChecklist.findOne({
      user: req.user.id,
      listing: null,
    });

    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }

    checklist.items = checklist.items.filter(
      item => item._id.toString() !== req.params.itemId
    );

    await checklist.save();
    res.json(checklist);
  } catch (error) {
    console.error('Error deleting personal checklist item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST reset personal checklist to defaults
router.post('/personal/reset', protect, async (req, res) => {
  try {
    let checklist = await MoveChecklist.findOne({
      user: req.user.id,
      listing: null,
    });

    if (checklist) {
      checklist.items = PERSONAL_CHECKLIST_ITEMS;
      await checklist.save();
    } else {
      checklist = await MoveChecklist.create({
        user: req.user.id,
        listing: null,
        items: PERSONAL_CHECKLIST_ITEMS,
      });
    }

    res.json(checklist);
  } catch (error) {
    console.error('Error resetting personal checklist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;




