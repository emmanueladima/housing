import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: 2000,
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachment',
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  // Legacy fields removed: receiver, listingId, roommateProfileId
  // Read status is now tracked in ThreadParticipant
}, {
  timestamps: true,
});

// Index for fetching thread messages
messageSchema.index({ thread: 1, createdAt: 1 });
messageSchema.index({ createdAt: -1 });


const Message = mongoose.model('Message', messageSchema);

export default Message;
