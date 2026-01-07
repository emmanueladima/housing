import Listing from '../models/Listing.js';
import User from '../models/User.js';
import notificationService from '../services/notificationService.js';

/**
 * @desc    Get all listings with filtering
 * @route   GET /api/listings
 * @access  Public
 */
export const getListings = async (req, res) => {
  try {
    const {
      city,
      state,
      zipCode,
      priceMin,
      priceMax,
      bedrooms,
      bathrooms,
      amenities,
      leaseTerms,
      availableDate,
      maxDistance,
      utilitiesIncluded,
      sqftMin,
      sqftMax,
      tags,
      sublease,
      university,
      sortBy,
      page = 1,
      limit = 12,
      propertyType, // New: filter by property type (apartment, house, etc.)
      furnished, // New: filter for furnished listings
      parkingSpots, // New: minimum parking spots required
      verifiedLandlordsOnly, // New: only show verified landlords
      petFriendly, // New: pet-friendly filter
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (city) query.city = new RegExp(city, 'i');
    if (state) query.state = new RegExp(state, 'i');
    if (zipCode) query.zipCode = zipCode;
    if (university) query.university = new RegExp(university, 'i');

    // Price range
    if (priceMin || priceMax) {
      query.rent = {};
      if (priceMin) query.rent.$gte = Number(priceMin);
      if (priceMax) query.rent.$lte = Number(priceMax);
    }

    // Bedrooms and bathrooms
    if (bedrooms) query.bedrooms = Number(bedrooms);
    if (bathrooms) query.bathrooms = { $gte: Number(bathrooms) };

    // Square footage
    if (sqftMin || sqftMax) {
      query.sqft = {};
      if (sqftMin) query.sqft.$gte = Number(sqftMin);
      if (sqftMax) query.sqft.$lte = Number(sqftMax);
    }

    // Amenities (all must be present)
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
      query.amenities = { $all: amenitiesArray };
    }

    // Lease terms
    if (leaseTerms) {
      const termsArray = Array.isArray(leaseTerms) ? leaseTerms : [leaseTerms];
      query.leaseTerm = { $in: termsArray };
    }

    // Tags/property types
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagsArray };
    }

    // Utilities included
    if (utilitiesIncluded) {
      const utilitiesArray = Array.isArray(utilitiesIncluded) ? utilitiesIncluded : [utilitiesIncluded];
      utilitiesArray.forEach(utility => {
        query[`utilities.${utility}`] = true;
      });
    }

    // Available date
    if (availableDate) {
      query.availableDate = { $lte: new Date(availableDate) };
    }

    // Sublease filter
    if (sublease === 'true') {
      query.isSublease = true;
    }

    // Property type filter (using tags)
    if (propertyType) {
      const propertyTypes = Array.isArray(propertyType) ? propertyType : [propertyType];
      query.tags = { $in: propertyTypes };
    }

    // Furnished filter (check if 'furnished' is in amenities)
    if (furnished === 'true') {
      query.amenities = query.amenities
        ? { ...query.amenities, $all: [...(query.amenities.$all || []), 'furnished'] }
        : { $all: ['furnished'] };
    }

    // Pet-friendly filter
    if (petFriendly === 'true') {
      query['rules.petsAllowed'] = true;
    }

    // Verified landlords only
    if (verifiedLandlordsOnly === 'true') {
      // We'll need to populate and filter by landlord.isVerifiedLandlord
      // This will be handled in the populate step
    }

    // Distance to university (would need coordinates in real implementation)
    // This is a placeholder - in production, use geospatial queries

    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'price-low-high':
        sort = { rent: 1 };
        break;
      case 'price-high-low':
        sort = { rent: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'popular':
        sort = { totalViews: -1 };
        break;
      case 'closest':
        sort = { distanceToUniversity: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    let listings = await Listing.find(query)
      .populate('landlord', 'firstName lastName isVerifiedLandlord ratings role landlordProfile')
      .sort(sort)
      .limit(Number(limit))
      .skip(skip);

    // Filter by verified landlords if requested (post-query filter)
    if (verifiedLandlordsOnly === 'true') {
      listings = listings.filter(listing => listing.landlord?.isVerifiedLandlord === true);
    }

    // Get total count for pagination
    const total = await Listing.countDocuments(query);

    res.json({
      success: true,
      count: listings.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      listings,
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching listings',
    });
  }
};

/**
 * @desc    Get single listing by ID
 * @route   GET /api/listings/:id
 * @access  Public
 */
export const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('landlord', 'firstName lastName email phone isVerifiedLandlord ratings role landlordProfile')
      .populate({
        path: 'reviews',
        populate: { path: 'reviewer', select: 'firstName lastName' }
      });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
    }

    // Increment view count
    listing.totalViews += 1;
    await listing.save();

    res.json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching listing',
    });
  }
};

/**
 * @desc    Get favorite listings
 * @route   GET /api/listings/favorites
 * @access  Private
 */
export const getFavoriteListings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const favorites = await Listing.find({
      _id: { $in: user.favorites }
    }).populate('landlord', 'firstName lastName isVerifiedLandlord');

    res.json({
      success: true,
      count: favorites.length,
      listings: favorites,
    });
  } catch (error) {
    console.error('Error fetching favorite listings:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching favorite listings',
    });
  }
};

/**
 * @desc    Create new listing
 * @route   POST /api/listings
 * @access  Private (Landlord)
 */
