/**
 * Enhanced Email Utilities with Gmail Integration
 * Provides failover capabilities and improved error handling
 */
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: 'sendgrid' | 'gmail' | 'smtp';
  statusCode?: number;
  duration: number;
}

/**
 * Send email with automatic failover
 * Tries SendGrid first, falls back to Gmail if configured
 */
export async function sendEmailWithFailover(options: EmailOptions): Promise<EmailResult> {
  const startTime = Date.now();
  
  // Primary: SendGrid
  try {
    const result = await sendViaGendGrid(options);
    return {
      ...result,
      duration: Date.now() - startTime
    };
  } catch (sendGridError) {
    console.warn('SendGrid failed, attempting Gmail fallback:', sendGridError);
    
    // Fallback: Gmail SMTP
    if (process.env.GMAIL_APP_PASSWORD && process.env.GMAIL_USER) {
      try {
        const result = await sendViaGmail(options);
        return {
          ...result,
          duration: Date.now() - startTime
        };
      } catch (gmailError) {
        console.error('Gmail fallback also failed:', gmailError);
      }
    }
    
    // Both failed
    return {
      success: false,
      error: `Email delivery failed. SendGrid: ${sendGridError instanceof Error ? sendGridError.message : 'Unknown error'}`,
      provider: 'sendgrid',
      duration: Date.now() - startTime
    };
  }
}

/**
 * Send email via SendGrid
 */
async function sendViaGendGrid(options: EmailOptions): Promise<Omit<EmailResult, 'duration'>> {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SendGrid API key not configured');
  }

  const msg = {
    to: options.to,
    from: options.from || process.env.SENDGRID_VERIFIED_SENDER_EMAIL || 'no-reply@system.xtendcreator.com',
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  const response = await sgMail.send(msg);
  
  return {
    success: true,
    messageId: response[0].headers['x-message-id'] as string,
    provider: 'sendgrid',
    statusCode: response[0].statusCode
  };
}

/**
 * Send email via Gmail SMTP (fallback)
 */
async function sendViaGmail(options: EmailOptions): Promise<Omit<EmailResult, 'duration'>> {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  const mailOptions = {
    from: options.from || process.env.GMAIL_USER,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  const info = await transporter.sendMail(mailOptions);
  
  return {
    success: true,
    messageId: info.messageId,
    provider: 'gmail'
  };
}

/**
 * Validate email configuration
 */
export function validateEmailConfig(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!process.env.SENDGRID_API_KEY) {
    issues.push('SENDGRID_API_KEY not configured');
  }
  
  if (!process.env.SENDGRID_VERIFIED_SENDER_EMAIL) {
    issues.push('SENDGRID_VERIFIED_SENDER_EMAIL not configured');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}