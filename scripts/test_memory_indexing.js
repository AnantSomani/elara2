// Test script to check memory indexing and search
// Waits for memories to be indexed and tries different search queries

require('dotenv').config({ path: '.env.local' });

async function testMemoryIndexing() {
  console.log('🧪 Testing Memory Indexing and Search...\n');

  const apiKey = process.env.EXPO_PUBLIC_SUPERMEMORY_API_KEY;
  const baseUrl = 'https://api.supermemory.ai/v3';

  if (!apiKey) {
    console.log('❌ Supermemory API key not found');
    return;
  }

  console.log(`🔧 API Key: ${apiKey.substring(0, 20)}...`);
  console.log(`🔧 Base URL: ${baseUrl}\n`);

  try {
    // Step 1: Create a new memory with specific content
    console.log('1️⃣ Creating a new test memory...');
    
    const testMemory = {
      content: "Elara podcast app is testing Supermemory integration with specific keywords like artificial intelligence and machine learning.",
      metadata: {
        speaker_name: "Test Speaker",
        episode_id: "test-episode-indexing",
        podcast_title: "Test Podcast",
        timestamp: new Date().toISOString()
      },
      containerTags: ["elara", "podcast", "test", "indexing"]
    };

    const createResponse = await fetch(`${baseUrl}/memories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMemory),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Create failed: ${createResponse.status} - ${errorText}`);
    }

    const createResult = await createResponse.json();
    const memoryId = createResult.id;
    console.log(`✅ Memory created with ID: ${memoryId}\n`);

    // Step 2: Wait a bit for indexing
    console.log('2️⃣ Waiting for memory to be indexed...');
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    console.log('   ⏰ Waited 5 seconds for indexing\n');

    // Step 3: Try different search queries
    console.log('3️⃣ Testing different search queries...');
    
    const searchQueries = [
      'elara',
      'podcast',
      'artificial intelligence',
      'machine learning',
      'test',
      'integration',
      'supermemory',
      'speaker',
      'episode'
    ];

    for (const query of searchQueries) {
      try {
        console.log(`   Searching for: "${query}"`);
        
        const searchResponse = await fetch(`${baseUrl}/search?q=${encodeURIComponent(query)}&limit=10`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });
        
        if (searchResponse.ok) {
          const searchResult = await searchResponse.json();
          const results = searchResult.results || [];
          console.log(`     ✅ Found ${results.length} results`);
          
          if (results.length > 0) {
            console.log(`     📝 Sample result: "${results[0].content?.substring(0, 100)}..."`);
            
            // Check if our memory is in the results
            const ourMemory = results.find(r => r.id === memoryId);
            if (ourMemory) {
              console.log(`     🎯 Found our memory in results!`);
            }
          }
        } else {
          const errorText = await searchResponse.text();
          console.log(`     ❌ Error: ${errorText}`);
        }
      } catch (error) {
        console.log(`     ❌ Exception: ${error.message}`);
      }
    }

    console.log('');

    // Step 4: Check memory status
    console.log('4️⃣ Checking memory status...');
    
    try {
      const statusResponse = await fetch(`${baseUrl}/memories/${memoryId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      if (statusResponse.ok) {
        const statusResult = await statusResponse.json();
        console.log(`   ✅ Memory status: ${statusResult.status}`);
        console.log(`   📝 Content: "${statusResult.content?.substring(0, 100)}..."`);
        console.log(`   🏷️  Tags: ${statusResult.metadata?.containerTags?.join(', ') || 'None'}`);
      } else {
        const errorText = await statusResponse.text();
        console.log(`   ❌ Status error: ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ Status exception: ${error.message}`);
    }

    console.log('');

    // Step 5: Try searching with container tags
    console.log('5️⃣ Testing search with container tags...');
    
    try {
      const tagSearchResponse = await fetch(`${baseUrl}/search?q=test&containerTags=elara&containerTags=podcast&limit=10`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      if (tagSearchResponse.ok) {
        const tagSearchResult = await tagSearchResponse.json();
        const results = tagSearchResult.results || [];
        console.log(`   ✅ Found ${results.length} results with container tags`);
        
        if (results.length > 0) {
          console.log(`   📝 Sample result: "${results[0].content?.substring(0, 100)}..."`);
        }
      } else {
        const errorText = await tagSearchResponse.text();
        console.log(`   ❌ Tag search error: ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ Tag search exception: ${error.message}`);
    }

    console.log('\n🎉 Memory indexing test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testMemoryIndexing();
}

module.exports = {
  testMemoryIndexing,
}; 