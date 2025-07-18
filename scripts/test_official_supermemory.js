// Test script using official Supermemory API v3 structure
// Based on examples from https://supermemory.ai/docs/memory-api/creation/adding-memories

require('dotenv').config({ path: '.env.local' });

// Simple test using the official API v3 structure
async function testOfficialSupermemory() {
  console.log('🧪 Testing Official Supermemory API v3...\n');

  const apiKey = process.env.EXPO_PUBLIC_SUPERMEMORY_API_KEY;
  const baseUrl = 'https://api.supermemory.ai/v3';

  if (!apiKey) {
    console.log('❌ Supermemory API key not found in EXPO_PUBLIC_SUPERMEMORY_API_KEY');
    return;
  }

  console.log('🔧 Using official Supermemory API v3 structure');
  console.log(`   API Key: ${apiKey.substring(0, 20)}...`);
  console.log(`   Base URL: ${baseUrl}\n`);

  try {
    // Test 0: Check available endpoints
    console.log('0️⃣ Checking available endpoints...');
    
    const endpoints = [
      '/health',
      '/memories',
      '/memories/search'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });
        console.log(`   ${endpoint}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`   ${endpoint}: Error - ${error.message}`);
      }
    }
    console.log('');

    // Test 1: Create a memory using official v3 structure
    console.log('1️⃣ Creating memory with official API v3 structure...');
    
    const memoryData = {
      content: "This is the content of my first memory for Elara podcast app.",
      metadata: {
        speaker_name: "Test Speaker",
        episode_id: "test-episode-123",
        podcast_title: "Test Podcast",
        timestamp: new Date().toISOString()
      },
      containerTags: ["elara", "podcast", "test"]
    };

    console.log('   Memory data:', JSON.stringify(memoryData, null, 2));

    const createResponse = await fetch(`${baseUrl}/memories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memoryData),
    });

    console.log(`   Create response status: ${createResponse.status} ${createResponse.statusText}`);

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.log(`   Error response: ${errorText}`);
      throw new Error(`Create failed: ${createResponse.status} - ${errorText}`);
    }

    const createResult = await createResponse.json();
    console.log(`   ✅ Memory created with ID: ${createResult.id}\n`);

    // Test 2: Search memories using v3 structure
    console.log('2️⃣ Searching memories with v3 API...');
    
    const searchResponse = await fetch(`${baseUrl}/search?q=podcast&documentThreshold=0.5&limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    console.log(`   Search response status: ${searchResponse.status} ${searchResponse.statusText}`);

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.log(`   Error response: ${errorText}`);
      throw new Error(`Search failed: ${searchResponse.status} - ${errorText}`);
    }

    const searchResult = await searchResponse.json();
    console.log(`   ✅ Found ${searchResult.results?.length || 0} memories`);
    
    if (searchResult.results && searchResult.results.length > 0) {
      console.log('   Sample memory:', {
        id: searchResult.results[0].id,
        content: searchResult.results[0].content?.substring(0, 100) + '...',
        metadata: searchResult.results[0].metadata
      });
    }

    // Test 3: Get memory status
    console.log('3️⃣ Getting memory status...');
    
    const statusResponse = await fetch(`${baseUrl}/memories/${createResult.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    console.log(`   Status response: ${statusResponse.status} ${statusResponse.statusText}`);

    if (statusResponse.ok) {
      const statusResult = await statusResponse.json();
      console.log('   ✅ Memory status:', {
        id: statusResult.id,
        status: statusResult.status,
        content: statusResult.content?.substring(0, 50) + '...'
      });
    }

    console.log('\n🎉 Official Supermemory API v3 test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testOfficialSupermemory();
}

module.exports = {
  testOfficialSupermemory,
}; 