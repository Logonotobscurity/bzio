/**
 * Email Service
 * Handles sending emails for authentication flows using Resend SMTP
 * Documentation: https://resend.com/docs/send-with-smtp
 * 
 * SMTP Configuration:
 * - Host: smtp.resend.com
 * - Port: 465 (SSL/TLS - Implicit encryption - RECOMMENDED)
 * - Alternative: 587 (STARTTLS - Explicit encryption)
 * - Encryption: TLS/SSL for all secure connections
 */

import nodemailer from 'nodemailer';

const emailFrom = process.env.EMAIL_FROM || 'noreply@bzion.shop';
const appName = process.env.NEXT_PUBLIC_APP_NAME || 'BZION B2B Platform';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bzion.shop';

/**
 * Resend SMTP Configuration
 * Port 465: SSL/TLS Implicit (recommended for production)
 * 
 * Benefits:
 * - Implicit TLS encryption from connection start
 * - Faster connection (no negotiation overhead)
 * - Industry standard for secure SMTP
 * - Works with existing SMTP tooling
 * - Same reliability as REST API
 * - Full Resend features (analytics, webhooks, etc.)
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE !== 'false', // TLS encryption (default: true)
  auth: {
    user: process.env.SMTP_USERNAME || 'resend',
    pass: process.env.RESEND_API_KEY || '',
  },
  // Timeouts and connection settings
  connectionTimeout: process.env.SMTP_TIMEOUT ? parseInt(process.env.SMTP_TIMEOUT) : 5000,
  socketTimeout: 10000,
  // Production security
  ...(process.env.NODE_ENV === 'production' && {
    tls: {
      rejectUnauthorized: true, // Verify SSL certificate
      minVersion: 'TLSv1.2',   // Minimum TLS version
    },
  }),
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Test SMTP connection
 * Useful for health checks and debugging
 */
