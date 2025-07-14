import { createClient } from '@supabase/supabase-js';

// Server-side Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
import fetch from 'node-fetch';

interface EmailAccount {
  id: string;
  user_id: string;
  email: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_secure: boolean;
  from_name?: string;
}

interface SendEmailParams {
  from_account_id: string;
  to_address: string;
  subject: string;
  body: string;
  campaign_id?: string;
  user_id: string;
  email_type?: 'outreach' | 'newsletter' | 'system' | 'general';
  event_type?: string;
}

class EmailService {
  private generateSenderIdentity(userId: string, campaignId?: string): { email: string, name: string } {
    // Create unique sender identities based on user/campaign
    const baseEmail = `user${userId}${campaignId ? `-${campaignId}` : ''}@em5483.xtendcreator.com`;
    return {
      email: baseEmail,
      name: 'Xtend Creator'
    };
  }

  private generateCategories(params: SendEmailParams): string[] {
    const { email_type, user_id, campaign_id, event_type } = params;
    
    switch (email_type) {
      case 'outreach':
        return ['outreach', `creator-${user_id}`, `campaign-${campaign_id || 'direct'}`];
      
      case 'newsletter':
        return ['news', 'newsletter'];
      
      case 'system':
        return ['system-alert', `event-${event_type || 'general'}`];
      
      default:
        return ['general'];
    }
  }

  async sendEmail(params: SendEmailParams) {
    try {
      const senderIdentity = this.generateSenderIdentity(params.user_id, params.campaign_id);
      const categories = this.generateCategories(params);
      
      console.log(`📧 Sending email from ${senderIdentity.email} to ${params.to_address} via SendGrid`);
      console.log(`🏷️ Email categories: ${categories.join(', ')}`);

      // Use SendGrid API with verified domain
      const sendGridPayload = {
        personalizations: [
          {
            to: [{ email: params.to_address }],
            custom_args: {
              user_id: params.user_id,
              campaign_id: params.campaign_id || 'direct',
              email_type: params.email_type || 'general'
            }
          }
        ],
        from: { 
          email: senderIdentity.email,
          name: senderIdentity.name
        },
        reply_to: {
          email: senderIdentity.email,
          name: senderIdentity.name
        },
        subject: params.subject,
        content: [
          {
            type: 'text/plain',
            value: params.body
          },
          {
            type: 'text/html',
            value: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              ${params.body.replace(/\n/g, '<br>')}
              <br><br>
              <div style="color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 10px; margin-top: 20px;">
                Sent via Xtend Creators Platform
              </div>
            </div>`
          }
        ],
        tracking_settings: {
          click_tracking: {
            enable: true,
            enable_text: true
          },
          open_tracking: {
            enable: true,
            substitution_tag: "%open_track%"
          },
          subscription_tracking: {
            enable: false
          }
        },
        categories: categories
      };

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sendGridPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
      }

      const messageId = response.headers.get('x-message-id') || `sg_${Date.now()}`;
      console.log(`✅ Email sent successfully via SendGrid! Message ID: ${messageId}`);

      // Log the sent email to database with tracking data
      const { data: savedEmail, error: logError } = await supabase
        .from('emails')
        .insert({
          user_id: params.user_id,
          email_account_id: parseInt(params.from_account_id) || null,
          from_address: senderIdentity.email,
          to_address: params.to_address,
          subject: params.subject,
          body: params.body,
          direction: 'sent',
          campaign_id: params.campaign_id,
          sent_at: new Date().toISOString(),
          message_id: messageId,
          delivery_status: 'sent',
          provider: 'sendgrid',
          tracking_enabled: true,
          categories: categories.join(','),
          email_type: params.email_type || 'general'
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
        message: 'Email sent and logged.',
        email_id: savedEmail?.id,
        messageId: messageId
      };

    } catch (error) {
      console.error(`❌ Error sending email:`, error);
      return {
        status: 'failed',
        message: error.message,
        error: error.message
      };
    }
  }

  async getEmailsByUser(userId: string, direction?: 'sent' | 'received') {
    try {
      let query = supabase
        .from('emails')
        .select('*')
        .eq('user_id', userId);

      if (direction) {
        query = query.eq('direction', direction);
      }

      const { data, error } = await query
        .order('received_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching emails:', error);
      throw error;
    }
  }

  async getEmailsByCampaign(campaignId: string) {
    try {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('received_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching campaign emails:', error);
      throw error;
    }
  }

  async markEmailAsRead(emailId: string) {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ is_read: true })
        .eq('id', emailId);

      if (error) {
        throw error;
      }

      console.log(`✅ Email marked as read: ${emailId}`);
    } catch (error) {
      console.error('❌ Error marking email as read:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();