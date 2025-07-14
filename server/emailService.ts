import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY environment variable is required');
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendWelcomeEmail(userData: { email: string; fullName: string; role: string; tempPassword: string }) {
  console.log('📧 Sending welcome email via SendGrid to:', userData.email);
  
  const fromEmail = process.env.FROM_EMAIL || process.env.SENDGRID_VERIFIED_SENDER_EMAIL || 'no-reply@system.xtendcreator.com';
  console.log('📧 From address:', fromEmail);
  
  const msg = {
    to: userData.email,
    from: {
      name: 'Xtend Creators',
      email: fromEmail
    },
    subject: `Welcome to Xtend Creators - ${userData.role === 'admin' ? 'Admin Account Created' : 'Your Account is Ready'}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Xtend Creators</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #E6E6E6;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
          
          <!-- Header with Xtend Creators branding -->
          <div style="background-color: #FF1578; padding: 50px 20px; text-align: center;">
            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
              <tr>
                <td align="center">
                  <!-- Logo container with white background -->
                  <table cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; margin: 0 auto 30px auto; padding: 25px 35px;">
                    <tr>
                      <td align="center">
                        <h1 style="color: #FF1578; margin: 0; font-size: 32px; font-weight: 900; font-family: 'Arial Black', Arial, sans-serif; text-align: center;">
                          Xtend Creators
                        </h1>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Welcome text -->
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: bold; line-height: 1.3;">
                    Welcome to the future of creator partnerships!
                  </h1>
                </td>
              </tr>
            </table>
          </div>

          <!-- Main content -->
          <div style="padding: 40px 30px;">
            <!-- Greeting -->
            <div style="margin-bottom: 30px;">
              <p style="color: #010004; margin: 0 0 15px 0; font-size: 20px; font-weight: 600;">
                Hello <span style="color: #FF1578;">${userData.email}</span>! 👋
              </p>
              <p style="color: #4a5568; margin: 0; font-size: 16px; line-height: 1.6;">
                We're thrilled to welcome you to <strong>Xtend Creators</strong> – the premier platform 
                connecting video content creators with brands for authentic partnerships and collaborations.
              </p>
            </div>

            <!-- Credentials Section -->
            <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h2 style="color: #010004; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">
                🔐 Your Login Credentials
              </h2>
              <p style="margin: 8px 0; color: #4a5568; font-size: 16px;">
                <strong>Email:</strong> ${userData.email}
              </p>
              <p style="margin: 8px 0; color: #4a5568; font-size: 16px;">
                <strong>Temporary Password:</strong> 
                <code style="background-color: #e2e8f0; padding: 6px 12px; border-radius: 6px; font-family: monospace; color: #2d3748; font-size: 14px;">${userData.tempPassword}</code>
              </p>
              <p style="color: #dc2626; margin: 15px 0 0 0; font-size: 14px; line-height: 1.4;">
                🔒 <strong>Security Notice:</strong> Please change your password after your first login for security.
              </p>
            </div>

            <!-- Platform features section -->
            <div style="margin: 35px 0;">
              <h4 style="color: #010004; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                🚀 What you can do now:
              </h4>
              
              <ul style="padding-left: 0; list-style: none;">
                <li style="margin: 12px 0; color: #4a5568; display: flex; align-items: center;">
                  <span style="color: #FF1578; margin-right: 10px; font-weight: bold;">●</span>
                  <strong>Explore Creator Profiles:</strong> Browse our talented creator roster
                </li>
                <li style="margin: 12px 0; color: #4a5568; display: flex; align-items: center;">
                  <span style="color: #FF1578; margin-right: 10px; font-weight: bold;">●</span>
                  <strong>Manage Campaigns:</strong> Create and track email outreach campaigns
                </li>
                <li style="margin: 12px 0; color: #4a5568; display: flex; align-items: center;">
                  <span style="color: #FF1578; margin-right: 10px; font-weight: bold;">●</span>
                  <strong>Build Contact Lists:</strong> Organize your prospect database
                </li>
                <li style="margin: 12px 0; color: #4a5568; display: flex; align-items: center;">
                  <span style="color: #FF1578; margin-right: 10px; font-weight: bold;">●</span>
                  <strong>Generate Proposals:</strong> Create professional partnership proposals
                </li>
                <li style="margin: 12px 0; color: #4a5568; display: flex; align-items: center;">
                  <span style="color: #FF1578; margin-right: 10px; font-weight: bold;">●</span>
                  <strong>Track Performance:</strong> Monitor campaign metrics and engagement
                </li>
              </ul>
            </div>

            <!-- CTA with Arrow -->
            <div style="text-align: center; margin: 40px 0;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td>
                    <a href="https://www.xtendcreator.com" 
                       style="background-color: #010004; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 15px 30px; border-radius: 8px; display: inline-block;">
                      › Start Exploring Platform
                    </a>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Support section -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="color: #4a5568; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>Need help?</strong> Our support team is here to assist you. Simply reply to this email or contact us through the platform.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #010004; padding: 30px; text-align: center;">
            <p style="color: #E6E6E6; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
              © 2025 Xtend Creators. Empowering authentic creator partnerships.
            </p>
            <p style="color: #888; margin: 0; font-size: 12px;">
              This email was sent to ${userData.email}
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    console.log('📤 Sending welcome email via SendGrid...');
    const [response] = await sgMail.send(msg);
    console.log('✅ Welcome email sent successfully via SendGrid!', {
      messageId: response.headers['x-message-id'],
      statusCode: response.statusCode
    });
    return { success: true, messageId: response.headers['x-message-id'] };
  } catch (error: any) {
    console.error('❌ SendGrid Error details:', error.message);
    console.error('❌ Full SendGrid error:', error.response?.body || error);
    throw new Error(`SendGrid error: ${error.message}`);
  }
}