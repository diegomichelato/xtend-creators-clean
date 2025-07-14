const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createChangelogTable() {
  console.log('Creating changelog table in Supabase...');
  
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS changelog (
        id SERIAL PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        user_id VARCHAR(255),
        timestamp TIMESTAMP DEFAULT NOW(),
        metadata JSONB
      );
    `
  });

  if (error) {
    console.error('Error creating changelog table:', error);
  } else {
    console.log('Changelog table created successfully in Supabase');
  }
}

createChangelogTable();
