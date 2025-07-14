import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export interface GmailAuthStatus {
  isAuthorized: boolean;
  activeTokens: number;
  requiresReauth: string[];
  blockedAttempts: number;
}

export class GmailAuthGuard {
  
  // Check if user has valid Gmail OAuth tokens
  async checkGmailAuth(userId: number): Promise<GmailAuthStatus> {
    try {
      const { data: tokens, error } = await supabase
        .from('gmail_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        console.error('❌ Error checking Gmail auth:', error);
        return {
          isAuthorized: false,
          activeTokens: 0,
          requiresReauth: [],
          blockedAttempts: 0
        };
      }

      const activeTokens = tokens?.length || 0;
      const expiredTokens = tokens?.filter(token => 
        new Date(token.expires_at) < new Date()
      ) || [];

      return {
        isAuthorized: activeTokens > 0 && expiredTokens.length === 0,
        activeTokens,
        requiresReauth: expiredTokens.map(t => t.email),
        blockedAttempts: 0
      };

    } catch (error) {
      console.error('❌ Gmail auth check failed:', error);
      return {
        isAuthorized: false,
        activeTokens: 0,
        requiresReauth: [],
        blockedAttempts: 0
      };
    }
  }

  // Block email operations without Gmail OAuth
  async enforceGmailAuth(userId: number, operation: string): Promise<boolean> {
    const authStatus = await this.checkGmailAuth(userId);
    
    if (!authStatus.isAuthorized) {
      console.log(`🚫 Blocked ${operation} for user ${userId} - Gmail OAuth required`);
      
      // Log blocked attempt for admin review
      await this.logBlockedAttempt(userId, operation);
      return false;
    }

    return true;
  }

  // Log blocked email attempts for admin review
  private async logBlockedAttempt(userId: number, operation: string) {
    try {
      const { error } = await supabase
        .from('oauth_blocked_attempts')
        .insert({
          user_id: userId,
          operation,
          attempted_at: new Date().toISOString(),
          reason: 'gmail_oauth_required'
        });

      if (error) {
        console.error('❌ Failed to log blocked attempt:', error);
      }
    } catch (error) {
      console.error('❌ Error logging blocked attempt:', error);
    }
  }

  // Get user's Gmail tokens for API operations
  async getValidGmailToken(userId: number): Promise<any | null> {
    const authStatus = await this.checkGmailAuth(userId);
    
    if (!authStatus.isAuthorized) {
      return null;
    }

    const { data: token, error } = await supabase
      .from('gmail_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !token) {
      console.error('❌ No valid Gmail token found for user:', userId);
      return null;
    }

    return token;
  }
}

export const gmailAuthGuard = new GmailAuthGuard();