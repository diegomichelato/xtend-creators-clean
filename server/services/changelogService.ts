import { db } from "../db";
import { changelogEntries, type InsertChangelogEntry } from "@shared/schema";
import type { Request } from "express";

/**
 * Changelog Service
 * Tracks all system changes and user actions for audit purposes
 */

export interface LogChangeParams {
  userId?: number | null;
  changeType: string;
  description: string;
  payload?: any;
  req?: Request;
}

/**
 * Log a changelog entry for tracking system changes
 */
export async function logChangelogEntry({
  userId,
  changeType,
  description,
  payload,
  req
}: LogChangeParams): Promise<void> {
  try {
    const changelogData: InsertChangelogEntry = {
      userId: userId || null,
      changeType,
      description,
      payload: payload || null,
      ipAddress: req ? getClientIpAddress(req) : null,
      userAgent: req ? req.get('User-Agent') || null : null,
    };

    await db.insert(changelogEntries).values(changelogData);
    
    console.log(`[CHANGELOG] ${changeType}: ${description}${userId ? ` (User: ${userId})` : ''}`);
  } catch (error) {
    console.error('Failed to log changelog entry:', error);
    // Don't throw - logging should not break the main operation
  }
}

/**
 * Get client IP address from request
 */
function getClientIpAddress(req: Request): string {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection as any)?.socket?.remoteAddress ||
    req.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    req.get('X-Real-IP') ||
    'unknown'
  );
}

/**
 * Pre-defined change types for consistency
 */
export const ChangeTypes = {
  // Settings changes
  SMTP_UPDATE: 'smtp_update',
  API_KEY_UPDATE: 'api_key_update',
  PROFILE_UPDATE: 'profile_update',
  
  // Role and permission changes
  ROLE_CHANGE: 'role_change',
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  
  // Content changes
  TAB_EDIT: 'tab_edit',
  CREATOR_UPDATE: 'creator_update',
  CAMPAIGN_CREATED: 'campaign_created',
  CAMPAIGN_UPDATED: 'campaign_updated',
  
  // Email operations
  EMAIL_ACCOUNT_ADDED: 'email_account_added',
  EMAIL_ACCOUNT_UPDATED: 'email_account_updated',
  EMAIL_ACCOUNT_DELETED: 'email_account_deleted',
  
  // Contact operations
  CONTACT_IMPORTED: 'contact_imported',
  CONTACT_UPDATED: 'contact_updated',
  CONTACT_DELETED: 'contact_deleted',
  
  // System operations
  LOGIN: 'login',
  LOGOUT: 'logout',
  SYSTEM_UPDATE: 'system_update',
} as const;

export type ChangeType = typeof ChangeTypes[keyof typeof ChangeTypes];