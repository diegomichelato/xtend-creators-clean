import express from 'express';
import { sendEmail } from './email.js';
import dotenv from 'dotenv';

dotenv.config();

// Log environment variables at startup
console.log('🔧 Environment Configuration:');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL || 'NOT SET');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET');
console.log('SENDGRID_VERIFIED_SENDER_EMAIL:', process.env.SENDGRID_VERIFIED_SENDER_EMAIL ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Utility function to generate random tokens
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Store for mock tokens (in production, use a database)
const tokens = new Map();

// POST /api/register - Send welcome email
app.post('/api/register', async (req, res) => {
  try {
    const { email, name, username } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const emailData = {
      to: email,
      subject: 'Welcome to Xtend Creator!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00a99d;">Welcome to Xtend Creator!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for joining Xtend Creator! We're excited to have you on board.</p>
          <p>Your account has been successfully created with the username: <strong>${username || 'Not provided'}</strong></p>
          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #00a99d;">
            <h3>What's Next?</h3>
            <ul>
              <li>Complete your profile setup</li>
              <li>Connect your Gmail account</li>
              <li>Start creating your first campaign</li>
            </ul>
          </div>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The Xtend Creator Team</p>
        </div>
      `,
      text: `Welcome to Xtend Creator! Hi ${name}, thank you for joining us. Your account has been created successfully.`
    };

    const success = await sendEmail(emailData);

    if (success) {
      res.json({ 
        message: 'User registered successfully and welcome email sent',
        email: email 
      });
    } else {
      res.status(500).json({ error: 'User registered but email failed to send' });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/forgot-password - Send password reset email
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const resetToken = generateToken();
    tokens.set(resetToken, { email, type: 'password-reset', expires: Date.now() + 3600000 }); // 1 hour

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;

    const emailData = {
      to: email,
      subject: 'Reset Your Password - Xtend Creator',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00a99d;">Password Reset Request</h1>
          <p>We received a request to reset your password for your Xtend Creator account.</p>
          <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center;">
            <p style="margin-bottom: 20px;">Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="background-color: #00a99d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}">${resetUrl}</a></p>
        </div>
      `,
      text: `Password reset requested. Visit this link to reset your password: ${resetUrl} (expires in 1 hour)`
    };

    const success = await sendEmail(emailData);

    if (success) {
      res.json({ 
        message: 'Password reset email sent successfully',
        token: resetToken // In production, don't return the token
      });
    } else {
      res.status(500).json({ error: 'Failed to send password reset email' });
    }

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// POST /api/password-reset-success - Send password change confirmation
app.post('/api/password-reset-success', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const emailData = {
      to: email,
      subject: 'Password Changed Successfully - Xtend Creator',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #28a745;">Password Changed Successfully</h1>
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0; color: #155724;"><strong>✓ Your password has been changed successfully.</strong></p>
          </div>
          <p>Your Xtend Creator account password was just changed. If you made this change, no further action is needed.</p>
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0; color: #856404;"><strong>Didn't make this change?</strong><br>
            If you didn't change your password, please contact our support team immediately.</p>
          </div>
          <p>For your security, we recommend:</p>
          <ul>
            <li>Using a strong, unique password</li>
            <li>Enabling two-factor authentication if available</li>
            <li>Keeping your account information up to date</li>
          </ul>
          <p>Thank you for keeping your account secure.</p>
          <p>Best regards,<br>The Xtend Creator Security Team</p>
        </div>
      `,
      text: `Your Xtend Creator password has been changed successfully. If you didn't make this change, contact support immediately.`
    };

    const success = await sendEmail(emailData);

    if (success) {
      res.json({ message: 'Password change confirmation email sent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to send confirmation email' });
    }

  } catch (error) {
    console.error('Password confirmation error:', error);
    res.status(500).json({ error: 'Failed to send confirmation email' });
  }
});

// POST /api/send-verification - Send email verification
app.post('/api/send-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const verificationToken = generateToken();
    tokens.set(verificationToken, { email, type: 'email-verification', expires: Date.now() + 86400000 }); // 24 hours

    const verificationUrl = `${req.protocol}://${req.get('host')}/api/verify-email?token=${verificationToken}`;

    const emailData = {
      to: email,
      subject: 'Verify Your Email Address - Xtend Creator',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #00a99d;">Verify Your Email Address</h1>
          <p>Thank you for signing up for Xtend Creator! Please verify your email address to complete your account setup.</p>
          <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center;">
            <p style="margin-bottom: 20px;">Click the button below to verify your email:</p>
            <a href="${verificationUrl}" style="background-color: #00a99d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
          </div>
          <p><strong>This verification link will expire in 24 hours.</strong></p>
          <p>Once verified, you'll have full access to all Xtend Creator features including:</p>
          <ul>
            <li>Creating and managing email campaigns</li>
            <li>Connecting your Gmail account</li>
            <li>Accessing analytics and reports</li>
            <li>Managing your creator profile</li>
          </ul>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verificationUrl}">${verificationUrl}</a></p>
        </div>
      `,
      text: `Please verify your email address by visiting: ${verificationUrl} (expires in 24 hours)`
    };

    const success = await sendEmail(emailData);

    if (success) {
      res.json({ 
        message: 'Verification email sent successfully',
        token: verificationToken // In production, don't return the token
      });
    } else {
      res.status(500).json({ error: 'Failed to send verification email' });
    }

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// GET /api/verify-email - Verify email token
app.get('/api/verify-email', (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const tokenData = tokens.get(token);

    if (!tokenData) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    if (tokenData.expires < Date.now()) {
      tokens.delete(token);
      return res.status(400).json({ error: 'Verification token has expired' });
    }

    if (tokenData.type !== 'email-verification') {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    // Remove the token after successful verification
    tokens.delete(token);

    res.json({ 
      message: 'Email verified successfully!',
      email: tokenData.email,
      verified: true
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Transactional Email Service',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Transactional email server running on port ${PORT}`);
  console.log(`📧 Using SendGrid with from email: ${process.env.FROM_EMAIL || 'no-reply@system.xtendcreator.com'}`);
});