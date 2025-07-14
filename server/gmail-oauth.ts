import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration for server-side
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Gmail OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/gmail/callback'
);

export class GmailOAuthService {
  
  // Generate OAuth2 URL for user to authenticate
  getAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: userId, // Pass user_id in state for callback
      prompt: 'consent' // Force consent to get refresh token
    });
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string, userId: string) {
    try {
      console.log(`🔐 Exchanging OAuth code for Gmail tokens for user: ${userId}`);
      
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Get user's email address
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const profile = await gmail.users.getProfile({ userId: 'me' });
      const emailAddress = profile.data.emailAddress;

      console.log(`📧 Gmail account connected: ${emailAddress}`);

      // Save tokens to database
      const { data: savedAccount, error } = await supabase
        .from('email_accounts')
        .insert({
          user_id: userId,
          email: emailAddress,
          provider: 'gmail_oauth',
          status: 'active',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          name: emailAddress?.split('@')[0] || 'Gmail Account',
          smtp_host: 'gmail_oauth',
          smtp_port: 0,
          smtp_username: emailAddress,
          smtp_secure: true
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving Gmail account:', error);
        throw new Error('Failed to save Gmail account');
      }

      console.log(`💾 Gmail account saved with ID: ${savedAccount.id}`);
      
      return {
        success: true,
        email: emailAddress,
        account_id: savedAccount.id
      };

    } catch (error) {
      console.error('❌ OAuth token exchange failed:', error);
      throw error;
    }
  }

  // Get authenticated Gmail client for user
  async getGmailClient(userId: string) {
    try {
      // Get user's Gmail account from database
      const { data: account, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', 'gmail_oauth')
        .eq('status', 'active')
        .single();

      if (error || !account) {
        throw new Error('Gmail account not found or not connected');
      }

      // Set up OAuth2 client with stored tokens
      oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expiry_date: account.token_expires_at ? new Date(account.token_expires_at).getTime() : undefined
      });

      // Check if token needs refresh
      if (account.token_expires_at && new Date() >= new Date(account.token_expires_at)) {
        console.log('🔄 Refreshing Gmail access token...');
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        // Update tokens in database
        await supabase
          .from('email_accounts')
          .update({
            access_token: credentials.access_token,
            token_expires_at: credentials.expiry_date ? new Date(credentials.expiry_date) : null
          })
          .eq('id', account.id);

        oauth2Client.setCredentials(credentials);
      }

      return {
        gmail: google.gmail({ version: 'v1', auth: oauth2Client }),
        account: account
      };

    } catch (error) {
      console.error('❌ Failed to get Gmail client:', error);
      throw error;
    }
  }

  // Send email via Gmail API
  async sendEmail(userId: string, emailData: {
    to: string;
    subject: string;
    body: string;
    campaign_id?: string;
  }) {
    try {
      console.log(`📧 Sending email via Gmail API for user: ${userId}`);
      
      const { gmail, account } = await this.getGmailClient(userId);

      // Create email message
      const email = [
        `To: ${emailData.to}`,
        `From: ${account.email}`,
        `Subject: ${emailData.subject}`,
        '',
        emailData.body
      ].join('\n');

      // Encode email as base64url
      const encodedMessage = Buffer.from(email).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send via Gmail API
      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage
        }
      });

      console.log(`✅ Email sent via Gmail API! Message ID: ${result.data.id}`);

      // Log to database
      const { data: savedEmail, error: logError } = await supabase
        .from('emails')
        .insert({
          user_id: userId,
          email_account_id: account.id,
          from_address: account.email,
          to_address: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          direction: 'sent',
          campaign_id: emailData.campaign_id,
          sent_at: new Date().toISOString(),
          gmail_message_id: result.data.id
        })
        .select()
        .single();

      if (logError) {
        console.error('❌ Error logging sent email:', logError);
      } else {
        console.log(`💾 Email saved to database with ID: ${savedEmail.id}`);
      }

      return {
        status: 'success',
        message: 'Email sent via Gmail API',
        gmail_message_id: result.data.id,
        email_id: savedEmail?.id
      };

    } catch (error) {
      console.error('❌ Gmail API send failed:', error);
      return {
        status: 'failed',
        message: error.message
      };
    }
  }

  // Sync recent emails from Gmail
  async syncRecentEmails(userId: string) {
    try {
      console.log(`📥 Syncing recent emails for user: ${userId}`);
      
      const { gmail, account } = await this.getGmailClient(userId);

      // Get recent messages (last 10)
      const listResult = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 10,
        q: 'in:inbox OR in:sent'
      });

      const messages = listResult.data.messages || [];
      console.log(`📬 Found ${messages.length} messages to sync`);

      const syncedEmails = [];

      for (const message of messages) {
        try {
          // Get full message details
          const fullMessage = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!
          });

          const headers = fullMessage.data.payload?.headers || [];
          const subject = headers.find(h => h.name === 'Subject')?.value || '';
          const from = headers.find(h => h.name === 'From')?.value || '';
          const to = headers.find(h => h.name === 'To')?.value || '';
          const date = headers.find(h => h.name === 'Date')?.value || '';

          // Get email body
          let body = '';
          if (fullMessage.data.payload?.body?.data) {
            body = Buffer.from(fullMessage.data.payload.body.data, 'base64').toString();
          } else if (fullMessage.data.payload?.parts) {
            const textPart = fullMessage.data.payload.parts.find(p => p.mimeType === 'text/plain');
            if (textPart?.body?.data) {
              body = Buffer.from(textPart.body.data, 'base64').toString();
            }
          }

          // Check if already exists
          const { data: existing } = await supabase
            .from('emails')
            .select('id')
            .eq('gmail_message_id', message.id!)
            .single();

          if (!existing) {
            // Determine direction
            const direction = from.includes(account.email!) ? 'sent' : 'received';

            // Save to database
            const { data: savedEmail, error } = await supabase
              .from('emails')
              .insert({
                user_id: userId,
                email_account_id: account.id,
                from_address: from,
                to_address: to,
                subject: subject,
                body: body.substring(0, 5000), // Limit body size
                direction: direction,
                gmail_message_id: message.id!,
                received_at: date ? new Date(date).toISOString() : new Date().toISOString()
              })
              .select()
              .single();

            if (!error && savedEmail) {
              syncedEmails.push(savedEmail);
            }
          }

        } catch (messageError) {
          console.error(`❌ Error processing message ${message.id}:`, messageError);
        }
      }

      console.log(`✅ Synced ${syncedEmails.length} new emails`);
      return {
        success: true,
        synced_count: syncedEmails.length,
        emails: syncedEmails
      };

    } catch (error) {
      console.error('❌ Email sync failed:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

export const gmailOAuthService = new GmailOAuthService();