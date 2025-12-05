import SavedSearch from '../models/SavedSearch.js';
import Listing from '../models/Listing.js';

/**
 * @desc    Save a search
 * @route   POST /api/saved-searches
 * @access  Private
 */
export const saveSearch = async (req, res) => {
  try {
    const { name, searchCriteria, alertsEnabled } = req.body;

    const savedSearch = await SavedSearch.create({
      userId: req.user._id,
      name,
      searchCriteria,
      alertsEnabled,
    });

    res.status(201).json({
      success: true,
      savedSearch,
    });
  } catch (error) {
    console.error('Save search error:', error);
    res.status(500).json({
      success: false,
      error: 'Error saving search',
    });
  }
};

/**
 * @desc    Get user's saved searches
 * @route   GET /api/saved-searches
 * @access  Private
 */
export const getSavedSearches = async (req, res) => {
  try {
    const savedSearches = await SavedSearch.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: savedSearches.length,
      savedSearches,
    });
  } catch (error) {
    console.error('Get saved searches error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching saved searches',
    });
  }
};

/**
 * @desc    Update saved search
 * @route   PUT /api/saved-searches/:id
 * @access  Private
 */
export const updateSavedSearch = async (req, res) => {
  try {
    let savedSearch = await SavedSearch.findById(req.params.id);

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        error: 'Saved search not found',
      });
    }

    // Check ownership
    if (savedSearch.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }

    savedSearch = await SavedSearch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      savedSearch,
    });
  } catch (error) {
    console.error('Update saved search error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating saved search',
    });
  }
};

/**
 * @desc    Delete saved search
 * @route   DELETE /api/saved-searches/:id
 * @access  Private
 */
export const deleteSavedSearch = async (req, res) => {
  try {
    const savedSearch = await SavedSearch.findById(req.params.id);

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        error: 'Saved search not found',
      });
    }

    // Check ownership
    if (savedSearch.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }

    await savedSearch.deleteOne();

    res.json({
      success: true,
      message: 'Saved search deleted',
    });
  } catch (error) {
    console.error('Delete saved search error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting saved search',
    });
  }
};

/**
 * @desc    Check for new listings matching saved search
 * @route   GET /api/saved-searches/:id/new-listings
 * @access  Private
 */
export const checkNewListings = async (req, res) => {
  try {
    const savedSearch = await SavedSearch.findById(req.params.id);

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        error: 'Saved search not found',
      });
    }

    // Check ownership
    if (savedSearch.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }

    // Build query from search criteria
    const query = { 
      isActive: true,
      createdAt: { $gt: savedSearch.lastChecked },
    };

    const criteria = savedSearch.searchCriteria;

    if (criteria.city) query.city = new RegExp(criteria.city, 'i');
    if (criteria.state) query.state = new RegExp(criteria.state, 'i');
    if (criteria.university) query.university = new RegExp(criteria.university, 'i');

    if (criteria.priceMin || criteria.priceMax) {
      query.rent = {};
      if (criteria.priceMin) query.rent.$gte = criteria.priceMin;
      if (criteria.priceMax) query.rent.$lte = criteria.priceMax;
    }

    if (criteria.bedrooms) query.bedrooms = criteria.bedrooms;
    if (criteria.bathrooms) query.bathrooms = { $gte: criteria.bathrooms };

    if (criteria.amenities && criteria.amenities.length > 0) {
      query.amenities = { $all: criteria.amenities };
    }

    if (criteria.sublease) query.isSublease = criteria.sublease;

    // Find new listings
    const newListings = await Listing.find(query)
      .populate('landlord', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Update lastChecked and newListingsCount
    savedSearch.lastChecked = new Date();
    savedSearch.newListingsCount = newListings.length;
    await savedSearch.save();

    res.json({
      success: true,
      count: newListings.length,
      listings: newListings,
    });
  } catch (error) {
    console.error('Check new listings error:', error);
    res.status(500).json({
      success: false,
      error: 'Error checking new listings',
    });
  }
};

