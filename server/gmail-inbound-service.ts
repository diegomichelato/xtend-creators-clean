import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import { orgGmailService } from './org-gmail-service';
import { gmailTokenRefresh } from './gmail-token-refresh';

// Server-side Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface InboundEmail {
  message_id: string;
  thread_id: string;
  from_address: string;
  to_address: string;
  subject: string;
  body: string;
  received_at: string;
  labels: string[];
  snippet: string;
}

export class GmailInboundService {
  
  // Sync recent emails from a user's Gmail
  async syncRecentEmails(userId: string, hoursBack: number = 24): Promise<{
    success: boolean;
    emails_synced: number;
    new_emails: number;
  }> {
    try {
      console.log(`📥 Syncing Gmail for user: ${userId} (${hoursBack}h back)`);

      // Validate token first
      const isTokenValid = await gmailTokenRefresh.validateTokenForUser(userId);
      if (!isTokenValid) {
        throw new Error('Gmail token invalid or expired');
      }

      // Get user's Gmail token
      const { data: tokenData, error: tokenError } = await supabase
        .from('gmail_tokens')
        .select('access_token, email')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (tokenError || !tokenData) {
        throw new Error('No valid Gmail token found');
      }

      // Create authenticated Gmail client
      const oauth2Client = await orgGmailService.createOAuth2Client(parseInt(userId));
      oauth2Client.setCredentials({ access_token: tokenData.access_token });
      
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      // Calculate date filter for recent emails
      const hoursAgo = new Date(Date.now() - (hoursBack * 60 * 60 * 1000));
      const dateFilter = Math.floor(hoursAgo.getTime() / 1000);

      // Search for recent emails
      const listResponse = await gmail.users.messages.list({
        userId: 'me',
        q: `after:${dateFilter} in:inbox`,
        maxResults: 50
      });

      const messages = listResponse.data.messages || [];
      console.log(`📬 Found ${messages.length} recent emails`);

      if (messages.length === 0) {
        return { success: true, emails_synced: 0, new_emails: 0 };
      }

      let newEmails = 0;
      let totalSynced = 0;

      // Process messages in batches
      for (const message of messages) {
        try {
          const isNew = await this.processInboundMessage(
            gmail, 
            message.id!, 
            userId, 
            tokenData.email
          );
          
          if (isNew) newEmails++;
          totalSynced++;

          // Brief pause between requests
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`❌ Error processing message ${message.id}:`, error);
        }
      }

      console.log(`✅ Gmail sync complete: ${newEmails} new emails, ${totalSynced} total processed`);
      return { success: true, emails_synced: totalSynced, new_emails: newEmails };

    } catch (error) {
      console.error(`❌ Gmail sync failed for user ${userId}:`, error);
      return { success: false, emails_synced: 0, new_emails: 0 };
    }
  }

  // Process a single Gmail message
  private async processInboundMessage(
    gmail: any, 
    messageId: string, 
    userId: string, 
    userEmail: string
  ): Promise<boolean> {
    try {
      // Check if we've already processed this message
      const { data: existing, error: checkError } = await supabase
        .from('emails')
        .select('id')
        .eq('message_id', messageId)
        .single();

      if (!checkError && existing) {
        return false; // Already processed
      }

      // Get full message details
      const messageResponse = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      const message = messageResponse.data;
      const headers = message.payload?.headers || [];
      
      // Extract email metadata
      const fromHeader = headers.find((h: any) => h.name === 'From')?.value || '';
      const toHeader = headers.find((h: any) => h.name === 'To')?.value || '';
      const subjectHeader = headers.find((h: any) => h.name === 'Subject')?.value || '';
      const dateHeader = headers.find((h: any) => h.name === 'Date')?.value || '';

      // Extract email body
      const body = this.extractEmailBody(message.payload);
      
      // Parse received date
      const receivedAt = dateHeader ? new Date(dateHeader).toISOString() : new Date().toISOString();

      // Check if this is a reply to one of our sent emails
      const threadId = await this.findRelatedThread(subjectHeader, fromHeader, userId);

      // Insert into emails table
      const { error: insertError } = await supabase
        .from('emails')
        .insert({
          user_id: userId,
          message_id: messageId,
          thread_id: threadId,
          direction: 'received',
          from_address: fromHeader,
          to_address: toHeader,
          subject: subjectHeader,
          body: body,
          status: 'delivered',
          sent_at: receivedAt,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      console.log(`📨 Processed inbound email: ${fromHeader} -> ${subjectHeader}`);
      return true;

    } catch (error) {
      console.error(`❌ Error processing message ${messageId}:`, error);
      return false;
    }
  }

  // Extract email body from Gmail message payload
  private extractEmailBody(payload: any): string {
    if (!payload) return '';

    // Handle simple text body
    if (payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    // Handle multipart message
    if (payload.parts) {
      for (const part of payload.parts) {
        // Look for text/plain first
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }

      // Fallback to text/html
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          const htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
          // Basic HTML to text conversion
          return htmlBody.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
        }
      }

      // Recursive search in nested parts
      for (const part of payload.parts) {
        if (part.parts) {
          const nestedBody = this.extractEmailBody(part);
          if (nestedBody) return nestedBody;
        }
      }
    }

    return '';
  }

  // Find related thread for email replies
  private async findRelatedThread(subject: string, fromAddress: string, userId: string): Promise<string | null> {
    try {
      // Clean subject line (remove Re:, Fwd:, etc.)
      const cleanSubject = subject
        .replace(/^(Re:|RE:|Fwd:|FWD:|Fw:)[\s]*/i, '')
        .trim();

      if (!cleanSubject) return null;

      // Look for emails we sent to this address with similar subject
      const { data: sentEmails, error } = await supabase
        .from('emails')
        .select('thread_id, subject')
        .eq('user_id', userId)
        .eq('direction', 'sent')
        .ilike('to_address', `%${fromAddress}%`)
        .order('sent_at', { ascending: false })
        .limit(10);

      if (error || !sentEmails?.length) return null;

      // Find best matching thread
      for (const email of sentEmails) {
        if (email.subject && email.subject.toLowerCase().includes(cleanSubject.toLowerCase())) {
          return email.thread_id;
        }
      }

      return null;

    } catch (error) {
      console.error('❌ Error finding related thread:', error);
      return null;
    }
  }

  // Handle webhook-based inbound emails (alternative approach)
  async handleInboundWebhook(emailData: {
    from: string;
    to: string;
    subject: string;
    body: string;
    messageId: string;
    receivedAt: string;
  }): Promise<boolean> {
    try {
      console.log(`📧 Processing webhook email: ${emailData.from} -> ${emailData.subject}`);

      // Extract user from to address (assumes format like user+id@domain.com)
      const userId = this.extractUserIdFromAddress(emailData.to);
      if (!userId) {
        console.log('❌ Could not extract user ID from email address');
        return false;
      }

      // Check for duplicates
      const { data: existing } = await supabase
        .from('emails')
        .select('id')
        .eq('message_id', emailData.messageId)
        .single();

      if (existing) {
        console.log('📨 Email already processed');
        return true;
      }

      // Find related thread
      const threadId = await this.findRelatedThread(emailData.subject, emailData.from, userId);

      // Insert email
      const { error } = await supabase
        .from('emails')
        .insert({
          user_id: userId,
          message_id: emailData.messageId,
          thread_id: threadId,
          direction: 'received',
          from_address: emailData.from,
          to_address: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          status: 'delivered',
          sent_at: emailData.receivedAt,
          created_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Database insert failed: ${error.message}`);
      }

      console.log(`✅ Webhook email processed successfully`);
      return true;

    } catch (error) {
      console.error('❌ Webhook email processing failed:', error);
      return false;
    }
  }

  // Extract user ID from email address (for webhook approach)
  private extractUserIdFromAddress(address: string): string | null {
    // Handle formats like: user+123@domain.com or 123@domain.com
    const match = address.match(/(?:user\+)?([a-f0-9-]+)@/i);
    return match ? match[1] : null;
  }
}

export const gmailInboundService = new GmailInboundService();