import User from '../models/User.js';
import Notification from '../models/Notification.js';
import emailService from '../services/emailService.js';
import AdminLog from '../models/AdminLog.js';

/**
 * @desc    Send system-wide announcement or email
 * @route   POST /api/admin/messaging/send
 * @access  Private/Admin
 */
export const sendAnnouncement = async (req, res) => {
    try {
        const { title, message, targetAudience, type } = req.body;
        // targetAudience: 'all', 'student', 'landlord'
        // type: 'notification', 'email', 'both'

        if (!title || !message) {
            return res.status(400).json({ success: false, error: 'Title and message are required' });
        }

        const query = {};
        if (targetAudience !== 'all') {
            query.userType = targetAudience;
        }

        const users = await User.find(query).select('email firstName lastName _id');
        const userCount = users.length;

        if (userCount === 0) {
            return res.status(404).json({ success: false, error: 'No users found for this audience' });
        }

        const results = {
            notifications: 0,
            emails: 0
        };

        // Send In-App Notifications
        if (type === 'notification' || type === 'both') {
            const notifications = users.map(user => ({
                userId: user._id,
                type: 'system_announcement',
                title: title,
                content: message, // Store full message as content
                // link: '/notifications', // No link needed, opens modal
                icon: 'system_announcement',
                isRead: false
            }));

            await Notification.insertMany(notifications);
            results.notifications = userCount;
        }

        // Send Emails
        if (type === 'email' || type === 'both') {
            // In a real production app, this should be a queue (Bull/Redis). 
            // For MVP, we'll map promises with a limit or just attempt all.
            // Using a simple loop for now to avoid complexity, but logging start.

            // Send individually to avoid exposing all emails in "To" field
            const emailPromises = users.map(user =>
                emailService.sendEmail({
                    to: user.email,
                    subject: `📢 ${title}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2>${title}</h2>
                            <p>Hi ${user.firstName},</p>
                            <p>${message.replace(/\n/g, '<br>')}</p>
                            <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
                            <p style="color: #888; font-size: 12px;">This is a system announcement from Collegio.</p>
                        </div>
                    `,
                    text: `${title}\n\nHi ${user.firstName},\n\n${message}\n\nThis is a system announcement from Collegio.`
                })
            );

            // Fire and forget email sending to not block response too long, or await if critical.
            // Let's await Promise.all but catch errors so one failure doesn't stop others? 
            // Better: just trigger it.
            Promise.allSettled(emailPromises).then(results => {
                const sent = results.filter(r => r.status === 'fulfilled').length;
                console.log(`[AdminMessaging] Sent ${sent}/${userCount} emails.`);
            });

            results.emails = userCount; // Optimistic count for response
        }

        // Log Admin Action
        await AdminLog.create({
            admin: req.user._id,
            action: 'SEND_ANNOUNCEMENT',
            targetType: 'System',
            details: { title, targetAudience, type, recipientCount: userCount },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: `Announcement processing for ${userCount} users.`,
            results
        });

    } catch (error) {
        console.error('Send Announcement Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Server Error' });
    }
};
