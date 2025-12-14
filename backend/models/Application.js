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
  // Expanded status pipeline
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'interview_scheduled', 'approved', 'rejected', 'withdrawn'],
    default: 'submitted',
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
  // Enhanced message field - now a cover letter
  coverLetter: {
    type: String,
    maxlength: 2000,
  },
  // Keep legacy field for backward compatibility
  messageToLandlord: {
    type: String,
    maxlength: 1000,
  },
  // Co-applicant support for group applications
  coApplicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    email: String, // For pending invites
    status: {
      type: String,
      enum: ['invited', 'accepted', 'declined'],
      default: 'invited',
    },
    invitedAt: { type: Date, default: Date.now },
    respondedAt: Date,
  }],
  // Applicant profile snapshot (captured at submission time)
  applicantProfile: {
    income: {
      employer: String,
      position: String,
      annualIncome: Number,
      employmentLength: String, // e.g., "2 years"
      verified: { type: Boolean, default: false },
    },
    references: [{
      name: String,
      phone: String,
      email: String,
      relationship: String, // e.g., "Previous Landlord", "Employer"
    }],
    creditScore: {
      range: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'not_provided'],
        default: 'not_provided',
      },
      selfReported: { type: Boolean, default: true },
    },
  },
  // Document uploads
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['id', 'proof-of-enrollment', 'proof-of-income', 'reference-letter', 'background-check', 'other'],
    },
    uploadedAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false },
  }],
  // Background check integration
  backgroundCheck: {
    status: {
      type: String,
      enum: ['not_requested', 'pending', 'passed', 'failed', 'expired'],
      default: 'not_requested',
    },
    provider: String, // e.g., "Checkr", "Certn"
    reportUrl: String,
    completedAt: Date,
    expiresAt: Date,
  },
  // Status tracking history
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    note: String,
  }],
  // Landlord response
  landlordResponse: {
    message: { type: String },
    date: { type: Date },
  },
  // Private notes only visible to landlord
  landlordNotes: {
    type: String,
    maxlength: 2000,
  },
  // Tour/interview scheduling
  tourScheduled: {
    date: { type: Date },
    time: { type: String },
    confirmed: { type: Boolean, default: false },
    location: String, // Address or "Virtual"
    meetingLink: String, // For virtual tours
    notes: String,
  },
  // Response time tracking
  estimatedResponseDate: Date,
  firstViewedAt: Date, // When landlord first viewed the application
  // Application template used (if Quick Apply)
  templateUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApplicationTemplate',
  },
  // Applicant score (calculated by system for landlord comparison)
  score: {
    total: { type: Number, default: 0 },
    breakdown: {
      profileCompleteness: { type: Number, default: 0 },
      verificationLevel: { type: Number, default: 0 },
      incomeToRentRatio: { type: Number, default: 0 },
      responseTime: { type: Number, default: 0 },
    },
  },
}, {
  timestamps: true,
});

// Indexes
applicationSchema.index({ userId: 1 });
applicationSchema.index({ listingId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({ 'score.total': -1 });

// Prevent duplicate applications
applicationSchema.index({ userId: 1, listingId: 1 }, { unique: true });

// Pre-save middleware to track status changes
applicationSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      changedBy: this._statusChangedBy, // Set this before saving
    });
  }
  next();
});

// Virtual for checking if application is actionable by landlord
applicationSchema.virtual('isActionable').get(function () {
  return ['submitted', 'under_review', 'interview_scheduled'].includes(this.status);
});

// Virtual for days since submission
applicationSchema.virtual('daysSinceSubmission').get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Calculate application score
applicationSchema.methods.calculateScore = function (listingRent) {
  let score = {
    profileCompleteness: 0,
    verificationLevel: 0,
    incomeToRentRatio: 0,
    responseTime: 0,
  };

  // Profile completeness (max 25)
  if (this.coverLetter) score.profileCompleteness += 5;
  if (this.applicantProfile?.income?.employer) score.profileCompleteness += 5;
  if (this.applicantProfile?.references?.length > 0) score.profileCompleteness += 5;
  if (this.documents?.length > 0) score.profileCompleteness += 5;
  if (this.applicantProfile?.creditScore?.range !== 'not_provided') score.profileCompleteness += 5;

  // Verification level (max 25)
  if (this.documents?.some(d => d.type === 'id' && d.verified)) score.verificationLevel += 10;
  if (this.documents?.some(d => d.type === 'proof-of-income' && d.verified)) score.verificationLevel += 10;
  if (this.backgroundCheck?.status === 'passed') score.verificationLevel += 5;

  // Income to rent ratio (max 25)
  if (this.applicantProfile?.income?.annualIncome && listingRent) {
    const monthlyIncome = this.applicantProfile.income.annualIncome / 12;
    const ratio = monthlyIncome / listingRent;
    if (ratio >= 3) score.incomeToRentRatio = 25;
    else if (ratio >= 2.5) score.incomeToRentRatio = 20;
    else if (ratio >= 2) score.incomeToRentRatio = 15;
    else if (ratio >= 1.5) score.incomeToRentRatio = 10;
  }

  // Response time bonus (max 25) - quick responses get more points
  if (this.firstViewedAt) {
    const hoursToView = (this.firstViewedAt - this.createdAt) / (1000 * 60 * 60);
    if (hoursToView < 24) score.responseTime = 25;
    else if (hoursToView < 48) score.responseTime = 20;
    else if (hoursToView < 72) score.responseTime = 15;
    else if (hoursToView < 168) score.responseTime = 10;
  }

  this.score = {
    breakdown: score,
    total: Object.values(score).reduce((a, b) => a + b, 0),
  };

  return this.score;
};

// Ensure virtuals are included in JSON
applicationSchema.set('toJSON', { virtuals: true });
applicationSchema.set('toObject', { virtuals: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
