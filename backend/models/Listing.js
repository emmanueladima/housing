import mongoose from 'mongoose';
import { calculateQualityScore } from '../utils/qualityScoreCalculator.js';
import { isOnCampus } from '../utils/campusDetection.js';

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    index: true,
  },
  state: {
    type: String,
    required: [true, 'State is required'],
  },
  zipCode: {
    type: String,
    required: [true, 'ZIP code is required'],
  },
  rent: {
    type: Number,
    required: [true, 'Rent is required'],
    min: 0,
  },
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required'],
    min: 0,
  },
  bathrooms: {
    type: Number,
    required: [true, 'Number of bathrooms is required'],
    min: 0,
  },
  sqft: {
    type: Number,
    min: 0,
  },
  images: [{
    type: String, // URLs or file paths
  }],
  amenities: [{
    type: String,
    enum: ['parking', 'laundry', 'pet-friendly', 'furnished', 'gym', 'pool', 'AC', 'heating', 'dishwasher', 'balcony', 'WiFi', 'elevator'],
  }],
  tags: [{
    type: String,
    enum: ['apartment', 'house', 'studio', 'shared-room', 'condo', 'student-housing'],
  }],
  university: {
    type: String,
    required: [true, 'University is required'],
    index: true,
  },
  distanceToUniversity: {
    type: Number, // in miles
    min: 0,
  },
  availableDate: {
    type: Date,
    required: [true, 'Available date is required'],
  },
  leaseTerm: {
    type: String,
    enum: ['month-to-month', '6-months', '1-year', 'academic-year'],
    required: [true, 'Lease term is required'],
  },
  utilities: {
    water: { type: Boolean, default: false },
    electricity: { type: Boolean, default: false },
    gas: { type: Boolean, default: false },
    internet: { type: Boolean, default: false },
    trash: { type: Boolean, default: false },
  },
  rules: {
    petsAllowed: { type: Boolean, default: false },
    smokingAllowed: { type: Boolean, default: false },
    partiesAllowed: { type: Boolean, default: false },
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  isLandlordListing: {
    type: Boolean,
    default: false
  },
  isSublease: {
    type: Boolean,
    default: false,
  },
  subleaseDetails: {
    originalLeaseEnd: { type: Date },
    reason: { type: String },
    originalTenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalViews: {
    type: Number,
    default: 0,
  },
  totalApplications: {
    type: Number,
    default: 0,
  },
  badges: [{
    type: String,
    enum: ['showcase', 'price-drop', 'new', 'verified-landlord', 'sublease'],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  showPhoneNumber: {
    type: Boolean,
    default: true, // Show by default for backward compatibility
  },
  // Quality score (0-100)
  qualityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  // Boost system
  boost: {
    active: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
    },
  },
  // Campus detection
  isOnCampus: {
    type: Boolean,
    default: false,
  },
  // Support old location format
  location: {
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
listingSchema.index({ city: 1, university: 1 });
listingSchema.index({ rent: 1 });
// Note: 2dsphere index removed as coordinates field uses {lat, lng} instead of GeoJSON

// Pre-save middleware
listingSchema.pre('save', async function (next) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Add 'new' badge
  if (this.createdAt > sevenDaysAgo && !this.badges.includes('new')) {
    this.badges.push('new');
  }

  // Add sublease badge
  if (this.isSublease && !this.badges.includes('sublease')) {
    this.badges.push('sublease');
  }

  // Deactivate expired boost
  if (this.boost.active && this.boost.expiresAt && this.boost.expiresAt < new Date()) {
    this.boost.active = false;
  }

  // Sync location fields
  if (!this.location.coordinates.lat && this.coordinates.lat) {
    this.location.coordinates = this.coordinates;
  }
  if (!this.location.address && this.address) {
    this.location.address = this.address;
    this.location.city = this.city;
    this.location.state = this.state;
    this.location.zipCode = this.zipCode;
  }

  // Calculate campus detection
  if (this.location?.coordinates?.lat && this.location?.coordinates?.lng) {
    this.isOnCampus = isOnCampus(this.location.coordinates.lat, this.location.coordinates.lng);
  }

  // Calculate quality score
  try {
    const landlord = await mongoose.model('User').findById(this.landlord);
    this.qualityScore = await calculateQualityScore(this, landlord);
  } catch (error) {
    console.error('Error calculating quality score:', error);
  }

  next();
});

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;

