import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  avatar: {
    type: String,
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allow null for existing users
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-z0-9._]+$/, 'Username can only contain letters, numbers, dots and underscores'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false, // Don't include password in queries by default
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  school: {
    type: String,
    required: [
      function () { return this.userType === 'student'; },
      'School name is required for students'
    ],
  },
  graduationYear: {
    type: Number,
    required: [
      function () { return this.userType === 'student'; },
      'Graduation year is required for students'
    ],
  },
  userType: {
    type: String,
    enum: ['student', 'landlord', 'both'],
    default: 'student',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  isVerifiedLandlord: {
    type: Boolean,
    default: false,
  },
  ratings: {
    asLandlord: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String
  },
  roommateProfile: {
    type: mongoose.Schema.Types.ObjectId,

    ref: 'LifestyleProfile',
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
  }],
  savedSearches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavedSearch',
  }],
  savedProfiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LifestyleProfile',
  }],
  unreadNotifications: {
    type: Number,
    default: 0,
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
  },
  role: {
    type: String,
    enum: ['student', 'landlord', 'admin'],
    default: 'student'
  },
  landlordProfile: {
    companyName: String,
    contactEmail: String,
    contactPhone: String,
    propertiesCount: Number,
    isVerified: { type: Boolean, default: false },
    subscriptionTier: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'basic' }
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // Verification system
  verification: {
    email: {
      type: Boolean,
      default: false,
    },
    studentDomain: {
      type: Boolean,
      default: false,
    },
    governmentId: {
      type: Boolean,
      default: false,
    },
    idUploadDate: {
      type: Date,
    },
  },
  // Landlord metrics
  avgResponseTime: {
    type: Number, // in hours
    default: null,
  },
  // Campus Ambassador Program
  referralCode: {
    type: String,
    unique: true,
    sparse: true, // allows null values
  },
  referredBy: {
    type: String, // referral code of the person who referred this user
  },
  referralCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Generate referral code before first save
userSchema.pre('save', async function (next) {
  // Generate referral code if doesn't exist
  if (!this.referralCode) {
    this.referralCode = generateReferralCode();
  }

  // Auto-verify .edu email domain
  if (this.email && this.email.endsWith('.edu')) {
    this.verification.studentDomain = true;
  }

  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// Helper function to generate unique referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Get verification badges
userSchema.virtual('verificationBadges').get(function () {
  const badges = [];
  if (this.verification.email) badges.push('email');
  if (this.verification.studentDomain) badges.push('student');
  if (this.verification.governmentId) badges.push('id');
  return badges;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

export default User;

