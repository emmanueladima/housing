import LifestyleProfile from '../models/LifestyleProfile.js';
import User from '../models/User.js';
import Match from '../models/Match.js';
import aiMatchingService from '../services/aiMatchingService.js';

/**
 * @desc    Create or update lifestyle profile
 * @route   POST /api/lifestyle-profiles/me
 * @access  Private
 */
export const createOrUpdateProfile = async (req, res) => {
    try {
        const profileData = {
            ...req.body,
            user: req.user._id,
        };

        // Handle uploaded photo from Cloudinary
        if (req.file && req.file.path) {
            profileData.photo = req.file.path;
        }

        // Parse JSON fields from FormData
        const jsonFields = [
            'sleepSchedule', 'budget', 'interests', 'vibes', 'lookingFor',
            'vibeTags', 'compatibilityAnswers', 'petTypes', 'allergyTypes',
            'studyLocations', 'weeklySchedule'
        ];

        jsonFields.forEach(field => {
            if (typeof profileData[field] === 'string') {
                try {
                    profileData[field] = JSON.parse(profileData[field]);
                } catch (e) {
                    // Ignore parse errors, keep as string or let validation fail
                }
            }
        });

        // Check if profile already exists
        let profile = await LifestyleProfile.findOne({ user: req.user._id });

        if (profile) {
            // Update existing profile
            profile = await LifestyleProfile.findOneAndUpdate(
                { user: req.user._id },
                profileData,
                { new: true, runValidators: true }
            ).populate('user', 'firstName lastName email school graduationYear');

            // Sync photo to User.avatar if updated
            if (profileData.photo) {
                await User.findByIdAndUpdate(req.user._id, { avatar: profileData.photo });
            }
        } else {
            // Create new profile
            profile = await LifestyleProfile.create(profileData);
            await profile.populate('user', 'firstName lastName email school graduationYear');

            // Update user's profile reference and avatar if photo was uploaded
            const userUpdate = {
                roommateProfile: profile._id,
            };

            // If we have a photo, sync it to User.avatar
            if (profileData.photo) {
                userUpdate.avatar = profileData.photo;
            }

            await User.findByIdAndUpdate(req.user._id, userUpdate);
        }

        res.status(profile.isNew ? 201 : 200).json({
            success: true,
            profile,
        });
    } catch (error) {
        console.error('Create/Update profile error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error saving profile',
        });
    }
};

/**
 * @desc    Get current user's lifestyle profile
 * @route   GET /api/lifestyle-profiles/me
 * @access  Private
 */
export const getMyProfile = async (req, res) => {
    try {
        let profile = await LifestyleProfile.findOne({ user: req.user._id })
            .populate('user', 'firstName lastName email school graduationYear');

        if (!profile) {
            // Optional: Create default profile if not exists, or return 404
            // For now, let's return 404 to encourage creation flow, or create default like previous route did
            // The previous route created a default one. Let's stick to that for smoother UX.
            profile = await LifestyleProfile.create({ user: req.user._id });
            await User.findByIdAndUpdate(req.user._id, { roommateProfile: profile._id });
        }

        res.json({
            success: true,
            profile,
        });
    } catch (error) {
        console.error('Get my profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching profile',
        });
    }
};

/**
 * @desc    Get all active lifestyle profiles (for browsing)
 * @route   GET /api/lifestyle-profiles/all
 * @access  Private
 */
export const getAllProfiles = async (req, res) => {
    try {
        const profiles = await LifestyleProfile.find({
            user: { $ne: req.user._id }, // Exclude current user
            lookingForRoommate: true, // Only show profiles that opted in
        }).populate('user', 'firstName lastName school graduationYear profilePhoto');

        res.json({
            success: true,
            count: profiles.length,
            profiles,
        });
    } catch (error) {
        console.error('Get all profiles error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching profiles',
        });
    }
};

/**
 * @desc    Get roommate matches with compatibility scores
 * @route   GET /api/lifestyle-profiles/matches
 * @access  Private
 */
export const getMatches = async (req, res) => {
    try {
        // Get current user's profile
        const myProfile = await LifestyleProfile.findOne({ user: req.user._id });

        if (!myProfile) {
            return res.status(404).json({
                success: false,
                error: 'Please complete your lifestyle profile first',
            });
        }

        // Get query filters
        const {
            genderPreference,
            minAge,
            maxAge,
            minCompatibility = 0,
        } = req.query;

        // Get IDs of users already matched/pending/rejected
        const existingMatches = await Match.find({
            users: req.user._id,
        }).select('users');

        const excludedUserIds = [req.user._id];
        existingMatches.forEach(match => {
            match.users.forEach(userId => {
                if (userId.toString() !== req.user._id.toString()) {
                    excludedUserIds.push(userId);
                }
            });
        });

        // Get all profiles except excluded users
        let candidates = await LifestyleProfile.find({
            user: { $nin: excludedUserIds },
        }).populate('user', 'firstName lastName school graduationYear');

        // Apply filters using service or manual logic
        // Note: aiMatchingService.filterByPreferences expects 'lookingFor' structure which we added
        candidates = aiMatchingService.filterByPreferences(myProfile, candidates);

        // Calculate compatibility for each candidate
        const matches = candidates.map(candidate => {
            const compatibility = aiMatchingService.calculateCompatibility(
                myProfile,
                candidate
            );

            return {
                profile: candidate,
                compatibility: {
                    score: compatibility.score,
                    level: aiMatchingService.getCompatibilityLevel(compatibility.score),
                    reasons: compatibility.reasons,
                    categoryScores: compatibility.categoryScores,
                },
            };
        });

        // Filter by minimum compatibility
        const filteredMatches = matches.filter(
            match => match.compatibility.score >= Number(minCompatibility)
        );

        // Sort by compatibility score (highest first)
        filteredMatches.sort((a, b) => b.compatibility.score - a.compatibility.score);

        res.json({
            success: true,
            count: filteredMatches.length,
            matches: filteredMatches,
        });
    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({
            success: false,
            error: 'Error calculating matches',
        });
    }
};

