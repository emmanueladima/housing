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
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        this.isConfigured = true;
        console.log('📧 Email service configured with SMTP');

        // Verify connection configuration
        this.transporter.verify((error, success) => {
          if (error) {
            console.error('❌ SMTP Connection Error:', error);
            console.error('SMTP Error Details:', JSON.stringify(error, null, 2));
          } else {
            console.log('✅ SMTP Connection Verified');
          }
        });
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
      from: `Collegio <${process.env.EMAIL_USER || 'noreply@collegio.com'}>`, // Updated sender name
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
      console.error('Full Error:', error);
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

    // Diagnostic logging
    console.log(`[EmailService] Attempting to send verification email to ${user.email}`);
    console.log(`[EmailService] Config Status: IsDev=${this.isDev}, IsConfigured=${this.isConfigured}`);
    if (!this.isConfigured && !this.isDev) {
      console.log('[EmailService] ⚠️ SMTP is NOT configured. This is why it is not sending.');
      console.log(`[EmailService] Env vars present: HOST=${!!process.env.EMAIL_HOST}, USER=${!!process.env.EMAIL_USER}, PASS=${!!process.env.EMAIL_PASS}`);
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Arial', sans-serif; }
          .header { padding: 0; text-align: center; border-radius: 10px 10px 0 0; overflow: hidden; background: #E4E2DD; height: 150px; }
          .header img { width: 100%; height: 150px; object-fit: cover; object-position: center; display: block; }
          .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .button { display: inline-block; background: linear-gradient(135deg, #db4a2b 0%, #c43d20 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; margin: 20px 0; box-shadow: 0 4px 14px rgba(219, 74, 43, 0.4); }
          .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${process.env.FRONTEND_URL}/assets/beige-cover.png" alt="Collegio">
          </div>
          <div class="content">
            <h2>Hi ${user.firstName}!</h2>
            <p>Thanks for signing up for collegio, the student housing platform that makes finding your perfect place easy.</p>
            <p>Please verify your email address by clicking the button below:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button" style="color: #ffffff !important; text-decoration: none;">Verify Email Address</a>
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

  /**
   * Send co-applicant invitation email
   */
  async sendCoApplicantInvite({ to, inviterName, listingTitle, inviteToken }) {
    const joinUrl = `${process.env.FRONTEND_URL}/applications/join/${inviteToken}`;

    console.log('\n🔗 ===== CO-APPLICANT INVITE LINK =====');
    console.log(`To: ${to}`);
    console.log(`Inviter: ${inviterName}`);
    console.log(`Listing: ${listingTitle}`);
    console.log(`Link: ${joinUrl}`);
    console.log('======================================\n');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; margin: 20px 0; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4); }
          .listing-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
          .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 You're Invited!</h1>
          </div>
          <div class="content">
            <p><strong>${inviterName}</strong> has invited you to join their rental application.</p>
            
            <div class="listing-card">
              <strong>📍 Listing:</strong> ${listingTitle}
            </div>
            
            <p>By joining this application, you'll be listed as a co-applicant. The landlord will be able to see your profile information.</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${joinUrl}" class="button" style="color: #ffffff !important; text-decoration: none;">Join Application</a>
            </p>
            
            <p style="color: #666; font-size: 14px;">This invitation expires in 7 days.</p>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 12px;">${joinUrl}</p>
          </div>
          <div class="footer">
            <p>If you don't know ${inviterName} or didn't expect this invite, you can safely ignore this email.</p>
            <p>&copy; 2024 collegio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to,
      subject: `${inviterName} invited you to join their rental application`,
      html,
      text: `${inviterName} has invited you to join their rental application for ${listingTitle}. Join here: ${joinUrl}`,
    });
  }

  /**
   * Send interview/tour scheduled notification
   */
  async sendInterviewScheduled({ applicant, listing, tourDate, tourTime, location, notes }) {
    const formattedDate = new Date(tourDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>📅 Tour Scheduled!</h2>
          <p>Hi ${applicant.firstName},</p>
          <p>Great news! Your property tour has been scheduled.</p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>🏠 Property:</strong> ${listing.title}</p>
            <p><strong>📍 Address:</strong> ${listing.address}, ${listing.city}</p>
            <p><strong>📆 Date:</strong> ${formattedDate}</p>
            ${tourTime ? `<p><strong>🕐 Time:</strong> ${tourTime}</p>` : ''}
            ${location ? `<p><strong>📌 Meeting Point:</strong> ${location}</p>` : ''}
            ${notes ? `<p><strong>📝 Notes:</strong> ${notes}</p>` : ''}
          </div>
          
          <p>
            <a href="${process.env.FRONTEND_URL}/applications" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              View Application
            </a>
          </p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: applicant.email,
      subject: `Tour Scheduled - ${listing.title}`,
      html,
      text: `Your property tour for ${listing.title} is scheduled for ${formattedDate}.`,
    });
  }

  /**
   * Send enhanced application status change notification
   */
  async sendStatusChange({ applicant, listing, oldStatus, newStatus, message }) {
    const statusEmoji = {
      submitted: '📩',
      under_review: '👀',
      interview_scheduled: '📅',
      approved: '✅',
      rejected: '❌',
      withdrawn: '↩️',
    };

    const statusMessages = {
      under_review: 'Your application is now being reviewed by the landlord.',
      interview_scheduled: 'A property tour or interview has been scheduled!',
      approved: 'Congratulations! Your application has been approved!',
      rejected: 'Unfortunately, your application was not accepted.',
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>${statusEmoji[newStatus] || '📋'} Application Update</h2>
          <p>Hi ${applicant.firstName},</p>
          
          <p>${statusMessages[newStatus] || `Your application status has changed to: ${newStatus}`}</p>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>🏠 Listing:</strong> ${listing.title}</p>
            <p><strong>📍 Location:</strong> ${listing.address}, ${listing.city}</p>
            <p><strong>Status:</strong> ${newStatus.replace('_', ' ').toUpperCase()}</p>
          </div>
          
          ${message ? `<p><strong>Message from landlord:</strong></p><p style="background: #fffbeb; padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b;">${message}</p>` : ''}
          
          <p>
            <a href="${process.env.FRONTEND_URL}/applications" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              View Application
            </a>
          </p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: applicant.email,
      subject: `Application ${newStatus.replace('_', ' ')} - ${listing.title}`,
      html,
      text: `Your application for ${listing.title} has been updated to: ${newStatus}`,
    });
  }
}

export default new EmailService();

