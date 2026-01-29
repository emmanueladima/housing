import RoommateGroup from '../models/RoommateGroup.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Update a roommate group
// @route   PUT /api/roommate-groups/:id
// @access  Private (Admin only)
export const updateGroup = async (req, res) => {
    try {
        const group = await RoommateGroup.findById(req.params.id);

        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Only admin can update
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only group admin can update details' });
        }

        const { name, description, budget, location, vibe, lookingFor } = req.body;

        group.name = name || group.name;
        group.description = description || group.description;
        if (budget) group.budget = budget;
        group.location = location || group.location;
        group.vibe = vibe || group.vibe;
        group.lookingFor = lookingFor || group.lookingFor;

        await group.save();
        res.json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new roommate group
// @route   POST /api/roommate-groups
// @access  Private
export const createGroup = async (req, res) => {
    try {
        const { name, description, budget, location, vibe, lookingFor } = req.body;

        const group = await RoommateGroup.create({
            name,
            description,
            budget,
            location,
            vibe,
            lookingFor,
            admin: req.user._id,
            members: [req.user._id]
        });

        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's group (Toolkit)
// @route   GET /api/roommate-groups/my-group
// @access  Private
export const getMyGroup = async (req, res) => {
    try {
        const group = await RoommateGroup.findOne({ members: req.user._id })
            .populate('members', 'firstName lastName avatar email school')
            .populate('chores.assignedTo', 'firstName lastName avatar')
            .populate('expenses.paidBy', 'firstName lastName avatar')
            .populate('expenses.splitAmong', 'firstName lastName avatar');

        if (!group) {
            return res.status(404).json({ message: 'No group found' });
        }

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all groups (Discovery)
// @route   GET /api/roommate-groups
// @access  Private
export const getAllGroups = async (req, res) => {
    try {
        const groups = await RoommateGroup.find()
            .populate('members', 'firstName lastName avatar school')
            .sort({ createdAt: -1 });
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a chore
// @route   POST /api/roommate-groups/:id/chores
// @access  Private
export const addChore = async (req, res) => {
    try {
        const group = await RoommateGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        group.chores.push(req.body);
        await group.save();

        // Re-populate to return full data
        await group.populate('chores.assignedTo', 'firstName lastName avatar');

        res.json(group.chores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add an expense
// @route   POST /api/roommate-groups/:id/expenses
// @access  Private
export const addExpense = async (req, res) => {
    try {
        const group = await RoommateGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        group.expenses.push(req.body);
        await group.save();

        await group.populate('expenses.paidBy', 'firstName lastName avatar');
        await group.populate('expenses.splitAmong', 'firstName lastName avatar');

        res.json(group.expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a rule
// @route   POST /api/roommate-groups/:id/rules
// @access  Private
export const addRule = async (req, res) => {
    try {
        const group = await RoommateGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        group.houseRules.push(req.body);
        await group.save();

        res.json(group.houseRules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request to join a group
// @route   POST /api/roommate-groups/:id/request-join
// @access  Private
export const requestJoin = async (req, res) => {
    try {
        const group = await RoommateGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Check if user is already a member
        if (group.members.includes(req.user._id)) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }

        // Check if there's already a pending request
        const existingRequest = group.joinRequests.find(
            r => r.user.toString() === req.user._id.toString() && r.status === 'pending'
        );
        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending request to join this group' });
        }

        group.joinRequests.push({
            user: req.user._id,
            message: req.body.message || ''
        });
        await group.save();

        res.json({ message: 'Join request sent successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending join requests for a group (admin only)
// @route   GET /api/roommate-groups/:id/requests
// @access  Private
export const getJoinRequests = async (req, res) => {
    try {
        const group = await RoommateGroup.findById(req.params.id)
            .populate('joinRequests.user', 'firstName lastName avatar email major');

        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Only admin can view requests
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only group admin can view join requests' });
        }

        const pendingRequests = group.joinRequests.filter(r => r.status === 'pending');
        res.json(pendingRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Accept or reject a join request
// @route   PUT /api/roommate-groups/:id/requests/:requestId
// @access  Private (admin only)
export const handleJoinRequest = async (req, res) => {
    try {
        const { action } = req.body; // 'accept' or 'reject'
        const group = await RoommateGroup.findById(req.params.id);

        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Only admin can handle requests
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only group admin can handle join requests' });
        }

        const request = group.joinRequests.id(req.params.requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        if (action === 'accept') {
            request.status = 'accepted';
            group.members.push(request.user);
        } else if (action === 'reject') {
            request.status = 'rejected';
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await group.save();
        await group.populate('members', 'firstName lastName avatar email');

        res.json({ message: `Request ${action}ed successfully`, group });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single group by ID
// @route   GET /api/roommate-groups/:id
// @access  Private
export const getGroupById = async (req, res) => {
    try {
        const group = await RoommateGroup.findById(req.params.id)
            .populate('members', 'firstName lastName avatar email school major')
            .populate('admin', 'firstName lastName avatar email')
            .populate('joinRequests.user', 'firstName lastName avatar email major');

        if (!group) return res.status(404).json({ message: 'Group not found' });

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete my group
// @route   DELETE /api/roommate-groups/my-group
// @access  Private (owner only)
export const deleteMyGroup = async (req, res) => {
    try {
        const group = await RoommateGroup.findOne({
            $or: [
                { admin: req.user._id },
                { createdBy: req.user._id }
            ]
        });

        if (!group) {
            return res.status(404).json({ message: 'You do not have a group to delete' });
        }

        await RoommateGroup.deleteOne({ _id: group._id });

        res.json({ success: true, message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==============================
// SHARED EVENTS (Timeline)
// ==============================

// @desc    Add a shared event
// @route   POST /api/roommate-groups/:id/events
// @access  Private
export const addEvent = async (req, res) => {
    try {
        const group = await RoommateGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Verify user is a member
        if (!group.members.includes(req.user._id)) {
            return res.status(403).json({ message: 'You must be a group member to add events' });
        }

        const eventData = {
            ...req.body,
            createdBy: req.user._id
        };

        group.sharedEvents.push(eventData);
        await group.save();

        await group.populate('sharedEvents.createdBy', 'firstName lastName avatar');

        res.status(201).json(group.sharedEvents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a shared event
// @route   DELETE /api/roommate-groups/:id/events/:eventId
// @access  Private
export const deleteEvent = async (req, res) => {
    try {
        const group = await RoommateGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Verify user is a member
        if (!group.members.includes(req.user._id)) {
            return res.status(403).json({ message: 'You must be a group member to delete events' });
        }

        const event = group.sharedEvents.id(req.params.eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        group.sharedEvents.pull(req.params.eventId);
        await group.save();

        res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==============================
// CHORES - Update & Delete
// ==============================

// @desc    Update a chore (toggle completed, etc.)
// @route   PUT /api/roommate-groups/:id/chores/:choreId
// @access  Private
export const updateChore = async (req, res) => {
    try {
        const group = await RoommateGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Verify user is a member
        if (!group.members.includes(req.user._id)) {
            return res.status(403).json({ message: 'You must be a group member to update chores' });
        }

        const chore = group.chores.id(req.params.choreId);
        if (!chore) return res.status(404).json({ message: 'Chore not found' });

        // Update allowed fields
        if (req.body.completed !== undefined) chore.completed = req.body.completed;
        if (req.body.title) chore.title = req.body.title;
        if (req.body.assignedTo) chore.assignedTo = req.body.assignedTo;
        if (req.body.dueDate) chore.dueDate = req.body.dueDate;
        if (req.body.frequency) chore.frequency = req.body.frequency;

        await group.save();
        await group.populate('chores.assignedTo', 'firstName lastName profilePhoto');

        res.json(group.chores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a chore
// @route   DELETE /api/roommate-groups/:id/chores/:choreId
// @access  Private
export const deleteChore = async (req, res) => {
    try {
        const group = await RoommateGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Verify user is a member
        if (!group.members.includes(req.user._id)) {
            return res.status(403).json({ message: 'You must be a group member to delete chores' });
        }

        const chore = group.chores.id(req.params.choreId);
        if (!chore) return res.status(404).json({ message: 'Chore not found' });

        group.chores.pull(req.params.choreId);
        await group.save();

        res.json({ success: true, message: 'Chore deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==============================
// EXPENSES - Update & Delete
// ==============================

// @desc    Update an expense (settle, etc.)
// @route   PUT /api/roommate-groups/:id/expenses/:expenseId
// @access  Private
export const updateExpense = async (req, res) => {
    try {
        const group = await RoommateGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Verify user is a member
        if (!group.members.includes(req.user._id)) {
            return res.status(403).json({ message: 'You must be a group member to update expenses' });
        }

        const expense = group.expenses.id(req.params.expenseId);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });

        // Update allowed fields
        if (req.body.status) expense.status = req.body.status;
        if (req.body.title) expense.title = req.body.title;
        if (req.body.amount) expense.amount = req.body.amount;
        if (req.body.category) expense.category = req.body.category;

        await group.save();
        await group.populate('expenses.paidBy', 'firstName lastName avatar');
        await group.populate('expenses.splitAmong', 'firstName lastName avatar');

        res.json(group.expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an expense
// @route   DELETE /api/roommate-groups/:id/expenses/:expenseId
// @access  Private
export const deleteExpense = async (req, res) => {
    try {
        const group = await RoommateGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Verify user is a member
        if (!group.members.includes(req.user._id)) {
            return res.status(403).json({ message: 'You must be a group member to delete expenses' });
        }

        const expense = group.expenses.id(req.params.expenseId);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });

        group.expenses.pull(req.params.expenseId);
        await group.save();

        res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==============================
// INVITE CODE SYSTEM
// ==============================

// Helper: Generate random alphanumeric code
const generateCode = (length = 6) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars (O,0,1,I)
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// @desc    Generate invite code for group
// @route   POST /api/roommate-groups/:id/invite-code
// @access  Private (admin only)
export const generateInviteCode = async (req, res) => {
    try {
        const group = await RoommateGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Only admin can generate codes
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only group admin can generate invite codes' });
        }

        // Check if group is at capacity
        const maxMembers = group.maxMembers || 6;
        if (group.members.length >= maxMembers) {
            return res.status(400).json({ message: 'Group is at maximum capacity' });
        }

        // Generate unique code (7 days expiry by default)
        const expiryDays = req.body.expiryDays || 7;
        const code = generateCode(6);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        group.inviteCode = {
            code,
            expiresAt,
            createdBy: req.user._id
        };
        await group.save();

        res.json({
            success: true,
            inviteCode: {
                code,
                expiresAt,
                expiresIn: `${expiryDays} days`
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join group by invite code
// @route   POST /api/roommate-groups/join/:code
// @access  Private
export const joinByInviteCode = async (req, res) => {
    try {
        const { code } = req.params;

        // Find group with this code
        const group = await RoommateGroup.findOne({ 'inviteCode.code': code.toUpperCase() })
            .populate('members', 'firstName lastName avatar')
            .populate('admin', 'firstName lastName');

        if (!group) {
            return res.status(404).json({ message: 'Invalid invite code' });
        }

        // Check if code expired
        if (group.inviteCode.expiresAt < new Date()) {
            return res.status(400).json({ message: 'Invite code has expired' });
        }

        // Check if already a member
        if (group.members.some(m => m._id.toString() === req.user._id.toString())) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }

        // Check capacity
        const maxMembers = group.maxMembers || 6;
        if (group.members.length >= maxMembers) {
            return res.status(400).json({ message: 'Group is at maximum capacity' });
        }

        // Add user to group
        group.members.push(req.user._id);
        await group.save();

        // Re-populate
        await group.populate('members', 'firstName lastName avatar email school');

        res.json({
            success: true,
            message: `You've joined ${group.name}!`,
            group
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Revoke current invite code
// @route   DELETE /api/roommate-groups/:id/invite-code
// @access  Private (admin only)
export const revokeInviteCode = async (req, res) => {
    try {
        const group = await RoommateGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Only admin can revoke
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only group admin can revoke invite codes' });
        }

        group.inviteCode = undefined;
        await group.save();

        res.json({ success: true, message: 'Invite code revoked' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Invite user by username
// @route   POST /api/roommate-groups/:id/invite-username
// @access  Private (admin only)
export const inviteByUsername = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const group = await RoommateGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Only admin can invite
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only group admin can invite members' });
        }

        // Find user by username
        const userToInvite = await User.findOne({ username: username.toLowerCase().replace('@', '') });
        if (!userToInvite) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already a member
        if (group.members.some(m => m.toString() === userToInvite._id.toString())) {
            return res.status(400).json({ message: 'User is already a member of this group' });
        }

        // Check if already invited (pending)
        if (userToInvite.pendingGroupInvites && userToInvite.pendingGroupInvites.includes(group._id)) {
            return res.status(400).json({ message: 'User already has a pending invitation to this group' });
        }

        // Check capacity
        const maxMembers = group.maxMembers || 6;
        if (group.members.length >= maxMembers) {
            return res.status(400).json({ message: 'Group is at maximum capacity' });
        }

        // Add to user's pending invites
        userToInvite.pendingGroupInvites.push(group._id);
        await userToInvite.save();

        // Create Notification
        await Notification.create({
            userId: userToInvite._id,
            type: 'group_invite',
            title: 'Group Invitation',
            content: `You've been invited to join "${group.name}"`,
            relatedId: group._id, // Group ID
            link: '/notifications' // Or wherever they handle it
        });

        res.json({
            success: true,
            message: `Invitation sent to @${userToInvite.username}!`,
            group // Return group to update UI (though group structure hasn't changed much)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Accept group invitation
// @route   POST /api/roommate-groups/:id/accept-invite
// @access  Private
export const acceptGroupInvite = async (req, res) => {
    try {
        const group = await RoommateGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Check if user has pending invite
        const user = await User.findById(req.user._id);
        if (!user.pendingGroupInvites.includes(group._id)) {
            return res.status(400).json({ message: 'No pending invitation for this group' });
        }

        // Check capacity
        if (group.members.length >= (group.maxMembers || 6)) {
            return res.status(400).json({ message: 'Group is now full' });
        }

        // Add to members
        group.members.push(user._id);
        await group.save();

        // Remove from pending invites
        user.pendingGroupInvites = user.pendingGroupInvites.filter(id => id.toString() !== group._id.toString());
        await user.save();

        // Notify Group Admin
        await Notification.create({
            userId: group.admin,
            type: 'system_announcement', // or 'group_update'
            title: 'New Group Member',
            content: `${user.firstName} accepted your invitation!`,
            relatedId: group._id
        });

        res.json({ success: true, message: `You joined ${group.name}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Decline group invitation
// @route   POST /api/roommate-groups/:id/decline-invite
// @access  Private
export const declineGroupInvite = async (req, res) => {
    try {
        // Remove from pending invites
        const user = await User.findById(req.user._id);
        user.pendingGroupInvites = user.pendingGroupInvites.filter(id => id.toString() !== req.params.id.toString());
        await user.save();

        res.json({ success: true, message: 'Invitation declined' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove member from group
// @route   DELETE /api/roommate-groups/:id/members/:memberId
// @access  Private (admin only)
export const removeMember = async (req, res) => {
    try {
        const group = await RoommateGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Only admin can remove members
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only group admin can remove members' });
        }

        // Can't remove admin
        if (req.params.memberId === group.admin.toString()) {
            return res.status(400).json({ message: 'Cannot remove group admin' });
        }

        group.members = group.members.filter(m => m.toString() !== req.params.memberId);
        await group.save();

        await group.populate('members', 'firstName lastName avatar email school username');

        res.json({
            success: true,
            message: 'Member removed from group',
            group
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
