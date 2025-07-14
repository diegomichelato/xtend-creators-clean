/**
 * Add Creators for Proposal System
 * 
 * This script adds creators directly to the database using direct SQL queries
 * It's designed to work with or without the ORM for resilience
 */

// Import required packages
import pg from 'pg';
const { Pool } = pg;

// Create database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function addCreators() {
  console.log('Starting to add creators...');
  
  const client = await pool.connect();
  try {
    // First check if creators table exists
    const tablesExist = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'creators'
      );
    `);
    
    // Create tables if they don't exist
    if (!tablesExist.rows[0].exists) {
      console.log('Creating creators tables...');
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS creators (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          role TEXT,
          bio TEXT,
          brand_voice TEXT,
          google_drive_folder TEXT,
          pillar_url TEXT,
          profile_color TEXT,
          initials TEXT,
          user_id INTEGER,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS creator_pricing (
          id SERIAL PRIMARY KEY,
          creator_id INTEGER REFERENCES creators(id) ON DELETE CASCADE,
          content_type TEXT NOT NULL,
          format TEXT NOT NULL,
          base_price DECIMAL(10, 2) NOT NULL,
          usage_rights TEXT,
          revision_limit INTEGER,
          delivery_timeframe INTEGER,
          description TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
    }
    
    // Check if creators already exist
    const creatorsExist = await client.query(`
      SELECT COUNT(*) FROM creators;
    `);
    
    if (parseInt(creatorsExist.rows[0].count) > 0) {
      console.log(`${creatorsExist.rows[0].count} creators already exist. Skipping creation.`);
    } else {
      console.log('Adding Patrick Israel...');
      
      // Add Patrick Israel
      const patrickResult = await client.query(`
        INSERT INTO creators (
          name, role, bio, brand_voice, profile_color, initials, user_id
        ) VALUES (
          'Patrick Israel',
          'Finance Content Creator',
          'Patrick Israel is a leading finance content creator with over 500,000 subscribers across platforms. He specializes in creating educational content about personal finance, cryptocurrency, and stock market investing that breaks down complex topics into easy-to-understand videos. His unique approach combines data-driven analysis with relatable examples that connect with audiences of all knowledge levels.',
          'Patrick''s brand voice is authoritative but approachable, using clear language to explain complex financial concepts. He maintains professionalism while incorporating light humor to make finance accessible. His content is factual and accurate, with a confident tone that builds trust with his audience of aspiring investors and financial enthusiasts.',
          '#4F46E5',
          'PI',
          1
        ) RETURNING id;
      `);
      
      const patrickId = patrickResult.rows[0].id;
      console.log(`Created Patrick Israel with ID: ${patrickId}`);
      
      // Add pricing options for Patrick
      await client.query(`
        INSERT INTO creator_pricing (
          creator_id, content_type, format, base_price, usage_rights, revision_limit, delivery_timeframe, description
        ) VALUES
        (
          $1, 
          'Sponsored Video', 
          'YouTube', 
          2500.00, 
          '60 days digital usage', 
          2, 
          14,
          'Full dedicated video about your product or service, including in-depth features and benefits coverage'
        ),
        (
          $1, 
          'Integration', 
          'Instagram', 
          1200.00, 
          '30 days social media usage', 
          1, 
          7,
          'Natural mention of your product within my regular content, demonstrating its value in context'
        ),
        (
          $1, 
          'Tutorial', 
          'TikTok', 
          1800.00, 
          '45 days all platform usage', 
          3, 
          10,
          'Step-by-step guide showing viewers how to use your product effectively with authentic results'
        );
      `, [patrickId]);
      
      console.log('Added pricing options for Patrick');
      
      // Add Alex Rodriguez
      console.log('Adding Alex Rodriguez...');
      
      const alexResult = await client.query(`
        INSERT INTO creators (
          name, role, bio, brand_voice, profile_color, initials, user_id
        ) VALUES (
          'Alex Rodriguez',
          'Tech & Gadget Reviewer',
          'Alex Rodriguez is a tech enthusiast and gadget reviewer with a growing audience of tech-savvy followers. He specializes in honest, thorough reviews of the latest smartphones, laptops, and smart home devices. With a background in computer science, Alex provides both technical insights and practical observations about how tech products perform in real-world scenarios.',
          'Alex''s brand voice is knowledgeable yet casual, blending technical accuracy with conversational language. He''s straightforward and honest in his assessments, never hesitating to point out both strengths and weaknesses of products. His style connects with both tech beginners and professionals seeking detailed analysis before making purchase decisions.',
          '#10B981',
          'AR',
          1
        ) RETURNING id;
      `);
      
      const alexId = alexResult.rows[0].id;
      console.log(`Created Alex Rodriguez with ID: ${alexId}`);
      
      // Add pricing options for Alex
      await client.query(`
        INSERT INTO creator_pricing (
          creator_id, content_type, format, base_price, usage_rights, revision_limit, delivery_timeframe, description
        ) VALUES
        (
          $1, 
          'Product Review', 
          'YouTube', 
          1800.00, 
          '60 days digital usage', 
          2, 
          10,
          'Comprehensive review of your tech product with detailed testing and comparison to competitors'
        ),
        (
          $1, 
          'Unboxing', 
          'Instagram_Reels', 
          900.00, 
          '30 days social media usage', 
          1, 
          5,
          'First impressions and unboxing experience of your product with authentic reactions'
        ),
        (
          $1, 
          'Tech Tutorial', 
          'YouTube_Shorts', 
          1200.00, 
          '45 days all platform usage', 
          2, 
          7,
          'Quick tutorial showing key features and functionality of your tech product'
        );
      `, [alexId]);
      
      console.log('Added pricing options for Alex');
    }
    
    console.log('Creator setup complete!');
  } catch (error) {
    console.error('Error adding creators:', error);
  } finally {
    client.release();
  }
}

// Run the function
addCreators().catch(console.error);