export async function testSMTPConnection(): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}> {
  try {
    const verified = await transporter.verify();
    if (verified) {
      console.log('✅ SMTP connection verified successfully');
      return {
        success: true,
        message: 'SMTP connection verified',
        details: {
          host: process.env.SMTP_HOST || 'smtp.resend.com',
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: process.env.SMTP_SECURE !== 'false',
          timestamp: new Date().toISOString(),
        },
      };
    }
    return {
      success: false,
      message: 'SMTP verification failed',
    };
  } catch (error) {
    console.error('❌ SMTP connection test failed:', error);
    return {
      success: false,
      message: `SMTP connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: {
        host: process.env.SMTP_HOST || 'smtp.resend.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

/**
 * Send email using Resend SMTP
 * 
 * Resend SMTP provides:
 * - 100 emails/day free tier
 * - Production-ready infrastructure
 * - Built-in authentication & security
 * - Email analytics
 * - Webhooks for delivery tracking
 */
async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Skip sending in development if API key not configured
    if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'development') {
      console.log('📧 Email (development mode - Resend SMTP):', {
        to: options.to,
        subject: options.subject,
        from: emailFrom,
      });
      return true;
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured in environment variables');
      return false;
    }

    const result = await transporter.sendMail({
      from: emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log('✅ Email sent:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<boolean> {
  const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          .warning { color: #d97706; font-size: 14px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${appName}</h1>
            <p>Password Reset Request</p>
          </div>

          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset the password for your account associated with <strong>${email}</strong>.</p>
            
            <p>To reset your password, click the button below:</p>
            
            <a href="${resetLink}" class="button">Reset Password</a>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 12px;">
              ${resetLink}
            </p>

            <div class="warning">
              ⚠️ This link will expire in 1 hour for security reasons.
            </div>

            <p>If you didn't request a password reset, please ignore this email or <a href="mailto:support@bzion.shop">contact support</a> immediately.</p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            <p>
              <a href="${appUrl}">Visit Website</a> | 
              <a href="mailto:support@bzion.shop">Support</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Password Reset Request

    Hello,

    We received a request to reset the password for your account associated with ${email}.

    To reset your password, visit this link:
    ${resetLink}

    This link will expire in 1 hour.

    If you didn't request a password reset, please ignore this email.

    © ${new Date().getFullYear()} ${appName}
  `;

  return sendEmail({
    to: email,
    subject: `Password Reset Request - ${appName}`,
    html,
    text,
  });
}

/**
 * Send email verification email
 */
export async function sendEmailVerificationEmail(
  email: string,
  verificationToken: string
): Promise<boolean> {
  const verifyLink = `${appUrl}/verify-email?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          .warning { color: #d97706; font-size: 14px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${appName}</h1>
            <p>Welcome! Verify Your Email</p>
          </div>

          <div class="content">
            <p>Hello,</p>
            <p>Thank you for signing up for ${appName}! To complete your account setup, please verify your email address.</p>
            
            <p>Click the button below to verify your email:</p>
            
            <a href="${verifyLink}" class="button">Verify Email Address</a>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 12px;">
              ${verifyLink}
            </p>

            <div class="warning">
              ⏰ This link will expire in 24 hours.
            </div>

            <p>If you didn't create this account, please ignore this email or <a href="mailto:support@bzion.shop">contact support</a>.</p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            <p>
              <a href="${appUrl}">Visit Website</a> | 
              <a href="mailto:support@bzion.shop">Support</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Welcome! Verify Your Email

    Hello,

    Thank you for signing up for ${appName}! To complete your account setup, please verify your email address.

    Visit this link to verify your email:
    ${verifyLink}

    This link will expire in 24 hours.

    If you didn't create this account, please ignore this email.

    © ${new Date().getFullYear()} ${appName}
  `;

  return sendEmail({
    to: email,
    subject: `Verify Your Email - ${appName}`,
    html,
    text,
  });
}

/**
 * Send welcome email after successful registration
 */
export async function sendWelcomeEmail(
  email: string,
  firstName?: string
): Promise<boolean> {
  const name = firstName ? ` ${firstName}` : '';
  const loginLink = `${appUrl}/login`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          ul { line-height: 1.8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${appName}</h1>
            <p>Welcome to ${appName}!</p>
          </div>

          <div class="content">
            <p>Hello${name},</p>
            <p>Your account has been successfully created. We're excited to have you on board!</p>
            
            <h3>Getting Started:</h3>
            <ul>
              <li>Browse our extensive product catalog</li>
              <li>Request quotes from suppliers</li>
              <li>Manage your orders and payments</li>
              <li>Track shipments in real-time</li>
            </ul>

            <p>
              <a href="${loginLink}" class="button">Login to Your Account</a>
            </p>

            <h3>Need Help?</h3>
            <p>Our support team is here to assist you. Don't hesitate to reach out:</p>
            <ul>
              <li>Email: <a href="mailto:support@bzion.shop">support@bzion.shop</a></li>
              <li>Phone: +234 701 032 6015</li>
              <li>Chat: Available on our website</li>
            </ul>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            <p>
              <a href="${appUrl}">Visit Website</a> | 
              <a href="mailto:support@bzion.shop">Support</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Welcome to ${appName}!

    Hello${name},

    Your account has been successfully created. We're excited to have you on board!

    Getting Started:
    - Browse our extensive product catalog
    - Request quotes from suppliers
    - Manage your orders and payments
    - Track shipments in real-time

    Login to your account: ${loginLink}

    Need Help?
    Our support team is here to assist you:
    - Email: support@bzion.shop
    - Phone: +234 701 032 6015

    © ${new Date().getFullYear()} ${appName}
  `;

  return sendEmail({
    to: email,
    subject: `Welcome to ${appName}!`,
    html,
    text,
  });
}

/**
 * Send password changed confirmation email
 */
export async function sendPasswordChangedEmail(email: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          .success { color: #10b981; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${appName}</h1>
            <p class="success">✓ Password Changed Successfully</p>
          </div>

          <div class="content">
            <p>Hello,</p>
            <p>Your password has been successfully changed. You can now log in with your new password.</p>
            
            <p>If you didn't make this change or suspect any unauthorized activity, please <a href="mailto:support@bzion.shop">contact support</a> immediately.</p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Password Changed Successfully

    Hello,

    Your password has been successfully changed. You can now log in with your new password.

    If you didn't make this change, please contact support immediately.

    © ${new Date().getFullYear()} ${appName}
  `;

  return sendEmail({
    to: email,
    subject: `Password Changed - ${appName}`,
    html,
    text,
  });
}

/**
 * Send test email
 * Used for verifying SMTP connection and configuration
 */
export async function sendTestEmail(to: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          .success { color: #10b981; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${appName}</h1>
            <p class="success">✅ SMTP Configuration Test</p>
          </div>

          <div class="content">
            <p>Hello,</p>
            <p>This is a test email to verify your SMTP configuration is working correctly.</p>
            
            <p><strong>Configuration Details:</strong></p>
            <ul>
              <li><strong>Host:</strong> ${process.env.SMTP_HOST || 'smtp.resend.com'}</li>
              <li><strong>Port:</strong> ${process.env.SMTP_PORT || '465'}</li>
              <li><strong>Encryption:</strong> ${process.env.SMTP_SECURE !== 'false' ? 'TLS/SSL (secure)' : 'STARTTLS'}</li>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            </ul>

            <p><strong>If you received this email, your email service is working correctly! ✅</strong></p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    SMTP Configuration Test

    This is a test email to verify your SMTP configuration is working correctly.

    Configuration:
    - Host: ${process.env.SMTP_HOST || 'smtp.resend.com'}
    - Port: ${process.env.SMTP_PORT || '465'}
    - Encryption: ${process.env.SMTP_SECURE !== 'false' ? 'TLS/SSL' : 'STARTTLS'}
    - Time: ${new Date().toISOString()}

    © ${new Date().getFullYear()} ${appName}
  `;

  return sendEmail({
    to,
    subject: `SMTP Test - ${appName}`,
    html,
    text,
  });
}
