import nodemailer from 'nodemailer';

/**
 * Email Service - handles all email sending
 * Supports DEV_MODE (console.log) and PROD_MODE (real SMTP)
 * Always logs verification links to console as backup
 */

class EmailService {
  constructor() {
    this.isDev = process.env.DEV_MODE === 'true';
    this.isConfigured = false;

    if (!this.isDev) {
      // Check if SMTP is properly configured
      const hasValidConfig =
        process.env.EMAIL_HOST &&
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS &&
        !process.env.EMAIL_USER.includes('your-email') &&
        !process.env.EMAIL_PASS.includes('your-app-password');

      if (hasValidConfig) {
        // Create reusable transporter for production
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT || 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        this.isConfigured = true;
        console.log('📧 Email service configured with SMTP');
      } else {
        console.log('⚠️ Email service: SMTP not configured, emails will be logged to console');
      }
    }
  }

  /**
   * Send an email
   */
  async sendEmail({ to, subject, html, text }) {
    const mailOptions = {
      from: `collegio Housing <${process.env.EMAIL_USER || 'noreply@collegio.com'}>`,
      to,
      subject,
      html,
      text,
    };

    // Always log email details in dev mode or if SMTP is not configured
    if (this.isDev || !this.isConfigured) {
      console.log('\n📧 ===== EMAIL (CONSOLE MODE) =====');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', text || 'See HTML version');
      console.log('================================\n');
      return { success: true, mode: 'console' };
    }

    // Production mode with configured SMTP
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send error:', error.message);
      // Log email content as fallback
      console.log('\n📧 ===== EMAIL FAILED - LOGGING CONTENT =====');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', text || 'See HTML version');
      console.log('==============================================\n');
      // Don't throw - return gracefully
      return { success: false, error: error.message };
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(user, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    // ALWAYS log verification URL for debugging/manual verification
    console.log('\n🔗 ===== VERIFICATION LINK =====');
    console.log(`User: ${user.email}`);
    console.log(`Link: ${verificationUrl}`);
    console.log('================================\n');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Welcome to collegio!</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.firstName}!</h2>
            <p>Thanks for signing up for collegio, the student housing platform that makes finding your perfect place easy.</p>
            <p>Please verify your email address by clicking the button below:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>If you didn't create an account with collegio, please ignore this email.</p>
            <p>&copy; 2024 collegio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to collegio!
      
      Hi ${user.firstName}!
      
      Thanks for signing up for collegio. Please verify your email address by visiting:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account with collegio, please ignore this email.
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Verify Your collegio Account',
      html,
      text,
    });
  }

  /**
   * Send new message notification
   */
  async sendMessageNotification(recipient, sender, messagePreview) {
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>💬 New Message from ${sender.firstName} ${sender.lastName}</h2>
          <p>${messagePreview}</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/messages" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Message
            </a>
          </p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: recipient.email,
      subject: `New message from ${sender.firstName}`,
      html,
      text: `New message from ${sender.firstName} ${sender.lastName}: ${messagePreview}`,
    });
  }

  /**
   * Send application status update
   */
  async sendApplicationUpdate(applicant, listing, status) {
    const statusText = status === 'approved' ? 'Approved ✅' : 'Reviewed';

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Application ${statusText}</h2>
          <p>Hi ${applicant.firstName},</p>
          <p>Your application for <strong>${listing.title}</strong> has been ${status}.</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/applications" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Application
            </a>
          </p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: applicant.email,
      subject: `Application ${statusText} - ${listing.title}`,
      html,
      text: `Your application for ${listing.title} has been ${status}.`,
    });
  }

  /**
   * Send new roommate match notification
   */
  async sendRoommateMatchNotification(user, matchCount) {
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>🎉 You have ${matchCount} new roommate ${matchCount === 1 ? 'match' : 'matches'}!</h2>
          <p>Hi ${user.firstName},</p>
          <p>We found some great potential roommates based on your preferences.</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/roommates" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Matches
            </a>
          </p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: `${matchCount} New Roommate ${matchCount === 1 ? 'Match' : 'Matches'}!`,
      html,
      text: `You have ${matchCount} new roommate matches! Visit collegio to see them.`,
    });
  }

  /**
   * Send weekly digest of new listings
   */
  async sendWeeklyDigest(user, newListings) {
    const listingItems = newListings.map(listing => `
      <li style="margin-bottom: 15px;">
        <strong>${listing.title}</strong><br>
        $${listing.rent}/month - ${listing.bedrooms} bed, ${listing.bathrooms} bath<br>
        ${listing.city}, ${listing.state}
      </li>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>📬 Your Weekly collegio Digest</h2>
          <p>Hi ${user.firstName},</p>
          <p>Here are ${newListings.length} new listings matching your saved searches:</p>
          <ul>${listingItems}</ul>
          <p>
            <a href="${process.env.FRONTEND_URL}/listings" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View All Listings
            </a>
          </p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: user.email,
      subject: `${newListings.length} New Listings Match Your Search`,
      html,
      text: `${newListings.length} new listings match your saved searches. Visit collegio to view them.`,
    });
  }
}

export default new EmailService();

