import Notification from '../models/Notification.js';
import User from '../models/User.js';
import emailService from './emailService.js';

/**
 * Notification Service
 * Handles creation and delivery of notifications
 */

class NotificationService {
  /**
   * Create a notification
   */
  async createNotification({ userId, type, content, link, relatedId, icon }) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        content,
        link,
        relatedId,
        icon,
      });

      // Increment unread count
      await User.findByIdAndUpdate(userId, {
        $inc: { unreadNotifications: 1 },
      });

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Emit socket notification
   */
  emitSocketNotification(io, userId, notification) {
    if (io) {
      io.to(userId.toString()).emit('new_notification', notification);
    }
  }

  /**
   * Send new message notification
   */
  async notifyNewMessage(io, senderId, receiverId, messagePreview, sender) {
    const notification = await this.createNotification({
      userId: receiverId,
      type: 'message',
      content: `New message from ${sender.firstName} ${sender.lastName}`,
      link: `/messages/${senderId}`,
      relatedId: senderId,
      icon: 'message',
    });

    this.emitSocketNotification(io, receiverId, notification);

    // Send email notification (optional - user preferences can be checked here)
    const receiver = await User.findById(receiverId);
    if (receiver) {
      await emailService.sendMessageNotification(receiver, sender, messagePreview);
    }

    return notification;
  }

  /**
   * Send application status notification
   */
  async notifyApplicationStatus(io, applicantId, listingId, status, listingTitle) {
    const statusText = status === 'approved' ? 'approved' : status === 'rejected' ? 'reviewed' : 'updated';
    
    const notification = await this.createNotification({
      userId: applicantId,
      type: 'application',
      content: `Your application for "${listingTitle}" has been ${statusText}`,
      link: `/applications`,
      relatedId: listingId,
      icon: 'application',
    });

    this.emitSocketNotification(io, applicantId, notification);

    return notification;
  }

  /**
   * Send new application notification to landlord
   */
  async notifyNewApplication(io, landlordId, listingTitle, applicantName) {
    const notification = await this.createNotification({
      userId: landlordId,
      type: 'application',
      content: `${applicantName} applied for "${listingTitle}"`,
      link: `/landlord/applications`,
      icon: 'application',
    });

    this.emitSocketNotification(io, landlordId, notification);

    return notification;
  }

  /**
   * Send new roommate match notification
   */
  async notifyRoommateMatch(io, userId, matchCount) {
    const notification = await this.createNotification({
      userId,
      type: 'match',
      content: `You have ${matchCount} new roommate ${matchCount === 1 ? 'match' : 'matches'}!`,
      link: '/roommates',
      icon: 'match',
    });

    this.emitSocketNotification(io, userId, notification);

    return notification;
  }

  /**
   * Send new listing notification to saved search users
   */
  async notifyNewListing(io, userIds, listingTitle) {
    const notifications = await Promise.all(
      userIds.map(userId =>
        this.createNotification({
          userId,
          type: 'new_listing',
          content: `New listing matches your saved search: "${listingTitle}"`,
          link: '/listings',
          icon: 'listing',
        })
      )
    );

    // Emit to all users
    userIds.forEach((userId, index) => {
      this.emitSocketNotification(io, userId, notifications[index]);
    });

    return notifications;
  }

  /**
   * Send tour scheduled notification
   */
  async notifyTourScheduled(io, userId, listingTitle, tourDate) {
    const notification = await this.createNotification({
      userId,
      type: 'tour',
      content: `Tour scheduled for "${listingTitle}" on ${tourDate}`,
      link: '/applications',
      icon: 'tour',
    });

    this.emitSocketNotification(io, userId, notification);

    return notification;
  }

  /**
   * Send new review notification
   */
  async notifyNewReview(io, userId, reviewerName, rating) {
    const notification = await this.createNotification({
      userId,
      type: 'review',
      content: `${reviewerName} left you a ${rating}-star review`,
      link: '/profile',
      icon: 'review',
    });

    this.emitSocketNotification(io, userId, notification);

    return notification;
  }
}

export default new NotificationService();

