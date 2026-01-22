import Listing from '../models/Listing.js';
import AdminLog from '../models/AdminLog.js';

/**
 * @desc    Get paginated listings with search and filters
 * @route   GET /api/admin/listings
 * @access  Private/Admin
 */
export const getListings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status || 'all'; // active, disabled, all
        const skip = (page - 1) * limit;

        const query = {};

        // Search by title, address, or city
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by status
        if (status !== 'all') {
            if (status === 'active') query.isActive = true;
            if (status === 'disabled') query.isActive = false;
        }

        const listings = await Listing.find(query)
            .populate('landlord', 'firstName lastName email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Listing.countDocuments(query);

        res.json({
            success: true,
            listings,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin Get Listings Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * @desc    Delete a listing (Admin override)
 * @route   DELETE /api/admin/listings/:id
 * @access  Private/Admin
 */
export const deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ success: false, error: 'Listing not found' });
        }

        await listing.deleteOne();

        // Log the admin action
        await AdminLog.create({
            admin: req.user._id,
            action: 'DELETE_LISTING',
            targetType: 'Listing',
            targetId: listing._id,
            details: { title: listing.title, address: listing.address },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({ success: true, message: 'Listing deleted successfully' });
    } catch (error) {
        console.error('Admin Delete Listing Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
