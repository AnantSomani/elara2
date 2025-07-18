// Test script for Supermemory integration
// Validates sync process and API functionality

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://gmpstywacrtepveqfart.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcHN0eXdhY3J0ZXB2ZXFmYXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI5NzAsImV4cCI6MjA1MTI0ODk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple Supermemory client for testing
class TestSupermemoryClient {
  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_SUPERMEMORY_API_KEY;
    this.baseUrl = process.env.EXPO_PUBLIC_SUPERMEMORY_BASE_URL || 'https://api.supermemory.ai/v1';
    
    console.log('🔧 Supermemory client initialized:');
    console.log(`   API Key: ${this.apiKey ? this.apiKey.substring(0, 20) + '...' : 'NOT FOUND'}`);
    console.log(`   Base URL: ${this.baseUrl}`);
  }

  async healthCheck() {
    try {
      console.log(`🔍 Checking health at: ${this.baseUrl}/health`);
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      
      console.log(`   Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`   Error response: ${errorText}`);
      }
      
      return response.ok;
    } catch (error) {
      console.error('   Health check failed:', error.message);
      return false;
    }
  }

  async searchMemories(query, options = {}) {
    try {
      const params = new URLSearchParams({
        query: query,
        limit: (options.limit || 10).toString(),
        threshold: (options.threshold || 0.7).toString(),
      });

      const searchUrl = `${this.baseUrl}/memories/search?${params}`;
      console.log(`🔍 Searching at: ${searchUrl}`);

      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      console.log(`   Search response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`   Error response: ${errorText}`);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`   Search result: ${JSON.stringify(result, null, 2)}`);
      return result.memories || [];
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  async createMemory(memory) {
    try {
      console.log(`📝 Creating memory at: ${this.baseUrl}/memories`);
      console.log(`   Memory data: ${JSON.stringify(memory, null, 2)}`);
      
      const response = await fetch(`${this.baseUrl}/memories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memory),
      });

      console.log(`   Create response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`   Error response: ${errorText}`);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`   Create result: ${JSON.stringify(result, null, 2)}`);
      return result.id;
    } catch (error) {
      console.error('Create memory failed:', error);
      throw error;
    }
  }
}

async function testSupermemorySync() {
  console.log('🧪 Testing Supermemory Integration...\n');

  try {
    // Initialize Supermemory client
    console.log('1️⃣ Initializing Supermemory client...');
    const supermemoryClient = new TestSupermemoryClient();
    
    if (!supermemoryClient.apiKey) {
      console.log('❌ Supermemory API key not found');
      console.log('   Please check your .env.local file');
      return;
    }
    
    console.log('✅ Supermemory client initialized\n');

    // Test 2: Database connection and functions
    console.log('2️⃣ Testing database functions...');
    
    // Test get_unsynced_segments function
    const { data: unsyncedSegments, error: segmentsError } = await supabase
      .rpc('get_unsynced_segments', { limit_count: 5 });
    
    if (segmentsError) {
      console.log('❌ Database function test failed:', segmentsError.message);
      console.log('   This might mean the migration hasn\'t been applied yet');
      return;
    }
    
    console.log(`✅ Found ${unsyncedSegments?.length || 0} unsynced segments\n`);

    // Test 3: Search functionality
    console.log('3️⃣ Testing search functionality...');
    
    try {
      const searchResults = await supermemoryClient.searchMemories('test query', {
        limit: 3,
        threshold: 0.5,
      });
      
      console.log(`✅ Search test successful - found ${searchResults.length} results`);
      
      if (searchResults.length > 0) {
        console.log('   Sample result:', {
          id: searchResults[0].id,
          content: searchResults[0].content?.substring(0, 100) + '...',
          score: searchResults[0].score,
        });
      }
    } catch (error) {
      console.log('❌ Search test failed:', error.message);
    }

    // Test 4: Create memory functionality
    console.log('4️⃣ Testing create memory functionality...');
    
    try {
      const testMemory = {
        content: 'This is a test memory for Elara podcast app integration',
        metadata: {
          speaker_name: 'Test Speaker',
          timestamp: new Date().toISOString(),
          episode_id: 'test-episode-123',
          podcast_title: 'Test Podcast',
          elara_segment_id: 'test-segment-456',
        },
      };
      
      const memoryId = await supermemoryClient.createMemory(testMemory);
      console.log(`✅ Memory created successfully with ID: ${memoryId}`);
    } catch (error) {
      console.log('❌ Create memory test failed:', error.message);
    }

    // Test 5: Check database schema
    console.log('5️⃣ Testing database schema...');
    
    try {
      const { data: columns, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'transcript_segments')
        .in('column_name', ['supermemory_id', 'synced_at', 'sync_status']);
      
      if (schemaError) {
        console.log('❌ Schema check failed:', schemaError.message);
      } else {
        const expectedColumns = ['supermemory_id', 'synced_at', 'sync_status'];
        const foundColumns = columns.map(c => c.column_name);
        const missingColumns = expectedColumns.filter(col => !foundColumns.includes(col));
        
        if (missingColumns.length === 0) {
          console.log('✅ All Supermemory columns found in database');
        } else {
          console.log('❌ Missing columns:', missingColumns);
          console.log('   Please run the migration: database/migration-006-supermemory-integration.sql');
        }
      }
    } catch (error) {
      console.log('❌ Schema check failed:', error.message);
    }

    console.log('\n🎉 Supermemory integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test specific episode sync
async function testEpisodeSync(episodeId) {
  console.log(`🧪 Testing episode sync for: ${episodeId}\n`);
  
  try {
    // Check if episode exists
    const { data: episode, error: episodeError } = await supabase
      .from('episodes')
      .select('id, title')
      .eq('id', episodeId)
      .single();
    
    if (episodeError || !episode) {
      console.log('❌ Episode not found:', episodeId);
      return;
    }
    
    console.log(`✅ Found episode: ${episode.title}`);
    
    // Check segments for this episode
    const { data: segments, error: segmentsError } = await supabase
      .from('transcript_segments')
      .select('id, content, sync_status')
      .eq('episode_id', episodeId)
      .limit(5);
    
    if (segmentsError) {
      console.log('❌ Failed to fetch segments:', segmentsError.message);
      return;
    }
    
    console.log(`✅ Found ${segments?.length || 0} segments for episode`);
    
    if (segments && segments.length > 0) {
      console.log('   Sample segment:', {
        id: segments[0].id,
        content: segments[0].content?.substring(0, 100) + '...',
        sync_status: segments[0].sync_status,
      });
    }
    
  } catch (error) {
    console.error('❌ Episode sync test failed:', error);
  }
}

// Run tests
if (require.main === module) {
  testSupermemorySync();
}

module.exports = {
  testSupermemorySync,
  testEpisodeSync,
}; 