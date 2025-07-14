import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import { orgGmailService } from './org-gmail-service';

// Server-side Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface GmailToken {
  id: string;
  user_id: string;
  email: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  status: 'active' | 'invalid' | 'expired';
}

export class GmailTokenRefreshService {
  
  // Check if token needs refresh (expires within 5 minutes)
  private needsRefresh(expiresAt: string): boolean {
    const expirationTime = new Date(expiresAt).getTime();
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    return expirationTime <= fiveMinutesFromNow;
  }

  // Refresh a single token
  async refreshToken(tokenRecord: GmailToken): Promise<boolean> {
    try {
      console.log(`🔄 Refreshing token for user: ${tokenRecord.user_id} (${tokenRecord.email})`);

      // Get organization-specific or platform credentials
      const oauth2Client = await orgGmailService.createOAuth2Client(tokenRecord.user_id);
      
      // Set the refresh token
      oauth2Client.setCredentials({
        refresh_token: tokenRecord.refresh_token
      });

      // Request new access token
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      if (!credentials.access_token) {
        throw new Error('No access token in refresh response');
      }

      // Calculate new expiry time
      const expiresAt = new Date(Date.now() + ((credentials.expiry_date || 3600) * 1000)).toISOString();

      // Update database with new token
      const { error: updateError } = await supabase
        .from('gmail_tokens')
        .update({
          access_token: credentials.access_token,
          expires_at: expiresAt,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', tokenRecord.id);

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      console.log(`✅ Token refreshed successfully for user: ${tokenRecord.user_id}`);
      return true;

    } catch (error) {
      console.error(`❌ Token refresh failed for user ${tokenRecord.user_id}:`, error);

      // Mark token as invalid if refresh fails
      await supabase
        .from('gmail_tokens')
        .update({
          status: 'invalid',
          updated_at: new Date().toISOString()
        })
        .eq('id', tokenRecord.id);

      return false;
    }
  }

  // Get all tokens that need refreshing
  async getTokensNeedingRefresh(): Promise<GmailToken[]> {
    try {
      const fiveMinutesFromNow = new Date(Date.now() + (5 * 60 * 1000)).toISOString();

      const { data: tokens, error } = await supabase
        .from('gmail_tokens')
        .select('*')
        .eq('status', 'active')
        .lt('expires_at', fiveMinutesFromNow);

      if (error) {
        throw new Error(`Failed to fetch tokens: ${error.message}`);
      }

      return tokens || [];

    } catch (error) {
      console.error('❌ Error fetching tokens for refresh:', error);
      return [];
    }
  }

  // Refresh all expired or soon-to-expire tokens
  async refreshAllTokens(): Promise<{ success: number; failed: number; total: number }> {
    console.log('🔄 Starting batch token refresh...');

    const tokens = await this.getTokensNeedingRefresh();
    
    if (tokens.length === 0) {
      console.log('✅ No tokens need refreshing');
      return { success: 0, failed: 0, total: 0 };
    }

    console.log(`📋 Found ${tokens.length} tokens that need refreshing`);

    let success = 0;
    let failed = 0;

    // Refresh tokens in parallel but limit concurrency
    const batchSize = 5;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      const promises = batch.map(token => this.refreshToken(token));
      const results = await Promise.all(promises);
      
      success += results.filter(result => result).length;
      failed += results.filter(result => !result).length;

      // Brief pause between batches
      if (i + batchSize < tokens.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ Batch refresh complete: ${success} success, ${failed} failed, ${tokens.length} total`);
    return { success, failed, total: tokens.length };
  }

  // Validate a specific token for immediate use
  async validateTokenForUser(userId: string): Promise<boolean> {
    try {
      const { data: token, error } = await supabase
        .from('gmail_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error || !token) {
        console.log(`❌ No valid token found for user: ${userId}`);
        return false;
      }

      // Check if token needs refresh
      if (this.needsRefresh(token.expires_at)) {
        console.log(`🔄 Token for user ${userId} needs refresh`);
        return await this.refreshToken(token);
      }

      console.log(`✅ Token for user ${userId} is valid`);
      return true;

    } catch (error) {
      console.error(`❌ Token validation failed for user ${userId}:`, error);
      return false;
    }
  }

  // Get accounts that need re-authentication (for admin dashboard)
  async getAccountsNeedingReauth(): Promise<Array<{
    user_id: string;
    email: string;
    status: string;
    last_failed_at?: string;
  }>> {
    try {
      const { data: accounts, error } = await supabase
        .from('gmail_tokens')
        .select('user_id, email, status, updated_at')
        .eq('status', 'invalid')
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch invalid accounts: ${error.message}`);
      }

      return (accounts || []).map(account => ({
        user_id: account.user_id,
        email: account.email,
        status: account.status,
        last_failed_at: account.updated_at
      }));

    } catch (error) {
      console.error('❌ Error fetching accounts needing reauth:', error);
      return [];
    }
  }
}

export const gmailTokenRefresh = new GmailTokenRefreshService();