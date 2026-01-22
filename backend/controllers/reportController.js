import Report from '../models/Report.js';

/**
 * @desc    Create a new report
 * @route   POST /api/reports
 * @access  Private
 */
export const createReport = async (req, res) => {
    try {
        const {
            targetType,
            targetId,
            reason,
            description,
            evidence,
        } = req.body;

        const reportData = {
            reporter: req.user._id,
            targetType,
            reason,
            description,
            evidence,
        };

        if (targetType === 'User') {
            reportData.targetUser = targetId;
        } else if (targetType === 'Listing') {
            reportData.targetListing = targetId;
        } else {
            return res.status(400).json({ error: 'Invalid target type' });
        }

        const report = await Report.create(reportData);

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully',
            report,
        });
    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error submitting report',
        });
    }
};

/**
 * @desc    Get all reports (Admin only)
 * @route   GET /api/reports
 * @access  Private/Admin
 */
export const getReports = async (req, res) => {
    try {
        // TODO: Add admin check middleware
        const reports = await Report.find()
            .populate('reporter', 'firstName lastName email')
            .populate('targetUser', 'firstName lastName email')
            .populate('targetListing', 'title address')
            .populate('targetPost', 'title description')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reports.length,
            reports,
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching reports',
        });
    }
};

/**
 * @desc    Update report status (Resolve/Dismiss)
 * @route   PUT /api/reports/:id/status
 * @access  Private/Admin
 */
export const updateReportStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body; // status: 'resolved', 'dismissed', 'pending'

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }

        report.status = status;
        if (adminNotes) {
            report.adminNotes = adminNotes;
        }
        report.resolvedBy = req.user._id;
        report.resolvedAt = Date.now();

        await report.save();

        res.json({
            success: true,
            report
        });
    } catch (error) {
        console.error('Update report error:', error);
        res.status(500).json({ success: false, error: 'Error updating report' });
    }
};
