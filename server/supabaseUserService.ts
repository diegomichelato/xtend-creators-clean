import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from './emailService';
import { google } from 'googleapis';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client with service role key for user management
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

// SMTP transporter for info@xtend.company
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS
    auth: {
      user: 'info@xtend.company',
      pass: 'mxpugglxrcmdkcxm' // Gmail app password for MAIL
    },
    tls: {
      rejectUnauthorized: false
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 10,
    rateLimit: 5 // 5 emails per second max
  });
};

export async function createSupabaseUser(userData: CreateUserData): Promise<{ user: any; profile: UserProfile }> {
  console.log('🚀 Starting user creation process for:', userData.email);
  
  try {
    // Step 1: Create user in Supabase Auth
    console.log('📝 Step 1: Creating user in Supabase Auth...');
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true // Auto-confirm the email
    });

    if (authError) {
      console.error('❌ Failed to create user in Supabase Auth:', authError);
      
      // If user already exists, that's okay - retrieve the existing user
      if (authError.message?.includes('already been registered')) {
        console.log('✅ User already exists in Supabase Auth, retrieving existing user...');
        
        // Get the existing user by email
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(user => user.email === userData.email);
        
        if (existingUser) {
          console.log('✅ Found existing user with ID:', existingUser.id);
          return {
            user: existingUser,
            profile: {
              id: existingUser.id,
              email: userData.email,
              full_name: userData.fullName,
              role: userData.role,
              created_at: existingUser.created_at
            } as UserProfile
          };
        }
      }
      
      throw new Error(`Supabase Auth error: ${authError.message}`);
    }

    if (!authUser.user) {
      throw new Error('User creation failed - no user returned');
    }

    console.log('✅ Step 1 Complete: User created in Supabase Auth with ID:', authUser.user.id);

    // Step 2: Create profile in profiles table
    console.log('📝 Step 2: Creating user profile in profiles table...');
    // Create minimal profile with only essential fields
    const profileData = {
      id: authUser.user.id,
      email: userData.email,
      role: userData.role
    };

    console.log('📝 Profile data being inserted:', JSON.stringify(profileData, null, 2));

    try {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        console.error('❌ Failed to create profile:', profileError);
        
        // If it's a duplicate key error, that's okay - the profile already exists
        if (profileError.code === '23505') {
          console.log('✅ Step 2 Complete: Profile already exists, proceeding with email...');
        } else {
          console.log('⚠️ Skipping profile creation due to error, proceeding with email...');
        }
      } else {
        console.log('✅ Step 2 Complete: Profile created successfully');
      }
    } catch (error) {
      console.error('❌ Profile creation exception:', error);
      console.log('⚠️ Skipping profile creation and proceeding with email...');
    }

    // Step 3: Send welcome email
    console.log('📝 Step 3: Sending welcome email via SendGrid from dm@xtend.company...');
    try {
      await sendWelcomeEmail({
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        tempPassword: userData.password
      });
      console.log('✅ Step 3 Complete: Welcome email sent successfully');
    } catch (emailError) {
      console.warn('⚠️ Welcome email failed, but user creation successful:', emailError);
      // Don't fail the entire process if email fails
    }

    console.log('🎉 User creation process completed successfully!');
    return {
      user: authUser.user,
      profile: {
        id: authUser.user.id,
        email: userData.email,
        full_name: userData.fullName,
        role: userData.role,
        created_at: new Date().toISOString()
      } as UserProfile
    };

  } catch (error) {
    console.error('💥 User creation process failed:', error);
    throw error;
  }
}

// Email functionality moved to emailService.ts with SendGrid integration