import Application from '../models/Application.js';
import ApplicationTemplate from '../models/ApplicationTemplate.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import notificationService from '../services/notificationService.js';

/**
 * @desc    Submit application
 * @route   POST /api/applications
 * @access  Private
 */
export const submitApplication = async (req, res) => {
  try {
    const {
      listingId,
      moveInDate,
      leaseTerm,
      coverLetter,
      messageToLandlord, // legacy support
      applicantProfile,
      templateId
    } = req.body;

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

    // Create application with enhanced fields
    const applicationData = {
      userId: req.user._id,
      listingId,
      moveInDate,
      leaseTerm,
      coverLetter: coverLetter || messageToLandlord,
      messageToLandlord, // Keep for backward compatibility
      status: 'submitted',
      statusHistory: [{
        status: 'submitted',
        changedAt: new Date(),
        changedBy: req.user._id,
      }],
    };

    // Add applicant profile if provided
    if (applicantProfile) {
      applicationData.applicantProfile = applicantProfile;
    }

    // Track template usage
    if (templateId) {
      applicationData.templateUsed = templateId;
      await ApplicationTemplate.findByIdAndUpdate(templateId, {
        $inc: { timesUsed: 1 },
        lastUsedAt: new Date(),
      });
    }

    const application = await Application.create(applicationData);

    // Calculate and save score
    application.calculateScore(listing.rent);
    await application.save();

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
 * @desc    Quick Apply using template
 * @route   POST /api/applications/quick
 * @access  Private
 */
export const quickApply = async (req, res) => {
  try {
    const { listingId, templateId, customizations } = req.body;

    // Get listing
    const listing = await Listing.findById(listingId).populate('landlord');
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
    }

    // Check for existing application
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

    // Get template
    let template = null;
    if (templateId) {
      template = await ApplicationTemplate.findOne({
        _id: templateId,
        userId: req.user._id,
      });
    } else {
      // Get default template
      template = await ApplicationTemplate.findOne({
        userId: req.user._id,
        isDefault: true,
      });
    }

    // Build application from template + customizations
    const applicationData = {
      userId: req.user._id,
      listingId,
      moveInDate: customizations?.moveInDate || template?.preferredMoveInDate || new Date(),
      leaseTerm: customizations?.leaseTerm || template?.preferredLeaseTerm || 'academic-year',
      coverLetter: customizations?.coverLetter || template?.defaultCoverLetter || '',
      status: 'submitted',
      statusHistory: [{
        status: 'submitted',
        changedAt: new Date(),
        changedBy: req.user._id,
      }],
    };

    // Add applicant profile from template
    if (template) {
      applicationData.applicantProfile = {
        income: template.incomeInfo || {},
        references: template.references || [],
        creditScore: {
          range: template.creditScoreRange || 'not_provided',
          selfReported: true,
        },
      };
      applicationData.documents = template.documents || [];
      applicationData.templateUsed = template._id;

      // Update template usage
      template.timesUsed += 1;
      template.lastUsedAt = new Date();
      await template.save();
    }

    const application = await Application.create(applicationData);

    // Calculate and save score
    application.calculateScore(listing.rent);
    await application.save();

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
      templateUsed: !!template,
    });
  } catch (error) {
    console.error('Quick apply error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error submitting quick application',
    });
  }
};

/**
 * @desc    Get pre-fill data for application form
 * @route   GET /api/applications/prefill/:listingId
 * @access  Private
 */
export const getPrefillData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Get default template
    const template = await ApplicationTemplate.findOne({
      userId: req.user._id,
      isDefault: true,
    });

    // Get listing for context
    const listing = await Listing.findById(req.params.listingId);

    const prefillData = {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        school: user.school,
        graduationYear: user.graduationYear,
      },
      template: template ? {
        id: template._id,
        name: template.name,
        incomeInfo: template.incomeInfo,
        references: template.references,
        preferredMoveInDate: template.preferredMoveInDate,
        preferredLeaseTerm: template.preferredLeaseTerm,
        defaultCoverLetter: template.defaultCoverLetter,
        documents: template.documents,
        creditScoreRange: template.creditScoreRange,
      } : null,
      listing: listing ? {
        availableDate: listing.availableDate,
        leaseTerms: listing.leaseTerms,
        rent: listing.rent,
      } : null,
    };

    res.json({
      success: true,
      prefillData,
    });
  } catch (error) {
    console.error('Get prefill data error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching prefill data',
    });
  }
};

/**
 * @desc    Get user's applications (grouped by status for Kanban)
 * @route   GET /api/applications
 * @access  Private
 */
