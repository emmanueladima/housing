import mongoose from 'mongoose';

const choreSchema = new mongoose.Schema({
  title: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueDate: { type: Date },
  completed: { type: Boolean, default: false },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'one-time'], default: 'weekly' }
});

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  splitAmong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  date: { type: Date, default: Date.now },
  category: { type: String, enum: ['rent', 'utilities', 'groceries', 'internet', 'other'], default: 'other' }
});

const ruleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['guests', 'noise', 'cleaning', 'kitchen', 'other'], default: 'other' }
});

const joinRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const roommateGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Join Requests
  joinRequests: [joinRequestSchema],

  // Toolkit Features
  chores: [choreSchema],
  expenses: [expenseSchema],
  houseRules: [ruleSchema],

  // Discovery Features (from previous implementation)
  budget: {
    min: Number,
    max: Number
  },
  location: {
    city: String,
    state: String
  },
  vibe: [String],
  lookingFor: String,

}, {
  timestamps: true
});

const RoommateGroup = mongoose.model('RoommateGroup', roommateGroupSchema);

export default RoommateGroup;
