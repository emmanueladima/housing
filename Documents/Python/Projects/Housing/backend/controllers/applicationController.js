import Application from '../models/Application.js';
import Listing from '../models/Listing.js';
import notificationService from '../services/notificationService.js';

/**
 * @desc    Submit application
 * @route   POST /api/applications
 * @access  Private
 */
export const submitApplication = async (req, res) => {
  try {
    const { listingId, moveInDate, leaseTerm, messageToLandlord } = req.body;

    // Check if listing exists
    const listing = await Listing.findById(listingId).populate('landlord');
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      userId: req.user._id,
      listingId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied to this listing',
      });
    }

    // Create application
    const application = await Application.create({
      userId: req.user._id,
      listingId,
      moveInDate,
      leaseTerm,
      messageToLandlord,
    });

    // Increment listing's total applications
    listing.totalApplications += 1;
    await listing.save();

    // Notify landlord
    const io = req.app.get('io');
    await notificationService.notifyNewApplication(
      io,
      listing.landlord._id,
      listing.title,
      req.user.fullName
    );

    res.status(201).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error submitting application',
    });
  }
};

/**
 * @desc    Get user's applications
 * @route   GET /api/applications
 * @access  Private
 */
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('listingId', 'title images rent bedrooms bathrooms city state')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching applications',
    });
  }
};

/**
 * @desc    Get applications received (landlord view)
 * @route   GET /api/applications/received
 * @access  Private (Landlord)
 */
export const getReceivedApplications = async (req, res) => {
  try {
    const { status } = req.query;

    // Get landlord's listings
    const listings = await Listing.find({ landlord: req.user._id });
    const listingIds = listings.map(l => l._id);

    // Build query
    const query = { listingId: { $in: listingIds } };
    if (status) {
      query.status = status;
    }

    // Get applications
    const applications = await Application.find(query)
      .populate('userId', 'firstName lastName email phone school graduationYear')
      .populate('listingId', 'title images rent city state')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('Get received applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching applications',
    });
  }
};

/**
 * @desc    Get applications for specific listing
 * @route   GET /api/applications/listing/:id
 * @access  Private (Listing owner)
 */
export const getListingApplications = async (req, res) => {
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
        error: 'Not authorized',
      });
    }

    const applications = await Application.find({ listingId: req.params.id })
      .populate('userId', 'firstName lastName email phone school graduationYear')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('Get listing applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching applications',
    });
  }
};

/**
 * @desc    Update application status
 * @route   PATCH /api/applications/:id
 * @access  Private (Landlord)
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, landlordResponse } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('listingId')
      .populate('userId');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found',
      });
    }

    // Check if user is the landlord
    if (application.listingId.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }

    application.status = status;
    if (landlordResponse) {
      application.landlordResponse = {
        message: landlordResponse,
        date: new Date(),
      };
    }

    await application.save();

    // Notify applicant
    const io = req.app.get('io');
    await notificationService.notifyApplicationStatus(
      io,
      application.userId._id,
      application.listingId._id,
      status,
      application.listingId.title
    );

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating application',
    });
  }
};

/**
 * @desc    Schedule tour
 * @route   POST /api/applications/:id/tour
 * @access  Private
 */
export const scheduleTour = async (req, res) => {
  try {
    const { date, time } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found',
      });
    }

    // Check if user owns this application
    if (application.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }

    application.tourScheduled = {
      date,
      time,
      confirmed: false,
    };

    await application.save();

    // Notify landlord
    const listing = await Listing.findById(application.listingId);
    const io = req.app.get('io');
    await notificationService.notifyTourScheduled(
      io,
      listing.landlord,
      listing.title,
      `${date} at ${time}`
    );

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Schedule tour error:', error);
    res.status(500).json({
      success: false,
      error: 'Error scheduling tour',
    });
  }
};

