/**
 * Ownership Verification Middleware
 * 
 * A reusable middleware factory for verifying resource ownership
 * before allowing modifications (update/delete operations).
 */

/**
 * Verify resource ownership before allowing modification
 * @param {Model} Model - Mongoose model to check
 * @param {string} paramName - URL parameter name (e.g., 'id')
 * @param {string} ownerField - Field containing owner ID (e.g., 'landlord', 'user', 'author')
 * @returns {Function} Express middleware function
 * 
 * @example
 * // In routes file:
 * import { verifyOwnership } from '../middleware/ownership.js';
 * import Listing from '../models/Listing.js';
 * 
 * router.delete('/:id', protect, verifyOwnership(Listing, 'id', 'landlord'), deleteListing);
 */
export const verifyOwnership = (Model, paramName = 'id', ownerField = 'user') => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[paramName];

            if (!resourceId) {
                return res.status(400).json({
                    success: false,
                    error: 'Resource ID is required'
                });
            }

            const resource = await Model.findById(resourceId);

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    error: 'Resource not found'
                });
            }

            // Get the owner ID from the resource
            const ownerId = resource[ownerField]?._id || resource[ownerField];

            if (!ownerId) {
                return res.status(500).json({
                    success: false,
                    error: 'Owner field not found on resource'
                });
            }

            // Check if the current user is the owner
            if (ownerId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to modify this resource'
                });
            }

            // Attach the resource to request for reuse in controller
            req.resource = resource;
            next();
        } catch (error) {
            console.error('Ownership verification error:', error);
            return res.status(500).json({
                success: false,
                error: 'Error verifying resource ownership'
            });
        }
    };
};

/**
 * Verify group membership before allowing access
 * @param {Model} Model - Mongoose model (e.g., RoommateGroup)
 * @param {string} paramName - URL parameter name (e.g., 'id')
 * @returns {Function} Express middleware function
 */
export const verifyGroupMembership = (Model, paramName = 'id') => {
    return async (req, res, next) => {
        try {
            const groupId = req.params[paramName];
            const group = await Model.findById(groupId);

            if (!group) {
                return res.status(404).json({
                    success: false,
                    error: 'Group not found'
                });
            }

            // Check if user is a member
            const isMember = group.members.some(
                memberId => memberId.toString() === req.user._id.toString()
            );

            if (!isMember) {
                return res.status(403).json({
                    success: false,
                    error: 'You must be a group member to perform this action'
                });
            }

            req.group = group;
            next();
        } catch (error) {
            console.error('Group membership verification error:', error);
            return res.status(500).json({
                success: false,
                error: 'Error verifying group membership'
            });
        }
    };
};

/**
 * Check if user is admin of a resource
 * @param {Model} Model - Mongoose model
 * @param {string} paramName - URL parameter name
 * @param {string} adminField - Field containing admin ID
 */
export const verifyAdmin = (Model, paramName = 'id', adminField = 'admin') => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[paramName];
            const resource = await Model.findById(resourceId);

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    error: 'Resource not found'
                });
            }

            const adminId = resource[adminField]?._id || resource[adminField];

            if (adminId?.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'Admin access required'
                });
            }

            req.resource = resource;
            next();
        } catch (error) {
            console.error('Admin verification error:', error);
            return res.status(500).json({
                success: false,
                error: 'Error verifying admin status'
            });
        }
    };
};
