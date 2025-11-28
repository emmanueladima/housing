import mongoose from 'mongoose';

const moveChecklistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  items: [{
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  }],
}, {
  timestamps: true,
});

moveChecklistSchema.index({ user: 1, listing: 1 }, { unique: true });

export const DEFAULT_CHECKLIST_ITEMS = [
  { text: 'Sign lease agreement', order: 1 },
  { text: 'Set up utilities (electric, water, gas)', order: 2 },
  { text: 'Get renters insurance', order: 3 },
  { text: 'Order moving truck/service', order: 4 },
  { text: 'Pack essentials box', order: 5 },
  { text: 'Update mailing address', order: 6 },
  { text: 'Transfer internet/cable service', order: 7 },
  { text: 'Schedule walkthrough inspection', order: 8 },
  { text: 'Get keys and access codes', order: 9 },
  { text: 'Meet roommates', order: 10 },
];

const MoveChecklist = mongoose.model('MoveChecklist', moveChecklistSchema);

export default MoveChecklist;




