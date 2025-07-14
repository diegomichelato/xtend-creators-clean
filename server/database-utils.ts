/**
 * Database Utilities and Schema Management
 * Handles database operations and schema cache issues
 */
import { db } from './db.js';

/**
 * Fix for Supabase/PostgREST schema cache issues
 * Forces schema refresh by performing operations that trigger cache reload
 */
export async function refreshDatabaseSchema(): Promise<void> {
  try {
    // Method 1: Perform a schema-touching operation
    await db.execute(`
      COMMENT ON COLUMN emails.categories IS 'Email categories for tracking and organization';
    `);
    
    console.log('Database schema cache refreshed successfully');
  } catch (error) {
    console.warn('Schema refresh warning:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Validate all required database tables and columns exist
 */
export async function validateDatabaseSchema(): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = [];
  
  try {
    // Check emails table structure
    const emailsColumns = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'emails'
    `);
    
    const requiredEmailColumns = ['id', 'subject', 'body', 'status', 'categories', 'message_id'];
    const existingColumns = emailsColumns.rows.map((row: any) => row.column_name);
    
    for (const col of requiredEmailColumns) {
      if (!existingColumns.includes(col)) {
        issues.push(`Missing column: emails.${col}`);
      }
    }
    
    // Check email_accounts table structure
    const accountsColumns = await db.execute(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'email_accounts'
    `);
    
    const requiredAccountColumns = ['id', 'email', 'provider', 'status', 'is_primary'];
    const existingAccountColumns = accountsColumns.rows.map((row: any) => row.column_name);
    
    for (const col of requiredAccountColumns) {
      if (!existingAccountColumns.includes(col)) {
        issues.push(`Missing column: email_accounts.${col}`);
      }
    }
    
  } catch (error) {
    issues.push(`Database validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Safe database operations with error handling
 */
export class DatabaseManager {
  /**
   * Insert email record with proper error handling
   */
  static async insertEmail(emailData: {
    subject: string;
    body: string;
    status: string;
    categories?: string;
    message_id?: string;
    email_account_id?: number;
    campaign_id?: string;
    user_id?: string;
  }) {
    try {
      const result = await db.execute(`
        INSERT INTO emails (
          subject, body, status, categories, message_id, 
          email_account_id, campaign_id, sent_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, NOW()
        ) RETURNING id
      `, [
        emailData.subject,
        emailData.body,
        emailData.status,
        emailData.categories || '',
        emailData.message_id || null,
        emailData.email_account_id || null,
        emailData.campaign_id || null
      ]);
      
      console.log('Email logged successfully to database');
      return result.rows[0];
    } catch (error) {
      console.error('Failed to log email to database:', error);
      throw error;
    }
  }
  
  /**
   * Get email account with fallback handling
   */
  static async getEmailAccount(accountId: number) {
    try {
      const result = await db.execute(
        'SELECT * FROM email_accounts WHERE id = $1',
        [accountId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to fetch email account:', error);
      return null;
    }
  }
}