import express from 'express';
import FeatureFlag from '../models/FeatureFlag.js';

const router = express.Router();

// GET all feature flags
router.get('/', async (req, res) => {
  try {
    const flags = await FeatureFlag.find({});
    
    // Convert to object format { flagName: boolean }
    const flagsObj = {};
    flags.forEach(flag => {
      flagsObj[flag.name] = flag.enabled;
    });
    
    res.json(flagsObj);
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single feature flag by name
router.get('/:name', async (req, res) => {
  try {
    const flag = await FeatureFlag.findOne({ name: req.params.name });
    
    if (!flag) {
      return res.status(404).json({ message: 'Feature flag not found' });
    }
    
    res.json({ name: flag.name, enabled: flag.enabled, description: flag.description });
  } catch (error) {
    console.error('Error fetching feature flag:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST/PUT update feature flag (admin endpoint - could add auth later)
router.put('/:name', async (req, res) => {
  try {
    const { enabled } = req.body;
    
    const flag = await FeatureFlag.findOneAndUpdate(
      { name: req.params.name },
      { enabled },
      { new: true, upsert: true }
    );
    
    res.json(flag);
  } catch (error) {
    console.error('Error updating feature flag:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

