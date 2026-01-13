import User from '../models/User.js';

/**
 * Check if username is available
 * @route   GET /api/users/check-username/:username
 * @access  Public
 */
export const checkUsernameAvailability = async (req, res) => {
    try {
        const { username } = req.params;

        // Validate format
        if (!username || username.length < 3 || username.length > 20) {
            return res.status(400).json({
                success: false,
                available: false,
                error: 'Username must be 3-20 characters'
            });
        }

        if (!/^[a-z0-9._]+$/.test(username.toLowerCase())) {
            return res.status(400).json({
                success: false,
                available: false,
                error: 'Username can only contain letters, numbers, dots and underscores'
            });
        }

        const existing = await User.findOne({ username: username.toLowerCase() });

        res.json({
            success: true,
            available: !existing,
            username: username.toLowerCase()
        });
    } catch (error) {
        console.error('Check username error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error checking username'
        });
    }
};

/**
 * Set or update username for current user
 * @route   PATCH /api/users/username
 * @access  Private
 */
export const setUsername = async (req, res) => {
    try {
        const { username } = req.body;

        // Validate format
        if (!username || username.length < 3 || username.length > 20) {
            return res.status(400).json({
                success: false,
                error: 'Username must be 3-20 characters'
            });
        }

        const normalizedUsername = username.toLowerCase().trim();

        if (!/^[a-z0-9._]+$/.test(normalizedUsername)) {
            return res.status(400).json({
                success: false,
                error: 'Username can only contain letters, numbers, dots and underscores'
            });
        }

        // Check if already taken (by someone else)
        const existing = await User.findOne({
            username: normalizedUsername,
            _id: { $ne: req.user._id }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Username is already taken'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { username: normalizedUsername },
            { new: true }
        );

        res.json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        console.error('Set username error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Username is already taken'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server error setting username'
        });
    }
};

/**
 * Search users by username
 * @route   GET /api/users/search?q=username
 * @access  Private
 */
export const searchByUsername = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json({
                success: true,
                users: []
            });
        }

        const searchQuery = q.toLowerCase().replace(/^@/, ''); // Remove @ prefix if present

        const users = await User.find({
            $or: [
                { username: { $regex: searchQuery, $options: 'i' } },
                { firstName: { $regex: searchQuery, $options: 'i' } },
                { lastName: { $regex: searchQuery, $options: 'i' } }
            ],
            _id: { $ne: req.user._id } // Exclude current user
        })
            .select('_id username firstName lastName profilePicture school')
            .limit(10);

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error searching users'
        });
    }
};

/**
 * Get user by username
 * @route   GET /api/users/by-username/:username
 * @access  Private
 */
export const getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username: username.toLowerCase() })
            .select('_id username firstName lastName profilePicture school graduationYear');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user by username error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};
