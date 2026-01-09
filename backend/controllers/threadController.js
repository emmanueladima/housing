import Thread from '../models/Thread.js';
import ThreadParticipant from '../models/ThreadParticipant.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

/**
 * @desc    Get all threads for current user
 * @route   GET /api/threads
 * @access  Private
 */
export const getThreads = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Find threads where user is a participant
        const participations = await ThreadParticipant.find({ user: req.user._id })
            .sort({ lastReadAt: -1 }); // Sort by interaction? No, usually by thread update

        const threadIds = participations.map(p => p.thread);

        // Fetch threads with pagination
        const threads = await Thread.find({ _id: { $in: threadIds } })
            .sort({ lastMessageAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('lastMessage')
            .populate('listingId', 'title images rent city')
            .populate('groupId', 'name');

        // Fetch participants for these threads to show avatars/names
        const threadsWithDetails = await Promise.all(threads.map(async (thread) => {
            const participants = await ThreadParticipant.find({ thread: thread._id })
                .populate('user', 'firstName lastName avatarUrl isOnline lastSeen');

            // Find current user's participation to get read status
            const myParticipation = participants.find(p => p.user._id.toString() === req.user._id.toString());

            // Filter out current user from "other participants" list for display
            const otherParticipants = participants
                .filter(p => p.user._id.toString() !== req.user._id.toString())
                .map(p => p.user);

            // Only mark as unread if:
            // 1. There's a last message
            // 2. It's newer than when user last read
            // 3. The last message was NOT sent by the current user (don't show unread for own messages)
            const lastMessageSenderId = thread.lastMessage?.sender?.toString() || thread.lastMessage?.user?.toString();
            const isUnread = myParticipation &&
                thread.lastMessageAt > myParticipation.lastReadAt &&
                lastMessageSenderId &&
                lastMessageSenderId !== req.user._id.toString();

            return {
                ...thread.toObject(),
                participants: otherParticipants,
                unreadCount: isUnread ? 1 : 0,
                isMuted: myParticipation?.isMuted || false,
            };
        }));

        res.json({
            success: true,
            count: threadsWithDetails.length,
            threads: threadsWithDetails,
            page,
            totalPages: Math.ceil(threadIds.length / limit),
        });
    } catch (error) {
        console.error('Get threads error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching threads',
        });
    }
};

/**
 * @desc    Get single thread details
 * @route   GET /api/threads/:id
 * @access  Private
 */
export const getThread = async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id)
            .populate('listingId')
            .populate('groupId');

        if (!thread) {
            return res.status(404).json({
                success: false,
                error: 'Thread not found',
            });
        }

        // Verify participation
        const participation = await ThreadParticipant.findOne({
            thread: thread._id,
            user: req.user._id,
        });

        if (!participation) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this thread',
            });
        }

        // Get all participants
        const participants = await ThreadParticipant.find({ thread: thread._id })
            .populate('user', 'firstName lastName avatarUrl isOnline lastSeen');

        res.json({
            success: true,
            thread,
            participants,
            myParticipation: participation,
        });
    } catch (error) {
        console.error('Get thread error:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching thread details',
        });
    }
};

/**
 * @desc    Create a new thread (or get existing for DM/Listing)
 * @route   POST /api/threads
 * @access  Private
 */
export const createThread = async (req, res) => {
    try {
        const { type, participantIds, listingId, groupId, initialMessage } = req.body;

        // Validate input
        if (!type || !['dm', 'listing', 'group'].includes(type)) {
            return res.status(400).json({ success: false, error: 'Invalid thread type' });
        }

        // For DM, check if thread already exists
        if (type === 'dm' && participantIds.length === 1) {
            const partnerId = participantIds[0];

            // Find threads where both users are participants
            const myThreads = await ThreadParticipant.find({ user: req.user._id }).distinct('thread');
            const partnerThreads = await ThreadParticipant.find({ user: partnerId }).distinct('thread');

            // Find intersection
            const commonThreadIds = myThreads.filter(id =>
                partnerThreads.some(pid => pid.toString() === id.toString())
            );

            // Check if any of these are DMs
            const existingDm = await Thread.findOne({
                _id: { $in: commonThreadIds },
                type: 'dm',
            });

            if (existingDm) {
                return res.json({ success: true, thread: existingDm, isNew: false });
            }
        }

        // For Listing, check if thread exists for this user + listing
        if (type === 'listing' && listingId) {
            const existingListingThread = await Thread.findOne({
                type: 'listing',
                listingId,
            });

            // Check if current user is a participant
            if (existingListingThread) {
                const isParticipant = await ThreadParticipant.findOne({
                    thread: existingListingThread._id,
                    user: req.user._id
                });

                if (isParticipant) {
                    return res.json({ success: true, thread: existingListingThread, isNew: false });
                }
            }
        }

        // Create new thread
        const thread = await Thread.create({
            type,
            listingId,
            groupId,
            lastMessageAt: new Date(),
        });

        // Add participants
        const allParticipantIds = [...new Set([...participantIds, req.user._id.toString()])];

        const participants = allParticipantIds.map(userId => ({
            thread: thread._id,
            user: userId,
            role: 'member', // Default role
            lastReadAt: new Date(),
        }));

        await ThreadParticipant.insertMany(participants);

        res.status(201).json({
            success: true,
            thread,
            isNew: true,
        });
    } catch (error) {
        console.error('Create thread error:', error);
        res.status(500).json({
            success: false,
            error: 'Error creating thread',
        });
    }
};

/**
 * @desc    Mark thread as read
 * @route   PUT /api/threads/:id/read
 * @access  Private
 */
export const markThreadRead = async (req, res) => {
    try {
        const participation = await ThreadParticipant.findOneAndUpdate(
            { thread: req.params.id, user: req.user._id },
            { lastReadAt: new Date() },
            { new: true }
        );

        if (!participation) {
            return res.status(404).json({ success: false, error: 'Thread not found or not authorized' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ success: false, error: 'Error marking thread as read' });
    }
};
