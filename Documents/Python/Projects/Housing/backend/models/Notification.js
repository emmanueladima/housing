import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['message', 'match', 'application', 'new_listing', 'tour', 'review'],
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Notification content is required'],
  },
  link: {
    type: String,
    // URL to navigate to when notification is clicked
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    // ID of related message, listing, application, etc.
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    // Icon name for frontend display
  },
}, {
  timestamps: true,
});

// Indexes
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

