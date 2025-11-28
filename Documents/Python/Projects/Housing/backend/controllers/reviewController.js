import Review from '../models/Review.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';

/**
 * @desc    Create a review
 * @route   POST /api/reviews
 * @access  Private
 */
export const createReview = async (req, res) => {
  try {
    const {
      listingId,
      roommateId,
      rating,
      categoryRatings,
      reviewText,
    } = req.body;

    let reviewData = {
      reviewer: req.user._id,
      rating,
      categoryRatings,
      reviewText,
    };

    if (listingId) {
      // Review for a listing/landlord
      const listing = await Listing.findById(listingId);
      if (!listing) {
        return res.status(404).json({
          success: false,
          error: 'Listing not found',
        });
      }

      reviewData.listingId = listingId;
      reviewData.reviewee = listing.landlord;

      // Create review
      const review = await Review.create(reviewData);

      // Add review to listing
      listing.reviews.push(review._id);

      // Update average rating
      const allReviews = await Review.find({ listingId });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      listing.averageRating = Math.round(avgRating * 10) / 10;

      await listing.save();

      // Update landlord rating
      const landlord = await User.findById(listing.landlord);
      const landlordReviews = await Review.find({ reviewee: listing.landlord });
      const landlordAvgRating = landlordReviews.reduce((sum, r) => sum + r.rating, 0) / landlordReviews.length;
      landlord.ratings.asLandlord = Math.round(landlordAvgRating * 10) / 10;
      await landlord.save();

      await review.populate('reviewer', 'firstName lastName');
      return res.status(201).json({
        success: true,
        review,
      });
    }

    if (roommateId) {
      // Review for a roommate
      reviewData.roommateId = roommateId;
      reviewData.reviewee = roommateId;

      const review = await Review.create(reviewData);

      // Update roommate rating
      const roommate = await User.findById(roommateId);
      const roommateReviews = await Review.find({ roommateId });
      const roommateAvgRating = roommateReviews.reduce((sum, r) => sum + r.rating, 0) / roommateReviews.length;
      roommate.ratings.asRoommate = Math.round(roommateAvgRating * 10) / 10;
      await roommate.save();

      await review.populate('reviewer', 'firstName lastName');
      return res.status(201).json({
        success: true,
        review,
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Must provide either listingId or roommateId',
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating review',
    });
  }
};

/**
 * @desc    Get reviews for a listing
 * @route   GET /api/reviews/listing/:id
 * @access  Public
 */
export const getListingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const reviews = await Review.find({ listingId: req.params.id })
      .populate('reviewer', 'firstName lastName')
      .sort(sort)
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ listingId: req.params.id });

    res.json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      reviews,
    });
  } catch (error) {
    console.error('Get listing reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching reviews',
    });
  }
};

/**
 * @desc    Get reviews for a user (landlord or roommate)
 * @route   GET /api/reviews/user/:id
 * @access  Public
 */
export const getUserReviews = async (req, res) => {
  try {
    const { type = 'landlord' } = req.query;

    const query = type === 'landlord'
      ? { reviewee: req.params.id, listingId: { $exists: true } }
      : { roommateId: req.params.id };

    const reviews = await Review.find(query)
      .populate('reviewer', 'firstName lastName')
      .populate('listingId', 'title city state')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching reviews',
    });
  }
};

/**
 * @desc    Respond to a review (landlord)
 * @route   POST /api/reviews/:id/response
 * @access  Private (Review owner)
 */
export const respondToReview = async (req, res) => {
  try {
    const { responseText } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    // Check if user is the reviewee
    if (review.reviewee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to respond to this review',
      });
    }

    review.response = {
      text: responseText,
      date: new Date(),
    };

    await review.save();

    res.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error('Respond to review error:', error);
    res.status(500).json({
      success: false,
      error: 'Error responding to review',
    });
  }
};

/**
 * @desc    Report a review
 * @route   POST /api/reviews/:id/report
 * @access  Private
 */
export const reportReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    review.reported = true;
    await review.save();

    res.json({
      success: true,
      message: 'Review reported successfully',
    });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({
      success: false,
      error: 'Error reporting review',
    });
  }
};

/**
 * @desc    Delete own review
 * @route   DELETE /api/reviews/:id
 * @access  Private (Review author)
 */
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }

    // Check if user is the reviewer
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this review',
      });
    }

    // Check if within 24 hours
    const hoursSinceCreation = (Date.now() - review.createdAt) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete review after 24 hours',
      });
    }

    await review.deleteOne();

    // Update listing average rating if it was a listing review
    if (review.listingId) {
      const listing = await Listing.findById(review.listingId);
      listing.reviews = listing.reviews.filter(id => id.toString() !== review._id.toString());
      
      const remainingReviews = await Review.find({ listingId: review.listingId });
      if (remainingReviews.length > 0) {
        const avgRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length;
        listing.averageRating = Math.round(avgRating * 10) / 10;
      } else {
        listing.averageRating = 0;
      }
      await listing.save();
    }

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting review',
    });
  }
};

