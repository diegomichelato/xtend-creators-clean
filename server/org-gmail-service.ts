import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface OrgGmailCredentials {
  id: string;
  org_id: string;
  google_client_id: string;
  google_client_secret: string;
  redirect_uri: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface UserOrganization {
  user_id: number;
  org_id: number;
  role: 'admin' | 'member' | 'viewer';
}

export class OrganizationalGmailService {
  
  // Get Gmail credentials for a user's organization
  async getOrgGmailCredentials(userId: number): Promise<OrgGmailCredentials | null> {
    try {
      // First, get the user's organization
      const { data: userOrg, error: orgError } = await supabase
        .from('user_organizations')
        .select('org_id')
        .eq('user_id', userId)
        .single();

      if (orgError || !userOrg) {
        console.log(`📋 User ${userId} not part of any organization, using platform credentials`);
        return null;
      }

      // Get organization's Gmail credentials
      const { data: credentials, error: credError } = await supabase
        .from('org_gmail_integrations')
        .select('*')
        .eq('org_id', userOrg.org_id)
        .eq('status', 'active')
        .single();

      if (credError || !credentials) {
        console.log(`📋 Organization ${userOrg.org_id} has no Gmail credentials, using platform credentials`);
        return null;
      }

      return credentials;

    } catch (error) {
      console.error('❌ Error fetching org Gmail credentials:', error);
      return null;
    }
  }

  // Create OAuth2 client with appropriate credentials
  async createOAuth2Client(userId: number) {
    const orgCredentials = await this.getOrgGmailCredentials(userId);
    
    if (orgCredentials) {
      console.log(`🏢 Using organization Gmail credentials for user: ${userId}`);
      return new google.auth.OAuth2(
        orgCredentials.google_client_id,
        orgCredentials.google_client_secret,
        orgCredentials.redirect_uri
      );
    } else {
      console.log(`🌐 Using platform Gmail credentials for user: ${userId}`);
      return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'https://xtendcreators.replit.app/api/auth/gmail/callback'
      );
    }
  }

  // Generate OAuth URL with proper credentials
  async getAuthUrl(userId: number): Promise<string> {
    const oauth2Client = await this.createOAuth2Client(userId);
    
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: userId.toString(),
      prompt: 'consent'
    });
    
    console.log(`🔗 Generated OAuth URL for user ${userId}:`, authUrl);
    return authUrl;
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string, userId: string) {
    try {
      console.log(`🔐 Exchanging OAuth code for Gmail tokens for user: ${userId}`);
      
      const oauth2Client = await this.createOAuth2Client(parseInt(userId));
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Get user's email address
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const profile = await gmail.users.getProfile({ userId: 'me' });
      const emailAddress = profile.data.emailAddress;

      if (!emailAddress || !tokens.access_token || !tokens.refresh_token) {
        throw new Error('Missing required token data');
      }

      console.log(`📧 Gmail account connected: ${emailAddress}`);

      // Save tokens to database
      const { data: savedToken, error } = await supabase
        .from('gmail_tokens')
        .upsert({
          user_id: parseInt(userId),
          email: emailAddress,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : new Date(Date.now() + 3600000).toISOString(),
          status: 'active',
          scopes: JSON.stringify([
            'https://www.googleapis.com/auth/gmail.compose',
            'https://www.googleapis.com/auth/userinfo.email'
          ])
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving Gmail tokens:', error);
        throw new Error('Failed to save Gmail tokens');
      }

      console.log(`💾 Gmail tokens saved with ID: ${savedToken.id}`);
      
      return {
        success: true,
        email: emailAddress,
        token_id: savedToken.id
      };

    } catch (error) {
      console.error('❌ OAuth token exchange failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Save organization Gmail credentials (admin only)
  async saveOrgGmailCredentials(
    userId: string, 
    orgId: string, 
    credentials: {
      google_client_id: string;
      google_client_secret: string;
      redirect_uri?: string;
    }
  ) {
    try {
      // Verify user is admin of the organization
      const { data: userOrg, error: authError } = await supabase
        .from('user_organizations')
        .select('role')
        .eq('user_id', userId)
        .eq('org_id', orgId)
        .single();

      if (authError || !userOrg || userOrg.role !== 'admin') {
        throw new Error('User must be organization admin to configure Gmail credentials');
      }

      // Auto-generate redirect URI if not provided
      const redirectUri = credentials.redirect_uri || 
        `${process.env.PLATFORM_BASE_URL || 'http://localhost:5000'}/api/auth/gmail/callback`;

      // Save or update credentials
      const { data: savedCredentials, error: saveError } = await supabase
        .from('org_gmail_integrations')
        .upsert({
          org_id: orgId,
          google_client_id: credentials.google_client_id,
          google_client_secret: credentials.google_client_secret,
          redirect_uri: redirectUri,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (saveError) {
        throw new Error(`Failed to save Gmail credentials: ${saveError.message}`);
      }

      console.log(`✅ Gmail credentials saved for organization: ${orgId}`);
      return savedCredentials;

    } catch (error) {
      console.error('❌ Error saving org Gmail credentials:', error);
      throw error;
    }
  }

  // Get organization settings (for admin interface)
  async getOrgGmailSettings(userId: string, orgId: string) {
    try {
      // Verify user has access to organization
      const { data: userOrg, error: authError } = await supabase
        .from('user_organizations')
        .select('role')
        .eq('user_id', userId)
        .eq('org_id', orgId)
        .single();

      if (authError || !userOrg) {
        throw new Error('User does not have access to this organization');
      }

      // Get current Gmail integration settings
      const { data: settings, error: settingsError } = await supabase
        .from('org_gmail_integrations')
        .select('id, status, redirect_uri, created_at, updated_at')
        .eq('org_id', orgId)
        .single();

      return {
        has_credentials: !!settings,
        status: settings?.status || 'not_configured',
        redirect_uri: settings?.redirect_uri,
        last_updated: settings?.updated_at,
        user_role: userOrg.role
      };

    } catch (error) {
      console.error('❌ Error fetching org Gmail settings:', error);
      throw error;
    }
  }
}

export const orgGmailService = new OrganizationalGmailService();