// Script to wait for memory indexing and test search
// Polls memory status until indexing is complete

require('dotenv').config({ path: '.env.local' });

async function waitForIndexing() {
  console.log('⏳ Waiting for Memory Indexing to Complete...\n');

  const apiKey = process.env.EXPO_PUBLIC_SUPERMEMORY_API_KEY;
  const baseUrl = 'https://api.supermemory.ai/v3';

  if (!apiKey) {
    console.log('❌ Supermemory API key not found');
    return;
  }

  console.log(`🔧 API Key: ${apiKey.substring(0, 20)}...`);
  console.log(`🔧 Base URL: ${baseUrl}\n`);

  try {
    // Step 1: Create a test memory
    console.log('1️⃣ Creating a test memory...');
    
    const testMemory = {
      content: "Elara podcast app is testing Supermemory integration with specific keywords like artificial intelligence and machine learning.",
      metadata: {
        speaker_name: "Test Speaker",
        episode_id: "test-episode-wait",
        podcast_title: "Test Podcast",
        timestamp: new Date().toISOString()
      },
      containerTags: ["elara", "podcast", "test", "wait"]
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

    // Step 2: Wait for indexing to complete
    console.log('2️⃣ Waiting for indexing to complete...');
    
    let attempts = 0;
    const maxAttempts = 30; // Wait up to 5 minutes (30 * 10 seconds)
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`   Attempt ${attempts}/${maxAttempts}: Checking status...`);
      
      try {
        const statusResponse = await fetch(`${baseUrl}/memories/${memoryId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });
        
        if (statusResponse.ok) {
          const statusResult = await statusResponse.json();
          console.log(`   📊 Status: ${statusResult.status}`);
          
          if (statusResult.status === 'done') {
            console.log('   ✅ Indexing completed!');
            break;
          } else if (statusResult.status === 'failed') {
            console.log('   ❌ Indexing failed!');
            return;
          } else {
            console.log(`   ⏳ Still indexing... (${statusResult.status})`);
          }
        } else {
          console.log(`   ❌ Status check failed: ${statusResponse.status}`);
        }
      } catch (error) {
        console.log(`   ❌ Status check error: ${error.message}`);
      }
      
      // Wait 10 seconds before next check
      if (attempts < maxAttempts) {
        console.log('   ⏰ Waiting 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
    
    if (attempts >= maxAttempts) {
      console.log('   ⚠️ Timeout waiting for indexing');
      return;
    }

    console.log('');

    // Step 3: Test search now that indexing is complete
    console.log('3️⃣ Testing search after indexing...');
    
    const searchQueries = [
      'elara',
      'podcast',
      'artificial intelligence',
      'machine learning',
      'test',
      'integration'
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
              console.log(`     📊 Score: ${ourMemory.score || 'N/A'}`);
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

    console.log('\n🎉 Indexing and search test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  waitForIndexing();
}

module.exports = {
  waitForIndexing,
}; 