export const createListing = async (req, res) => {
  try {
    const listingData = {
      ...req.body,
      landlord: req.user._id,
    };

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      listingData.images = req.files.map(file => file.path); // Cloudinary provides full URL in file.path
    }

    // Permission check: Only landlords can create regular listings
    // Students can only create subleases
    if (req.user.userType !== 'landlord' && !req.body.isSublease) {
      return res.status(403).json({
        success: false,
        error: 'Only landlords can create regular listings. Students must mark as sublease.',
      });
    }

    // Add verified landlord badge if applicable
    if (req.user.isVerifiedLandlord) {
      listingData.badges = ['verified-landlord', ...(listingData.badges || [])];
    }

    // If student sublease, ensure sublease details are present
    if (req.body.isSublease === 'true' || req.body.isSublease === true) {
      listingData.isSublease = true;
      if (!listingData.subleaseDetails) {
        // If details came as separate fields
        listingData.subleaseDetails = {
          originalLeaseEnd: req.body.originalLeaseEnd,
          reason: req.body.reason,
          originalTenant: req.user._id
        };
      } else if (typeof listingData.subleaseDetails === 'string') {
        try {
          listingData.subleaseDetails = JSON.parse(listingData.subleaseDetails);
          listingData.subleaseDetails.originalTenant = req.user._id;
        } catch (e) {
          // ignore parse error
        }
      }

      // Add sublease badge
      listingData.badges = ['sublease', ...(listingData.badges || [])];
    }

    // Parse amenities if it's a string (from FormData)
    if (typeof listingData.amenities === 'string') {
      try {
        listingData.amenities = JSON.parse(listingData.amenities);
      } catch (e) {
        console.error('Error parsing amenities:', e);
        listingData.amenities = [];
      }
    }

    // Parse coordinates if it's a string (from FormData)
    if (typeof listingData.coordinates === 'string') {
      try {
        listingData.coordinates = JSON.parse(listingData.coordinates);
      } catch (e) {
        console.error('Error parsing coordinates:', e);
        listingData.coordinates = null;
      }
    }

    // Ensure coordinates are stored in location.coordinates for map display
    if (listingData.coordinates?.lat && listingData.coordinates?.lng) {
      listingData.location = {
        ...(listingData.location || {}),
        coordinates: {
          lat: parseFloat(listingData.coordinates.lat),
          lng: parseFloat(listingData.coordinates.lng)
        }
      };
    }

    const listing = await Listing.create(listingData);

    // Populate landlord info
    await listing.populate('landlord', 'firstName lastName isVerifiedLandlord');

    res.status(201).json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating listing',
    });
  }
};

/**
 * @desc    Update listing
 * @route   PUT /api/listings/:id
 * @access  Private (Listing owner)
 */
export const updateListing = async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
    }

    // Check ownership
    if (listing.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this listing',
      });
    }

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      req.body.images = [...(listing.images || []), ...newImages];
    }

    // Parse amenities if it's a string
    if (typeof req.body.amenities === 'string') {
      try {
        req.body.amenities = JSON.parse(req.body.amenities);
      } catch (e) {
        console.error('Error parsing amenities:', e);
        // Don't overwrite if parse fails, or handle as needed
      }
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('landlord', 'firstName lastName isVerifiedLandlord');

    res.json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating listing',
    });
  }
};

/**
 * @desc    Delete listing
 * @route   DELETE /api/listings/:id
 * @access  Private (Listing owner)
 */
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
    }

    // Check ownership
    if (listing.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this listing',
      });
    }

    await listing.deleteOne();

    res.json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting listing',
    });
  }
};

/**
 * @desc    Toggle favorite listing
 * @route   POST /api/listings/:id/favorite
 * @access  Private
 */
export const toggleFavorite = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
    }

    const user = await User.findById(req.user._id);

    // Check if already favorited
    const favorites = user.favorites || [];
    const isFavorited = favorites.some(
      id => id.toString() === listing._id.toString()
    );

    // Use findByIdAndUpdate to avoid triggering validation
    if (isFavorited) {
      // Remove from favorites
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { favorites: listing._id } },
        { new: true }
      );
    } else {
      // Add to favorites
      await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { favorites: listing._id } },
        { new: true }
      );
    }

    res.json({
      success: true,
      isFavorited: !isFavorited,
      message: isFavorited ? 'Removed from favorites' : 'Added to favorites',
    });
  } catch (error) {
    console.error('Toggle favorite error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Error toggling favorite',
    });
  }
};

/**
 * @desc    Convert listing to sublease
 * @route   POST /api/listings/:id/sublease
 * @access  Private (Listing owner)
 */
export const convertToSublease = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
    }

    // Check ownership
    if (listing.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this listing',
      });
    }

    const { originalLeaseEnd, reason } = req.body;

    listing.isSublease = true;
    listing.subleaseDetails = {
      originalLeaseEnd,
      reason,
      originalTenant: req.user._id,
    };

    if (!listing.badges.includes('sublease')) {
      listing.badges.push('sublease');
    }

    await listing.save();

    res.json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error('Convert to sublease error:', error);
    res.status(500).json({
      success: false,
      error: 'Error converting to sublease',
    });
  }
};

/**
 * @desc    Get user's own listings (landlord)
 * @route   GET /api/listings/my-listings
 * @access  Private
 */
export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ landlord: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching your listings',
    });
  }
};