/**
 * @desc    Get specific profile by ID
 * @route   GET /api/lifestyle-profiles/:id
 * @access  Private
 */
export const getProfile = async (req, res) => {
    try {
        const profile = await LifestyleProfile.findById(req.params.id)
            .populate('user', 'firstName lastName email school graduationYear ratings');

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found',
            });
        }

        // Calculate compatibility if user has a profile
        let compatibility = null;
        const myProfile = await LifestyleProfile.findOne({ user: req.user._id });

        if (myProfile) {
            const compatibilityData = aiMatchingService.calculateCompatibility(
                myProfile,
                profile
            );
            compatibility = {
                score: compatibilityData.score,
                level: aiMatchingService.getCompatibilityLevel(compatibilityData.score),
                reasons: compatibilityData.reasons,
                categoryScores: compatibilityData.categoryScores,
            };
        }

        res.json({
            success: true,
            profile,
            compatibility,
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching profile',
        });
    }
};

/**
 * @desc    Toggle saved status of a profile
 * @route   POST /api/lifestyle-profiles/save/:id
 * @access  Private
 */
export const toggleSavedProfile = async (req, res) => {
    try {
        const profileId = req.params.id;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        // Check if profile exists
        const profile = await LifestyleProfile.findById(profileId);
        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found',
            });
        }

        // Initialize savedProfiles if it doesn't exist
        if (!user.savedProfiles) {
            user.savedProfiles = [];
        }

        const index = user.savedProfiles.indexOf(profileId);
        let isSaved = false;

        if (index > -1) {
            // Remove from saved
            user.savedProfiles.splice(index, 1);
            isSaved = false;
        } else {
            // Add to saved
            user.savedProfiles.push(profileId);
            isSaved = true;
        }

        await user.save();

        res.json({
            success: true,
            isSaved,
            savedProfiles: user.savedProfiles,
        });
    } catch (error) {
        console.error('Toggle saved profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Error toggling saved profile',
        });
    }
};

/**
 * @desc    Get saved profiles
 * @route   GET /api/lifestyle-profiles/saved
 * @access  Private
 */
export const getSavedProfiles = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'savedProfiles',
            populate: {
                path: 'user',
                select: 'firstName lastName email school graduationYear avatar'
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        res.json({
            success: true,
            count: user.savedProfiles ? user.savedProfiles.length : 0,
            profiles: user.savedProfiles || [],
        });
    } catch (error) {
        console.error('Get saved profiles error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching saved profiles',
        });
    }
};
/**
 * @desc    Save compatibility test results
 * @route   POST /api/lifestyle-profiles/compatibility-test
 * @access  Private
 */
export const saveCompatibilityTest = async (req, res) => {
    try {
        const { answers } = req.body;

        // Find user's profile
        let profile = await LifestyleProfile.findOne({ user: req.user._id });

        if (!profile) {
            // Create profile if it doesn't exist
            profile = await LifestyleProfile.create({ user: req.user._id });
            await User.findByIdAndUpdate(req.user._id, { roommateProfile: profile._id });
        }

        // Update compatibility answers
        profile.compatibilityAnswers = answers;

        // Calculate a simple score based on answers (just for demo/storage purposes)
        // In a real app, this would be a more complex vector calculation
        let score = 0;
        Object.values(answers).forEach(val => {
            // Just counting answered questions as "points" for now to show progress
            if (val) score += 10;
        });
        profile.compatibilityScore = score;

        await profile.save();

        res.json({
            success: true,
            profile,
        });
    } catch (error) {
        console.error('Save compatibility test error:', error);
        res.status(500).json({
            success: false,
            error: 'Error saving compatibility test',
        });
    }
};

/**
 * @desc    Boost my profile visibility
 * @route   POST /api/lifestyle-profiles/me/boost
 * @access  Private
 */
export const boostMyProfile = async (req, res) => {
    try {
        const { days = 7 } = req.body;

        let profile = await LifestyleProfile.findOne({ user: req.user._id });

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found. Create a profile first.',
            });
        }

        // Toggle boost
        if (profile.boost?.active) {
            profile.boost = { active: false, expiresAt: null };
        } else {
            profile.boost = {
                active: true,
                expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
            };
        }

        await profile.save();

        res.json({
            success: true,
            profile,
            message: profile.boost.active ? 'Profile boosted successfully!' : 'Boost removed',
        });
    } catch (error) {
        console.error('Boost profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Error boosting profile',
        });
    }
};