export const getMyApplications = async (req, res) => {
  try {
    const { grouped } = req.query;

    const applications = await Application.find({ userId: req.user._id })
      .populate('listingId', 'title images rent bedrooms bathrooms city state landlord')
      .sort({ createdAt: -1 });

    if (grouped === 'true') {
      // Group by status for Kanban view
      const grouped = {
        submitted: [],
        under_review: [],
        interview_scheduled: [],
        approved: [],
        rejected: [],
        withdrawn: [],
      };

      applications.forEach(app => {
        if (grouped[app.status]) {
          grouped[app.status].push(app);
        }
      });

      return res.json({
        success: true,
        count: applications.length,
        applications: grouped,
      });
    }

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
    const { status, listingId, grouped } = req.query;

    // Get landlord's listings
    const listings = await Listing.find({ landlord: req.user._id });
    const listingIds = listingId ? [listingId] : listings.map(l => l._id);

    // Build query
    const query = { listingId: { $in: listingIds } };
    if (status) {
      query.status = status;
    }

    // Get applications
    const applications = await Application.find(query)
      .populate('userId', 'firstName lastName email phone school graduationYear verification')
      .populate('listingId', 'title images rent city state')
      .populate('coApplicants.user', 'firstName lastName email')
      .sort({ 'score.total': -1, createdAt: -1 });

    // Mark as viewed if first time
    const unviewedIds = applications
      .filter(app => !app.firstViewedAt)
      .map(app => app._id);

    if (unviewedIds.length > 0) {
      await Application.updateMany(
        { _id: { $in: unviewedIds } },
        { firstViewedAt: new Date() }
      );
    }

    if (grouped === 'true') {
      // Group by status for Kanban view
      const groupedApps = {
        submitted: [],
        under_review: [],
        interview_scheduled: [],
        approved: [],
        rejected: [],
        withdrawn: [],
      };

      applications.forEach(app => {
        if (groupedApps[app.status]) {
          groupedApps[app.status].push(app);
        }
      });

      return res.json({
        success: true,
        count: applications.length,
        applications: groupedApps,
        listings: listings.map(l => ({ _id: l._id, title: l.title })),
      });
    }

    res.json({
      success: true,
      count: applications.length,
      applications,
      listings: listings.map(l => ({ _id: l._id, title: l.title })),
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
      .populate('userId', 'firstName lastName email phone school graduationYear verification')
      .populate('coApplicants.user', 'firstName lastName email')
      .sort({ 'score.total': -1, createdAt: -1 });

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
 * @desc    Get single application details
 * @route   GET /api/applications/:id
 * @access  Private
 */
export const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone school graduationYear verification')
      .populate('listingId')
      .populate('coApplicants.user', 'firstName lastName email')
      .populate('templateUsed', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found',
      });
    }

    // Check authorization (applicant or landlord)
    const isApplicant = application.userId._id.toString() === req.user._id.toString();
    const isLandlord = application.listingId.landlord.toString() === req.user._id.toString();

    if (!isApplicant && !isLandlord) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }

    // Mark as viewed for landlord
    if (isLandlord && !application.firstViewedAt) {
      application.firstViewedAt = new Date();
      await application.save();
    }

    // Remove landlord notes if viewer is applicant
    if (isApplicant) {
      application.landlordNotes = undefined;
    }

    res.json({
      success: true,
      application,
      role: isLandlord ? 'landlord' : 'applicant',
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching application',
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
    const { status, landlordResponse, landlordNotes } = req.body;

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

    // Track status change
    application._statusChangedBy = req.user._id;
    application.status = status;

    if (landlordResponse) {
      application.landlordResponse = {
        message: landlordResponse,
        date: new Date(),
      };
    }

    if (landlordNotes !== undefined) {
      application.landlordNotes = landlordNotes;
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
 * @desc    Bulk update application statuses
 * @route   PATCH /api/applications/bulk-status
 * @access  Private (Landlord)
 */
export const bulkUpdateStatus = async (req, res) => {
  try {
    const { applicationIds, status, landlordResponse } = req.body;

    // Verify ownership of all applications
    const applications = await Application.find({ _id: { $in: applicationIds } })
      .populate('listingId');

    const unauthorizedApps = applications.filter(
      app => app.listingId.landlord.toString() !== req.user._id.toString()
    );

    if (unauthorizedApps.length > 0) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update some applications',
      });
    }

    // Update all applications
    const updatePromises = applications.map(async (app) => {
      app._statusChangedBy = req.user._id;
      app.status = status;
      if (landlordResponse) {
        app.landlordResponse = {
          message: landlordResponse,
          date: new Date(),
        };
      }
      return app.save();
    });

    await Promise.all(updatePromises);

    // Send notifications
    const io = req.app.get('io');
    for (const app of applications) {
      await notificationService.notifyApplicationStatus(
        io,
        app.userId,
        app.listingId._id,
        status,
        app.listingId.title
      );
    }

    res.json({
      success: true,
      count: applications.length,
      message: `${applications.length} applications updated`,
    });
  } catch (error) {
    console.error('Bulk update status error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating applications',
    });
  }
};

