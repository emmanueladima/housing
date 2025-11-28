import mongoose from 'mongoose';

const roommateGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  budget: {
    min: { type: Number },
    max: { type: Number },
  },
  location: {
    type: String,
    default: '',
  },
  vibe: [{
    type: String,
  }],
  lookingFor: {
    type: String,
    default: '1 more',
  },
  moveInDate: {
    type: Date,
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
  },
  choreRotation: {
    chores: [{
      name: { type: String, required: true },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly'],
        default: 'weekly',
      },
    }],
    schedule: [{
      week: { type: Number },
      assignments: [{
        chore: { type: String },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      }],
    }],
    lastGenerated: { type: Date },
  },
  expenses: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    splitType: {
      type: String,
      enum: ['equal', 'custom'],
      default: 'equal',
    },
    customSplits: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      percentage: { type: Number, min: 0, max: 100 },
      amount: { type: Number },
    }],
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    paidAt: { type: Date },
    dueDate: { type: Date },
  }],
  houseRules: { type: String, default: '' },
}, {
  timestamps: true,
});

const RoommateGroup = mongoose.model('RoommateGroup', roommateGroupSchema);

export default RoommateGroup;




