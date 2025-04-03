import nodemailer from 'nodemailer';
import config from '../config';
import logger from '../utils/logger';

/**
 * Email service for sending authentication emails
 */
class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly isEmailConfigured: boolean;

  constructor() {
    // Check if email is configured
    this.isEmailConfigured = !!(config.email.host && config.email.user && config.email.password);
    
    if (this.isEmailConfigured) {
      // Create reusable transporter object using SMTP transport
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465, // true for 465, false for other ports
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });
      logger.info('Email service initialized with SMTP transport');
    } else {
      logger.warn('Email credentials not provided. Email sending is disabled.');
    }
  }

  /**
   * Send an email
   * @param to Recipient email address
   * @param subject Email subject
   * @param html Email HTML content
   * @returns Promise resolving to success status
   */
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      // If transporter is not initialized, log warning and return false
      if (!this.transporter) {
        logger.warn(`Cannot send email to ${to} - email service not configured`);
        return false;
      }

      const mailOptions = {
        from: config.email.from,
        to,
        subject,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send verification email
   * @param to Recipient email address
   * @param token Verification token
   * @returns Promise resolving to success status
   */
  async sendVerificationEmail(to: string, token: string): Promise<boolean> {
    const verificationUrl = `${config.clientUrl}/verify-email?token=${token}`;
    const subject = 'Verify your email address';
    const html = `
      <h1>Email Verification</h1>
      <p>Thank you for registering with Tapqyr AI. Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
      <p>If you did not request this, please ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
    `;

    return this.sendEmail(to, subject, html);
  }

  /**
   * Send password reset email
   * @param to Recipient email address
   * @param token Password reset token
   * @returns Promise resolving to success status
   */
  async sendPasswordResetEmail(to: string, token: string): Promise<boolean> {
    const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
    const subject = 'Reset your password';
    const html = `
      <h1>Password Reset</h1>
      <p>You requested a password reset for your Tapqyr AI account. Please click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you did not request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;

    return this.sendEmail(to, subject, html);
  }

  /**
   * Send welcome email
   * @param to Recipient email address
   * @param name User's name
   * @returns Promise resolving to success status
   */
  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const subject = 'Welcome to Tapqyr AI';
    const html = `
      <h1>Welcome to Tapqyr AI!</h1>
      <p>Hello ${name || 'there'},</p>
      <p>Thank you for joining Tapqyr AI. We're excited to have you on board!</p>
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The Tapqyr AI Team</p>
    `;

    return this.sendEmail(to, subject, html);
  }
}

export default new EmailService(); 