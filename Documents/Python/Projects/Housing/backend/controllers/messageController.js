import Message from '../models/Message.js';
import Thread from '../models/Thread.js';
import ThreadParticipant from '../models/ThreadParticipant.js';
import notificationService from '../services/notificationService.js';

/**
 * @desc    Send a message to a thread
 * @route   POST /api/messages
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { threadId, content, attachments, metadata } = req.body;

    // Verify thread existence and participation
    const thread = await Thread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, error: 'Thread not found' });
    }

    const participation = await ThreadParticipant.findOne({
      thread: threadId,
      user: req.user._id,
    });

    if (!participation) {
      return res.status(403).json({ success: false, error: 'Not authorized to post in this thread' });
    }

    if (participation.isMuted || participation.isBlocked) {
      return res.status(403).json({ success: false, error: 'Cannot send message in this thread' });
    }

    // Check for global blocks in DM threads
    if (thread.type === 'dm') {
      const otherParticipant = await ThreadParticipant.findOne({
        thread: threadId,
        user: { $ne: req.user._id }
      }).populate('user', 'blockedUsers');

      if (otherParticipant && otherParticipant.user.blockedUsers.includes(req.user._id)) {
        return res.status(403).json({ success: false, error: 'You cannot send messages to this user' });
      }
    }

    // Create message
    const message = await Message.create({
      thread: threadId,
      sender: req.user._id,
      content,
      attachments,
      metadata,
    });

    // Update thread's last message
    thread.lastMessage = message._id;
    thread.lastMessageAt = message.createdAt;
    await thread.save();

    // Populate sender info
    await message.populate('sender', 'firstName lastName avatarUrl');
    if (attachments && attachments.length > 0) {
      await message.populate('attachments');
    }

    // Get Socket.io instance
    const io = req.app.get('io');

    // Emit to thread room
    if (io) {
      io.to(threadId).emit('new_message', message);
    }

    // Notify other participants
    const participants = await ThreadParticipant.find({ thread: threadId })
      .populate('user', 'firstName lastName pushToken');

    // Filter out sender
    const recipients = participants.filter(p => p.user._id.toString() !== req.user._id.toString());

    // Send notifications (push/email/socket)
    for (const recipient of recipients) {
      if (!recipient.isMuted && !recipient.isBlocked) {
        // Emit notification event
        if (io) {
          io.to(recipient.user._id.toString()).emit('message_notification', {
            message,
            threadId,
            senderName: req.user.firstName,
          });
        }

        // TODO: Call notification service for push/email
        // await notificationService.notifyNewMessage(...)
      }
    }

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Error sending message',
    });
  }
};

/**
 * @desc    Get messages for a thread
 * @route   GET /api/messages/:threadId
 * @access  Private
 */
export const getMessages = async (req, res) => {
  try {
    const { threadId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const cursor = req.query.cursor; // Timestamp for pagination

    // Verify participation
    const participation = await ThreadParticipant.findOne({
      thread: threadId,
      user: req.user._id,
    });

    if (!participation) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Build query
    const query = { thread: threadId };
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'firstName lastName avatarUrl')
      .populate('attachments');

    res.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order for UI
      nextCursor: messages.length === limit ? messages[0].createdAt : null,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching messages',
    });
  }
};

/**
 * @desc    Get unread message count (global)
 * @route   GET /api/messages/unread/count
 * @access  Private
 */
export const getUnreadCount = async (req, res) => {
  try {
    // Find all threads where lastMessageAt > lastReadAt
    // This requires a join or aggregation
    const unreadThreads = await ThreadParticipant.aggregate([
      { $match: { user: req.user._id } },
      {
        $lookup: {
          from: 'threads',
          localField: 'thread',
          foreignField: '_id',
          as: 'threadDetails'
        }
      },
      { $unwind: '$threadDetails' },
      {
        $match: {
          $expr: { $gt: ['$threadDetails.lastMessageAt', '$lastReadAt'] }
        }
      }
    ]);

    res.json({
      success: true,
      count: unreadThreads.length,
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching unread count',
    });
  }
};

