import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  moveInDate: {
    type: Date,
    required: [true, 'Move-in date is required'],
  },
  leaseTerm: {
    type: String,
    enum: ['month-to-month', '6-months', '1-year', 'academic-year'],
    required: [true, 'Lease term is required'],
  },
  messageToLandlord: {
    type: String,
    maxlength: 1000,
  },
  documents: [{
    name: String,
    url: String,
    type: String, // e.g., 'id', 'proof-of-enrollment'
  }],
  landlordResponse: {
    message: { type: String },
    date: { type: Date },
  },
  tourScheduled: {
    date: { type: Date },
    time: { type: String },
    confirmed: { type: Boolean, default: false },
  },
}, {
  timestamps: true,
});

// Indexes
applicationSchema.index({ userId: 1 });
applicationSchema.index({ listingId: 1 });
applicationSchema.index({ status: 1 });

// Prevent duplicate applications
applicationSchema.index({ userId: 1, listingId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;

