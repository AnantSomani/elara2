const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Make sure EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentSchema() {
  try {
    console.log('🔍 Checking current episodes table structure...');
    
    // Get episodes table columns
    const { data: episodesColumns, error: episodesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'episodes' 
          ORDER BY ordinal_position;
        `
      });
    
    if (episodesError) {
      console.error('❌ Error checking episodes table:', episodesError);
      return;
    }
    
    console.log('\n📊 Current episodes table columns:');
    console.log('----------------------------------------');
    episodesColumns.forEach(col => {
      console.log(`${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Get transcript_segments table columns
    const { data: segmentsColumns, error: segmentsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'transcript_segments' 
          ORDER BY ordinal_position;
        `
      });
    
    if (segmentsError) {
      console.error('❌ Error checking transcript_segments table:', segmentsError);
      return;
    }
    
    console.log('\n📊 Current transcript_segments table columns:');
    console.log('----------------------------------------');
    segmentsColumns.forEach(col => {
      console.log(`${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check for existing data
    const { data: episodeCount, error: countError } = await supabase
      .rpc('exec_sql', {
        sql: 'SELECT COUNT(*) as count FROM episodes;'
      });
    
    if (countError) {
      console.error('❌ Error counting episodes:', countError);
      return;
    }
    
    console.log(`\n📈 Current data: ${episodeCount[0].count} episodes`);
    
    // Show sample episode data
    const { data: sampleData, error: sampleError } = await supabase
      .rpc('exec_sql', {
        sql: 'SELECT id, title, processing_status FROM episodes LIMIT 3;'
      });
    
    if (sampleError) {
      console.error('❌ Error getting sample data:', sampleError);
      return;
    }
    
    if (sampleData.length > 0) {
      console.log('\n📋 Sample episodes:');
      console.log('----------------------------------------');
      sampleData.forEach(episode => {
        console.log(`ID: ${episode.id} | Title: ${episode.title} | Status: ${episode.processing_status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

if (require.main === module) {
  checkCurrentSchema();
} 