/**
 * Simple script to create a sample creator for testing the detail view
 */

// Direct approach using raw SQL with ES modules
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Creating sample creator with rich profile data...');
    
    // Create a JSON object with rich creator data
    const creatorData = {
      name: "Sophia Lee",
      role: "Content Creator & Lifestyle Influencer",
      bio: "Lifestyle content creator specializing in travel, fashion, and sustainable living. With over 5 years of experience creating engaging content across multiple platforms, I connect authentically with audiences through storytelling and high-quality visuals.",
      brandVoice: "Warm, authentic, and approachable with a focus on sustainability and ethical consumption. I balance aspirational content with practical advice, always speaking with honesty and transparency.",
      profileColor: "#3B82F6",
      initials: "SL",
      googleDriveFolder: "https://drive.google.com/folder/sophia-lee-portfolio",
      pillarUrl: "https://instagram.com/sophialee",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop",
      audienceData: JSON.stringify({
        demographics: {
          ageGroups: {
            "18-24": 22,
            "25-34": 45,
            "35-44": 18,
            "45+": 15
          },
          genderSplit: {
            female: 68,
            male: 30,
            other: 2
          },
          topLocations: ["United States", "United Kingdom", "Canada", "Australia", "Germany"]
        },
        interests: ["Travel", "Sustainable Living", "Fashion", "Wellness", "Photography"]
      }),
      platformStats: JSON.stringify({
        instagram: {
          followers: 128500,
          engagement: 3.8,
          averageLikes: 4850,
          averageComments: 235
        },
        youtube: {
          subscribers: 75200,
          averageViews: 28500,
          engagement: 4.2
        },
        tiktok: {
          followers: 210000,
          averageViews: 45000,
          engagement: 5.1
        },
        performance: {
          reachGrowth: "+15% in last 3 months",
          conversionRate: "3.2% for brand partnerships",
          audienceRetention: "78% on YouTube videos"
        }
      }),
      expertiseAndNiche: JSON.stringify({
        primaryCategories: ["Lifestyle", "Travel", "Sustainable Fashion"],
        secondaryCategories: ["Beauty", "Home Decor", "Wellness"],
        expertise: ["Visual Storytelling", "Destination Marketing", "Eco-Friendly Product Reviews"]
      }),
      collaborationInfo: JSON.stringify({
        pastCollaborations: {
          brands: ["Patagonia", "Away Luggage", "Glossier", "Airbnb", "Lululemon"],
          campaigns: ["Summer Travel Series", "Sustainable Fashion Guide", "Home Office Makeover"]
        },
        opportunities: {
          preferredDeals: ["Long-term Ambassadorships", "Content Series", "Travel Partnerships"],
          availableFor: ["Product Reviews", "Destination Features", "Social Media Takeovers"]
        },
        rates: {
          instagram: "$2,500 per post",
          youtube: "$5,000 per video",
          bundle: "$8,000 for multi-platform campaign"
        }
      }),
      socialLinks: JSON.stringify({
        instagram: "https://instagram.com/sophialee",
        youtube: "https://youtube.com/sophialee",
        tiktok: "https://tiktok.com/@sophialee",
        website: "https://sophialeecreative.com",
        pinterest: "https://pinterest.com/sophialee"
      }),
      metaData: JSON.stringify({
        joinedDate: "2023-01-15",
        lastUpdated: new Date().toISOString(),
        verificationStatus: "Verified",
        preferredContactMethod: "Email"
      })
    };

    // Check if creator already exists
    const checkResult = await pool.query(
      'SELECT id FROM creators WHERE name = $1',
      [creatorData.name]
    );

    let creatorId;
    
    if (checkResult.rows.length > 0) {
      // Update existing creator
      creatorId = checkResult.rows[0].id;
      console.log(`Updating existing creator with ID ${creatorId}`);
      
      const updateFields = Object.keys(creatorData).map((key, index) => 
        `"${key}" = $${index + 1}`
      ).join(', ');
      
      await pool.query(
        `UPDATE creators SET ${updateFields} WHERE id = $${Object.keys(creatorData).length + 1}`,
        [...Object.values(creatorData), creatorId]
      );
    } else {
      // Insert new creator
      const fields = Object.keys(creatorData).map(key => `"${key}"`).join(', ');
      const placeholders = Object.keys(creatorData).map((_, index) => `$${index + 1}`).join(', ');
      
      const result = await pool.query(
        `INSERT INTO creators (${fields}) VALUES (${placeholders}) RETURNING id`,
        Object.values(creatorData)
      );
      
      creatorId = result.rows[0].id;
    }
    
    console.log(`Sample creator created/updated with ID: ${creatorId}`);
    
    // Create a sample email account for this creator
    const emailAccount = {
      name: "Sophia's Gmail",
      email: "sophia@example.com",
      provider: "gmail",
      status: "active",
      userId: 1, // Assuming user ID 1 exists
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      smtpUsername: "sophia@example.com",
      smtpPassword: "password123",
      smtpSecure: false
    };
    
    // Check if email account already exists
    const emailCheckResult = await pool.query(
      'SELECT id FROM email_accounts WHERE email = $1',
      [emailAccount.email]
    );
    
    let emailAccountId;
    
    if (emailCheckResult.rows.length > 0) {
      emailAccountId = emailCheckResult.rows[0].id;
      console.log(`Email account already exists with ID ${emailAccountId}`);
    } else {
      // Insert new email account
      const fields = Object.keys(emailAccount).map(key => `"${key}"`).join(', ');
      const placeholders = Object.keys(emailAccount).map((_, index) => `$${index + 1}`).join(', ');
      
      const result = await pool.query(
        `INSERT INTO email_accounts (${fields}) VALUES (${placeholders}) RETURNING id`,
        Object.values(emailAccount)
      );
      
      emailAccountId = result.rows[0].id;
      console.log(`Created email account with ID: ${emailAccountId}`);
    }
    
    // Link creator to email account if not already linked
    const linkCheckResult = await pool.query(
      'SELECT * FROM creator_email_accounts WHERE creator_id = $1 AND email_account_id = $2',
      [creatorId, emailAccountId]
    );
    
    if (linkCheckResult.rows.length === 0) {
      await pool.query(
        'INSERT INTO creator_email_accounts (creator_id, email_account_id, is_primary) VALUES ($1, $2, $3)',
        [creatorId, emailAccountId, true]
      );
      console.log(`Linked creator ${creatorId} to email account ${emailAccountId}`);
    } else {
      console.log(`Creator already linked to email account`);
    }
    
    console.log('Sample creator setup complete!');
  } catch (error) {
    console.error('Error creating sample creator:', error);
  } finally {
    await pool.end();
  }
}

run();