/**
 * @desc    Withdraw application
 * @route   PATCH /api/applications/:id/withdraw
 * @access  Private (Applicant)
 */
export const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('listingId');

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

    // Can only withdraw pending applications
    if (['approved', 'rejected'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot withdraw an application that has already been decided',
      });
    }

    application._statusChangedBy = req.user._id;
    application.status = 'withdrawn';
    await application.save();

    // Notify landlord
    const io = req.app.get('io');
    // You could add a notifyApplicationWithdrawn method

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      error: 'Error withdrawing application',
    });
  }
};

/**
 * @desc    Compare applications
 * @route   POST /api/applications/compare
 * @access  Private (Landlord)
 */
export const compareApplications = async (req, res) => {
  try {
    const { applicationIds } = req.body;

    if (!applicationIds || applicationIds.length < 2 || applicationIds.length > 4) {
      return res.status(400).json({
        success: false,
        error: 'Please select 2-4 applications to compare',
      });
    }

    const applications = await Application.find({ _id: { $in: applicationIds } })
      .populate('userId', 'firstName lastName email phone school graduationYear verification')
      .populate('listingId', 'title rent landlord');

    // Verify ownership
    const unauthorizedApps = applications.filter(
      app => app.listingId.landlord.toString() !== req.user._id.toString()
    );

    if (unauthorizedApps.length > 0) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view some applications',
      });
    }

    // Build comparison data
    const comparisonData = applications.map(app => ({
      _id: app._id,
      applicant: {
        name: `${app.userId.firstName} ${app.userId.lastName}`,
        email: app.userId.email,
        phone: app.userId.phone,
        school: app.userId.school,
        graduationYear: app.userId.graduationYear,
        verified: app.userId.verification,
      },
      moveInDate: app.moveInDate,
      leaseTerm: app.leaseTerm,
      income: app.applicantProfile?.income,
      references: app.applicantProfile?.references?.length || 0,
      creditScore: app.applicantProfile?.creditScore?.range,
      documents: app.documents?.length || 0,
      backgroundCheck: app.backgroundCheck?.status,
      score: app.score,
      coverLetter: app.coverLetter,
      submittedAt: app.createdAt,
      status: app.status,
    }));

    res.json({
      success: true,
      comparison: comparisonData,
    });
  } catch (error) {
    console.error('Compare applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Error comparing applications',
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
    const { date, time, location, meetingLink, notes } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('listingId')
      .populate('userId');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found',
      });
    }

    // Check authorization (applicant or landlord can schedule)
    const isApplicant = application.userId._id.toString() === req.user._id.toString();
    const isLandlord = application.listingId.landlord.toString() === req.user._id.toString();

    if (!isApplicant && !isLandlord) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }

    application.tourScheduled = {
      date,
      time,
      location: location || application.listingId.streetAddress,
      meetingLink,
      notes,
      confirmed: isLandlord, // Auto-confirm if landlord schedules
    };

    // Update status to interview_scheduled if landlord confirms
    if (isLandlord) {
      application._statusChangedBy = req.user._id;
      application.status = 'interview_scheduled';
    }

    await application.save();

    // Notify the other party
    const io = req.app.get('io');
    const notifyUserId = isLandlord ? application.userId._id : application.listingId.landlord;
    await notificationService.notifyTourScheduled(
      io,
      notifyUserId,
      application.listingId.title,
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

/**
 * @desc    Confirm/update tour
 * @route   PATCH /api/applications/:id/tour
 * @access  Private (Landlord)
 */
export const confirmTour = async (req, res) => {
  try {
    const { confirmed, date, time, location, meetingLink, notes } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('listingId')
      .populate('userId');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found',
      });
    }

    // Only landlord can confirm
    if (application.listingId.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }

    if (!application.tourScheduled) {
      application.tourScheduled = {};
    }

    // Update tour details
    if (date) application.tourScheduled.date = date;
    if (time) application.tourScheduled.time = time;
    if (location) application.tourScheduled.location = location;
    if (meetingLink !== undefined) application.tourScheduled.meetingLink = meetingLink;
    if (notes) application.tourScheduled.notes = notes;
    if (confirmed !== undefined) application.tourScheduled.confirmed = confirmed;

    // Update status if confirming
    if (confirmed) {
      application._statusChangedBy = req.user._id;
      application.status = 'interview_scheduled';
    }

    await application.save();

    // Notify applicant
    const io = req.app.get('io');
    await notificationService.notifyTourScheduled(
      io,
      application.userId._id,
      application.listingId.title,
      `${application.tourScheduled.date} at ${application.tourScheduled.time}`
    );

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Confirm tour error:', error);
    res.status(500).json({
      success: false,
      error: 'Error confirming tour',
    });
  }
};
