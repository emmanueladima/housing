import crypto from 'crypto';
import Application from '../models/Application.js';
import User from '../models/User.js';
import emailService from '../services/emailService.js';

/**
 * Invite a co-applicant to join an application
 */
export const inviteCoApplicant = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const application = await Application.findById(id)
            .populate('listingId', 'title');

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Must be the primary applicant
        if (application.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Only the primary applicant can invite co-applicants' });
        }

        // Check if application is still pending
        if (!['submitted', 'under_review'].includes(application.status)) {
            return res.status(400).json({ error: 'Cannot add co-applicants to this application' });
        }

        // Check if already invited
        const existingInvite = application.coApplicants.find(
            co => co.email?.toLowerCase() === email.toLowerCase()
        );
        if (existingInvite) {
            return res.status(400).json({ error: 'This person has already been invited' });
        }

        // Limit co-applicants
        if (application.coApplicants.length >= 3) {
            return res.status(400).json({ error: 'Maximum 3 co-applicants allowed' });
        }

        // Generate invite token
        const inviteToken = crypto.randomBytes(32).toString('hex');
        const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Check if invited user exists
        const invitedUser = await User.findOne({ email: email.toLowerCase() });

        application.coApplicants.push({
            user: invitedUser?._id || null,
            email: email.toLowerCase(),
            status: 'invited',
            inviteToken,
            inviteExpires,
            invitedAt: new Date(),
        });

        await application.save();

        // Send invite email
        const inviter = await User.findById(req.user._id);
        await emailService.sendCoApplicantInvite({
            to: email,
            inviterName: `${inviter.firstName} ${inviter.lastName}`,
            listingTitle: application.listingId.title,
            inviteToken,
        });

        res.json({
            message: 'Invitation sent successfully',
            coApplicant: application.coApplicants[application.coApplicants.length - 1],
        });
    } catch (error) {
        console.error('Error inviting co-applicant:', error);
        res.status(500).json({ error: 'Failed to send invitation' });
    }
};

/**
 * Accept a co-applicant invite
 */
export const acceptInvite = async (req, res) => {
    try {
        const { token } = req.params;

        const application = await Application.findOne({
            'coApplicants.inviteToken': token,
            'coApplicants.inviteExpires': { $gt: new Date() },
        }).populate('listingId', 'title address city');

        if (!application) {
            return res.status(404).json({ error: 'Invalid or expired invite link' });
        }

        const coApplicantIndex = application.coApplicants.findIndex(
            co => co.inviteToken === token
        );

        if (coApplicantIndex === -1) {
            return res.status(404).json({ error: 'Invite not found' });
        }

        const coApplicant = application.coApplicants[coApplicantIndex];

        if (coApplicant.status !== 'invited') {
            return res.status(400).json({ error: 'This invite has already been responded to' });
        }

        // Update co-applicant status
        coApplicant.user = req.user._id;
        coApplicant.status = 'accepted';
        coApplicant.respondedAt = new Date();
        coApplicant.inviteToken = undefined; // Clear token

        await application.save();

        res.json({
            message: 'You have joined the application',
            application: {
                _id: application._id,
                listing: application.listingId,
                status: application.status,
            },
        });
    } catch (error) {
        console.error('Error accepting invite:', error);
        res.status(500).json({ error: 'Failed to accept invitation' });
    }
};

/**
 * Decline a co-applicant invite
 */
export const declineInvite = async (req, res) => {
    try {
        const { token } = req.params;

        const application = await Application.findOne({
            'coApplicants.inviteToken': token,
        });

        if (!application) {
            return res.status(404).json({ error: 'Invite not found' });
        }

        const coApplicantIndex = application.coApplicants.findIndex(
            co => co.inviteToken === token
        );

        if (coApplicantIndex === -1) {
            return res.status(404).json({ error: 'Invite not found' });
        }

        const coApplicant = application.coApplicants[coApplicantIndex];
        coApplicant.status = 'declined';
        coApplicant.respondedAt = new Date();
        coApplicant.inviteToken = undefined;

        await application.save();

        res.json({ message: 'Invitation declined' });
    } catch (error) {
        console.error('Error declining invite:', error);
        res.status(500).json({ error: 'Failed to decline invitation' });
    }
};

/**
 * Remove a co-applicant (primary applicant only)
 */
export const removeCoApplicant = async (req, res) => {
    try {
        const { id, coApplicantId } = req.params;

        const application = await Application.findById(id);

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Must be the primary applicant
        if (application.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Only the primary applicant can remove co-applicants' });
        }

        const coApplicantIndex = application.coApplicants.findIndex(
            co => co._id.toString() === coApplicantId || co.user?.toString() === coApplicantId
        );

        if (coApplicantIndex === -1) {
            return res.status(404).json({ error: 'Co-applicant not found' });
        }

        application.coApplicants.splice(coApplicantIndex, 1);
        await application.save();

        res.json({ message: 'Co-applicant removed' });
    } catch (error) {
        console.error('Error removing co-applicant:', error);
        res.status(500).json({ error: 'Failed to remove co-applicant' });
    }
};

/**
 * Get pending invites for current user
 */
export const getMyPendingInvites = async (req, res) => {
    try {
        const userEmail = req.user.email.toLowerCase();

        const applications = await Application.find({
            'coApplicants.email': userEmail,
            'coApplicants.status': 'invited',
            'coApplicants.inviteExpires': { $gt: new Date() },
        })
            .populate('listingId', 'title address city images rent')
            .populate('userId', 'firstName lastName');

        const invites = applications.map(app => {
            const invite = app.coApplicants.find(
                co => co.email === userEmail && co.status === 'invited'
            );
            return {
                applicationId: app._id,
                listing: app.listingId,
                invitedBy: app.userId,
                invitedAt: invite.invitedAt,
                inviteToken: invite.inviteToken,
                expiresAt: invite.inviteExpires,
            };
        });

        res.json({ invites });
    } catch (error) {
        console.error('Error fetching pending invites:', error);
        res.status(500).json({ error: 'Failed to fetch invites' });
    }
};
