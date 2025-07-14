// server/gmail-service-working.ts
import { google } from 'googleapis';
import { db } from './db';
import { emailAccounts, emails } from '../shared/schema';
import { eq, and } from 'drizzle-orm';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:5000/api/gmail/oauth/callback'  // Adjust port if needed
);

export class WorkingGmailService {
  getAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: userId,
      prompt: 'consent'
    });
  }

  async testConnection(userId: string) {
    try {
      const authUrl = this.getAuthUrl(userId);
      return {
        success: true,
        message: 'Gmail OAuth service working!',
        hasCredentials: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

export const workingGmailService = new WorkingGmailService();
