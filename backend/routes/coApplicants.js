import express from 'express';
import { body, param } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
    inviteCoApplicant,
    acceptInvite,
    declineInvite,
    removeCoApplicant,
    getMyPendingInvites,
} from '../controllers/coApplicantController.js';

const router = express.Router();

// Get my pending invites
router.get('/invites', protect, getMyPendingInvites);

// Invite a co-applicant
router.post(
    '/:id/invite',
    protect,
    [
        param('id').isMongoId().withMessage('Invalid application ID'),
        body('email').isEmail().withMessage('Valid email is required'),
    ],
    validateRequest,
    inviteCoApplicant
);

// Accept invite (requires auth)
router.post(
    '/join/:token',
    protect,
    [param('token').notEmpty().withMessage('Token is required')],
    validateRequest,
    acceptInvite
);

// Decline invite (no auth required - just the token)
router.post(
    '/decline/:token',
    [param('token').notEmpty().withMessage('Token is required')],
    validateRequest,
    declineInvite
);

// Remove co-applicant
router.delete(
    '/:id/co-applicants/:coApplicantId',
    protect,
    [
        param('id').isMongoId().withMessage('Invalid application ID'),
        param('coApplicantId').notEmpty().withMessage('Co-applicant ID is required'),
    ],
    validateRequest,
    removeCoApplicant
);

export default router;
