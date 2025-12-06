import Listing from '../models/Listing.js';
import User from '../models/User.js';
import ThreadMember from '../models/ThreadMember.js';
import Thread from '../models/Thread.js';

export const getDashboardMetrics = async (req, res) => {
    try {
        const landlordId = req.user._id;

        // Get all listings for this landlord
        const listings = await Listing.find({ landlord: landlordId });

        // Calculate metrics
        const totalListings = listings.length;
        const activeListings = listings.filter(l => l.isActive).length;

        // Aggregating total views from all listings
        const totalViews = listings.reduce((sum, listing) => sum + (listing.totalViews || 0), 0);

        // Count messages in threads where landlord is a participant
        let totalMessages = 0;
        try {
            const landlordThreads = await ThreadMember.find({ user: landlordId }).distinct('thread');
            totalMessages = landlordThreads.length;
        } catch (e) {
            console.error('Error counting messages:', e);
        }

        res.status(200).json({
            metrics: {
                totalListings,
                activeListings,
                totalViews,
                totalMessages
            }
        });
    } catch (error) {
        console.error('Error fetching landlord dashboard metrics:', error);
        res.status(500).json({ message: 'Error fetching dashboard metrics' });
    }
};

// Get all listings for the landlord
export const getLandlordListings = async (req, res) => {
    try {
        const landlordId = req.user._id;
        const listings = await Listing.find({ landlord: landlordId })
            .sort({ createdAt: -1 });
        res.json({ listings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Boost a listing
export const boostListing = async (req, res) => {
    try {
        const { listingId } = req.params;
        const { days = 7 } = req.body; // Default 7 days boost

        const listing = await Listing.findById(listingId);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Verify ownership
        if (listing.landlord.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Activate boost
        listing.boost = {
            active: true,
            expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
        };

        await listing.save();

        res.json({
            message: 'Listing boosted successfully',
            listing
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove boost from a listing
export const unboostListing = async (req, res) => {
    try {
        const { listingId } = req.params;

        const listing = await Listing.findById(listingId);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.landlord.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        listing.boost = { active: false, expiresAt: null };
        await listing.save();

        res.json({ message: 'Boost removed', listing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
