import { gmailTokenRefresh } from './gmail-token-refresh';
import { gmailInboundService } from './gmail-inbound-service';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class BackgroundJobService {
  private isRunning = false;
  private intervals: NodeJS.Timeout[] = [];

  // Start background job scheduler
  start() {
    if (this.isRunning) {
      console.log('⚙️ Background jobs already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting background job scheduler...');

    // Token refresh job - every 30 minutes
    const tokenRefreshInterval = setInterval(async () => {
      try {
        console.log('🔄 Running scheduled token refresh...');
        const result = await gmailTokenRefresh.refreshAllTokens();
        console.log(`✅ Token refresh completed: ${result.success} success, ${result.failed} failed`);
      } catch (error) {
        console.error('❌ Scheduled token refresh failed:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Gmail sync job - every 5 minutes
    const gmailSyncInterval = setInterval(async () => {
      try {
        await this.syncAllUserEmails();
      } catch (error) {
        console.error('❌ Scheduled Gmail sync failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    this.intervals.push(tokenRefreshInterval, gmailSyncInterval);

    // Run initial jobs
    setTimeout(() => this.syncAllUserEmails(), 10000); // Initial sync after 10 seconds
    setTimeout(() => gmailTokenRefresh.refreshAllTokens(), 30000); // Initial refresh after 30 seconds
  }

  // Stop background jobs
  stop() {
    if (!this.isRunning) return;

    console.log('⏹️ Stopping background job scheduler...');
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    this.isRunning = false;
  }

  // Sync emails for all active users
  private async syncAllUserEmails() {
    try {
      console.log('📥 Running scheduled Gmail sync for all users...');

      // Get all active Gmail tokens
      const { data: tokens, error } = await supabase
        .from('gmail_tokens')
        .select('user_id, email')
        .eq('status', 'active');

      if (error || !tokens?.length) {
        console.log('📬 No active Gmail tokens found for sync');
        return;
      }

      console.log(`📋 Syncing Gmail for ${tokens.length} users...`);

      let successful = 0;
      let failed = 0;

      // Process in smaller batches to avoid overwhelming the system
      const batchSize = 3;
      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);
        
        const promises = batch.map(async (token) => {
          try {
            const result = await gmailInboundService.syncRecentEmails(token.user_id, 1); // Last 1 hour
            if (result.success && result.new_emails > 0) {
              console.log(`📨 User ${token.user_id}: ${result.new_emails} new emails`);
            }
            return result.success;
          } catch (error) {
            console.error(`❌ Sync failed for user ${token.user_id}:`, error);
            return false;
          }
        });

        const results = await Promise.all(promises);
        successful += results.filter(r => r).length;
        failed += results.filter(r => !r).length;

        // Brief pause between batches
        if (i + batchSize < tokens.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      console.log(`✅ Gmail sync completed: ${successful} successful, ${failed} failed`);

    } catch (error) {
      console.error('❌ Error in scheduled Gmail sync:', error);
    }
  }

  // Manual trigger for testing
  async triggerTokenRefresh() {
    console.log('🔄 Manual token refresh triggered...');
    return await gmailTokenRefresh.refreshAllTokens();
  }

  async triggerGmailSync() {
    console.log('📥 Manual Gmail sync triggered...');
    await this.syncAllUserEmails();
  }
}

export const backgroundJobs = new BackgroundJobService();