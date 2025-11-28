import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // The person being reviewed (landlord or roommate)
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    // If reviewing a listing/landlord
  },
  roommateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // If reviewing a roommate
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  categoryRatings: {
    cleanliness: { type: Number, min: 1, max: 5 },
    accuracy: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
  },
  reviewText: {
    type: String,
    required: [true, 'Review text is required'],
    maxlength: 1000,
  },
  response: {
    text: { type: String, maxlength: 1000 },
    date: { type: Date },
  },
  verifiedStay: {
    type: Boolean,
    default: false,
  },
  photos: [{
    type: String, // URLs or file paths
  }],
  helpful: {
    type: Number,
    default: 0,
  },
  reported: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
reviewSchema.index({ listingId: 1 });
reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ reviewer: 1 });

// Can't review the same listing twice
reviewSchema.index({ reviewer: 1, listingId: 1 }, { unique: true, sparse: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;

