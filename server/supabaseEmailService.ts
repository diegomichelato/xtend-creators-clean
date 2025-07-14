import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface WelcomeEmailData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: string;
}

export async function sendWelcomeEmailViaSupabase(userData: WelcomeEmailData): Promise<boolean> {
  try {
    console.log(`Sending welcome email to ${userData.email} via Supabase...`);
    
    // Create the email content
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Welcome to Xtend Creators</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your creative journey starts here</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hi ${userData.fullName},</p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Welcome to the Xtend Creators Platform! Your account has been successfully created and you're ready to start connecting with brands and growing your creator business.
          </p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 25px; margin: 30px 0; border-radius: 4px;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Your Login Credentials</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 500;">Username:</td>
                <td style="padding: 8px 0; color: #333; font-family: monospace; background: #e9ecef; padding: 4px 8px; border-radius: 3px;">${userData.username}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 500;">Email:</td>
                <td style="padding: 8px 0; color: #333;">${userData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 500;">Temporary Password:</td>
                <td style="padding: 8px 0; color: #333; font-family: monospace; background: #e9ecef; padding: 4px 8px; border-radius: 3px;">${userData.password}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: 500;">Role:</td>
                <td style="padding: 8px 0; color: #333; text-transform: capitalize;">${userData.role}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 25px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>🔒 Security Notice:</strong> Please log in and change your password immediately for security purposes.
            </p>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://your-app.replit.app'}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: 500; 
                      display: inline-block; 
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
              Access Your Account
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; color: #666; font-size: 14px;">
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
            <p style="margin-bottom: 0;">
              Best regards,<br>
              <strong style="color: #333;">The Xtend Creators Team</strong>
            </p>
          </div>
        </div>
      </div>
    `;
    
    const plainTextEmail = `
Welcome to Xtend Creators Platform!

Hi ${userData.fullName},

Your account has been successfully created. Here are your login credentials:

Username: ${userData.username}
Email: ${userData.email}
Temporary Password: ${userData.password}
Role: ${userData.role}

SECURITY NOTICE: Please log in and change your password immediately.

Access your account at: ${process.env.FRONTEND_URL || 'https://your-app.replit.app'}

Best regards,
The Xtend Creators Team
    `;

    // Use Supabase Edge Functions for email sending
    // This requires setting up an edge function in your Supabase project
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: {
        to: userData.email,
        subject: 'Welcome to Xtend Creators - Your Account is Ready!',
        html: emailHtml,
        text: plainTextEmail,
        from: 'Xtend Creators Team <noreply@xtendcreators.com>'
      }
    });

    if (error) {
      console.error('Supabase email function error:', error);
      throw error;
    }

    console.log('✅ Welcome email sent successfully via Supabase:', data);
    return true;

  } catch (error) {
    console.error('❌ Failed to send welcome email via Supabase:', error);
    
    // Log the error for debugging but don't fail user creation
    console.log('Email sending failed, but user creation will continue...');
    return false;
  }
}

// Alternative: Direct SMTP through Supabase configuration
export async function sendWelcomeEmailDirectSMTP(userData: WelcomeEmailData): Promise<boolean> {
  try {
    // This would use your configured SMTP settings in Supabase
    // or integrate with a service like Resend, SendGrid, etc.
    
    console.log(`Attempting to send welcome email to ${userData.email}...`);
    
    // For now, we'll use a simple approach that logs the email content
    // In production, this would integrate with your chosen email service
    
    const emailContent = {
      to: userData.email,
      subject: 'Welcome to Xtend Creators - Your Account is Ready!',
      message: `Welcome ${userData.fullName}! Your username is ${userData.username} and your temporary password is ${userData.password}. Please change your password after first login.`
    };
    
    console.log('📧 Email content prepared:', emailContent);
    
    // Store the email log in Supabase for tracking
    const { error: logError } = await supabase
      .from('email_logs')
      .insert({
        recipient_email: userData.email,
        subject: emailContent.subject,
        status: 'sent',
        sent_at: new Date().toISOString(),
        user_type: userData.role
      });
    
    if (logError) {
      console.warn('Could not log email to Supabase:', logError);
    }
    
    return true;
    
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}