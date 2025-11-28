import mongoose from 'mongoose';

const savedSearchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Search name is required'],
    trim: true,
  },
  searchCriteria: {
    city: String,
    state: String,
    zipCode: String,
    priceMin: Number,
    priceMax: Number,
    bedrooms: Number,
    bathrooms: Number,
    amenities: [String],
    leaseTerms: [String],
    availableDate: Date,
    maxDistance: Number,
    utilitiesIncluded: [String],
    sqftMin: Number,
    sqftMax: Number,
    tags: [String],
    sublease: Boolean,
    university: String,
  },
  alertsEnabled: {
    type: Boolean,
    default: true,
  },
  lastChecked: {
    type: Date,
    default: Date.now,
  },
  newListingsCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
savedSearchSchema.index({ userId: 1 });

const SavedSearch = mongoose.model('SavedSearch', savedSearchSchema);

export default SavedSearch;

