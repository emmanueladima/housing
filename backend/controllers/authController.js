import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import emailService from '../services/emailService.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      school,
      graduationYear,
      userType,
      role, // Extracted from req.body
      landlordProfile, // Extracted from req.body
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email',
      });
    }

    // Check for admin email first (bypasses .edu requirement)
    const isAdminEmail = process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
    const isLandlord = userType === 'landlord';

    // Only require .edu for students (not admins or landlords)
    if (!isAdminEmail && !isLandlord && !email.endsWith('.edu')) {
      return res.status(400).json({
        success: false,
        error: 'Students must use a valid .edu email address',
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Set role and userType
    let userRole = 'student';
    let finalUserType = userType || 'student';

    if (isAdminEmail) {
      userRole = 'admin';
      finalUserType = 'both'; // Admins get full access
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // Will be hashed by pre-save hook
      phone,
      school,
      graduationYear,
      userType: finalUserType,
      role: userRole,
      verificationToken,
    });

    // Send verification email (non-blocking - don't let email issues block signup)
    emailService.sendVerificationEmail(user, verificationToken)
      .then(() => console.log('✅ Verification email sent to:', user.email))
      .catch((err) => console.error('⚠️ Failed to send verification email:', err.message));

    // DO NOT return token here - require email verification first
    res.status(201).json({
      success: true,
      message: 'Account created! Please check your email to verify your account before logging in.',
      requiresVerification: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email,
        isVerified: false,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating user',
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // Find user with password field and populate roommateProfile
    const user = await User.findOne({ email }).select('+password').populate('roommateProfile');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        needsVerification: true,
        email: user.email,
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        role: user.role,
        isVerified: user.isVerified,
        favorites: user.favorites || [],
        savedProfiles: user.savedProfiles || [],
        hasLifestyleProfile: !!user.roommateProfile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Error logging in',
    });
  }
};

/**
 * @desc    Verify email with token
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this verification token
    const user = await User.findOne({ verificationToken: token }).select('+verificationToken');

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token',
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      error: 'Error verifying email',
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('roommateProfile')
      .select('-password');

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching user data',
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, school, graduationYear, notificationPreferences, role, landlordProfile } = req.body;

    const updateData = {
      firstName,
      lastName,
      phone,
      school,
      graduationYear,
      notificationPreferences,
    };

    // Allow userType updates (student, landlord, both)
    if (role && ['student', 'landlord', 'both'].includes(role)) {
      updateData.userType = role; // Use userType field, not role
    }

    // Allow landlord profile updates
    if (landlordProfile) {
      updateData.landlordProfile = landlordProfile;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating profile',
    });
  }
};

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Private
 */
export const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+verificationToken');

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified',
      });
    }

    // Generate new token if needed
    if (!user.verificationToken) {
      user.verificationToken = crypto.randomBytes(32).toString('hex');
      await user.save();
    }

    // Resend verification email
    await emailService.sendVerificationEmail(user, user.verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Error resending verification email',
    });
  }
};

/**
 * @desc    Resend verification email (public - no auth required)
 * @route   POST /api/auth/resend-verification-public
 * @access  Public
 */
export const resendVerificationPublic = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('🔄 Public resend verification requested for:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    const user = await User.findOne({ email }).select('+verificationToken');

    if (!user) {
      console.log('ℹ️ Resend request for non-existent email:', email);
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.',
      });
    }

    if (user.isVerified) {
      return res.json({
        success: true,
        message: 'Email is already verified. You can log in.',
      });
    }

    // Generate new token if needed
    if (!user.verificationToken) {
      user.verificationToken = crypto.randomBytes(32).toString('hex');
      await user.save();
    }

    // Send verification email (non-blocking)
    emailService.sendVerificationEmail(user, user.verificationToken)
      .then(() => console.log('✅ Verification email resent to:', user.email))
      .catch((err) => console.error('⚠️ Failed to resend verification email:', err.message));

    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    });
  } catch (error) {
    console.error('Resend verification public error:', error);
    res.status(500).json({
      success: false,
      error: 'Error resending verification email',
    });
  }
};

/**
 * @desc    Update user profile photo
 * @route   PUT /api/auth/profile-photo
 * @access  Private
 */
export const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No photo file provided',
      });
    }

    // Get the Cloudinary URL from the uploaded file
    const photoUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePhoto: photoUrl },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Update profile photo error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating profile photo',
    });
  }
};

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    const user = await User.findOne({ email });

    // Don't reveal if user exists or not
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Save hashed token to database
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Send password reset email
    emailService.sendPasswordResetEmail(user, resetToken)
      .then(() => console.log('✅ Password reset email sent to:', user.email))
      .catch((err) => console.error('⚠️ Failed to send password reset email:', err.message));

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing request',
    });
  }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Error resetting password',
    });
  }
};

/**
 * @desc    Change password (authenticated)
 * @route   POST /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current password and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters',
      });
    }

    // Find user with password field
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Error changing password',
    });
  }
};

/**
 * @desc    Delete user account and all associated data
 * @route   DELETE /api/auth/account
 * @access  Private
 */
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your password to confirm account deletion',
      });
    }

    // Find user with password field
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Password is incorrect',
      });
    }

    const userId = user._id;

    // Dynamic imports to avoid circular dependencies
    const { default: LifestyleProfile } = await import('../models/LifestyleProfile.js');
    const { default: CommunityPost } = await import('../models/CommunityPost.js');
    const { default: CommunityComment } = await import('../models/CommunityComment.js');
    const { default: Application } = await import('../models/Application.js');
    const { default: Listing } = await import('../models/Listing.js');
    const { default: Message } = await import('../models/Message.js');
    const { default: Thread } = await import('../models/Thread.js');
    const { default: ThreadParticipant } = await import('../models/ThreadParticipant.js');
    const { default: Match } = await import('../models/Match.js');
    const { default: Report } = await import('../models/Report.js');
    const { default: Review } = await import('../models/Review.js');
    const { default: Notification } = await import('../models/Notification.js');
    const { default: Feedback } = await import('../models/Feedback.js');
    const { default: SavedSearch } = await import('../models/SavedSearch.js');
    const { default: RoommateGroup } = await import('../models/RoommateGroup.js');

    // Cascade delete all user data
    await Promise.all([
      LifestyleProfile.deleteMany({ user: userId }),
      CommunityPost.deleteMany({ author: userId }),
      CommunityComment.deleteMany({ author: userId }),
      Application.deleteMany({ userId: userId }),
      Listing.deleteMany({ landlord: userId }),
      Message.deleteMany({ sender: userId }),
      ThreadParticipant.deleteMany({ user: userId }),
      Match.deleteMany({ $or: [{ user1: userId }, { user2: userId }] }),
      Report.deleteMany({ $or: [{ reporter: userId }, { reportedUser: userId }] }),
      Review.deleteMany({ user: userId }),
      Notification.deleteMany({ user: userId }),
      Feedback.deleteMany({ user: userId }),
      SavedSearch.deleteMany({ user: userId }),
    ]);

    // Remove user from roommate groups (don't delete the group)
    await RoommateGroup.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    // Transfer admin of groups where user is admin, or delete if solo
    const adminGroups = await RoommateGroup.find({ admin: userId });
    for (const group of adminGroups) {
      if (group.members.length > 0) {
        // Transfer admin to first remaining member
        group.admin = group.members[0];
        await group.save();
      } else {
        await RoommateGroup.findByIdAndDelete(group._id);
      }
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Account and all associated data deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting account',
    });
  }
};
