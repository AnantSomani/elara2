const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role key for schema changes

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Make sure EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🔄 Running database migration for YouTube video IDs...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'migration-003-youtube-video-ids.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      return;
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('Database changes:');
    console.log('- episodes.id: UUID → TEXT (for YouTube video IDs)');
    console.log('- Added: thumbnail_url, channel_title, hosts columns');
    console.log('- Updated: transcript_segments.episode_id to TEXT');
    console.log('- Updated: helper function parameter type');
    console.log('');
    console.log('Your database is now ready for YouTube video ID-based episodes!');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
  }
}

// Alternative approach: Run migration SQL directly
async function runMigrationDirect() {
  try {
    console.log('🔄 Running database migration for YouTube video IDs...');
    
    const migrationPath = path.join(__dirname, '..', 'database', 'migration-003-youtube-video-ids.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          return;
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('Database changes:');
    console.log('- episodes.id: UUID → TEXT (for YouTube video IDs)');
    console.log('- Added: thumbnail_url, channel_title, hosts columns');
    console.log('- Updated: transcript_segments.episode_id to TEXT');
    console.log('- Updated: helper function parameter type');
    console.log('');
    console.log('Your database is now ready for YouTube video ID-based episodes!');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
  }
}

if (require.main === module) {
  runMigrationDirect();
} 