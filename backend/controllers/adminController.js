import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Report from '../models/Report.js';
import AdminLog from '../models/AdminLog.js';
import Application from '../models/Application.js';
import CommunityPost from '../models/CommunityPost.js';
import { generateToken } from '../middleware/auth.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalListings,
      pendingReports,
      newUsersLast30Days
    ] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // Daily User Growth (Last 365 days for flexible frontend filtering)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const dailyUserGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Simple monthly growth (kept for legacy or broader view if needed)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Application Status Stats (for Application Activity Chart)
    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Listings Price Distribution
    const listingPriceStats = await Listing.aggregate([
      {
        $bucket: {
          groupBy: "$price",
          boundaries: [0, 500, 1000, 1500, 2000, 3000, 5000, 10000],
          default: "10000+",
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalListings,
        pendingReports,
        newUsersLast30Days,
        userGrowth,
        dailyUserGrowth,
        dailyUserGrowth,
        applicationStats,
        listingPriceStats
      }
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Get paginated users with search
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin Get Users Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Impersonate a user (Login as)
 * @route   POST /api/admin/users/:id/impersonate
 * @access  Private/Admin
 */
export const impersonateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Security: Log this critical action
    await AdminLog.create({
      admin: req.user._id,
      action: 'IMPERSONATE_USER',
      targetType: 'User',
      targetId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Impersonation Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Ban or Unban a user
 * @route   POST /api/admin/users/:id/toggle-ban
 * @access  Private/Admin
 */
export const toggleBanUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // Prevent banning other admins
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, error: 'Cannot ban an admin' });
    }

    user.isBanned = !user.isBanned;
    user.banReason = user.isBanned ? reason : null;
    await user.save();

    await AdminLog.create({
      admin: req.user._id,
      action: user.isBanned ? 'USER_BAN' : 'USER_UNBAN',
      targetType: 'User',
      targetId: user._id,
      details: { reason },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
      isBanned: user.isBanned
    });

  } catch (error) {
    console.error('Toggle Ban Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Get audit logs
 * @route   GET /api/admin/logs
 * @access  Private/Admin
 */
export const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Default 20 logs
    const skip = (page - 1) * limit;

    const logs = await AdminLog.find()
      .populate('admin', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AdminLog.countDocuments();

    res.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Audit Logs Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Delete a community post
 * @route   DELETE /api/admin/posts/:id
 * @access  Private/Admin
 */
export const deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Admin Action: Soft delete / Remove
    post.status = 'removed';
    post.moderationReason = 'Removed by Admin';
    await post.save();

    // Log the action
    await AdminLog.create({
      admin: req.user._id,
      action: 'DELETE_POST',
      targetType: 'CommunityPost',
      targetId: post._id,
      details: { title: post.title },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Auto-resolve any pending reports for this post
    await Report.updateMany(
      { targetPost: post._id, status: 'pending' },
      {
        status: 'resolved',
        adminNotes: 'Content removed by admin',
        resolvedBy: req.user._id,
        resolvedAt: Date.now()
      }
    );

    res.json({ success: true, message: 'Post removed' });
  } catch (error) {
    console.error('Admin Delete Post Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
