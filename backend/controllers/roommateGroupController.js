import RoommateGroup from '../models/RoommateGroup.js';
import User from '../models/User.js';

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
            .populate('members', 'firstName lastName avatar email')
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
            .populate('members', 'firstName lastName avatar')
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
            .populate('members', 'firstName lastName avatar email major')
            .populate('admin', 'firstName lastName avatar email')
            .populate('joinRequests.user', 'firstName lastName avatar email major');

        if (!group) return res.status(404).json({ message: 'Group not found' });

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
