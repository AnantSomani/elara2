// Test script for Supermemory search functionality only
// Based on https://supermemory.ai/docs/memory-api/searching/searching-memories

require('dotenv').config({ path: '.env.local' });

async function testSearchOnly() {
  console.log('🔍 Testing Supermemory Search Functionality...\n');

  const apiKey = process.env.EXPO_PUBLIC_SUPERMEMORY_API_KEY;
  const baseUrl = 'https://api.supermemory.ai/v3';

  if (!apiKey) {
    console.log('❌ Supermemory API key not found');
    return;
  }

  console.log(`🔧 API Key: ${apiKey.substring(0, 20)}...`);
  console.log(`🔧 Base URL: ${baseUrl}\n`);

  try {
    // Test 1: Basic search with different queries
    console.log('1️⃣ Testing basic search queries...');
    
    const searchQueries = [
      'elara',
      'podcast',
      'test',
      'memory',
      'artificial intelligence',
      'machine learning',
      'integration',
      'speaker',
      'episode'
    ];

    for (const query of searchQueries) {
      try {
        console.log(`   Searching for: "${query}"`);
        
        const searchResponse = await fetch(`${baseUrl}/search?q=${encodeURIComponent(query)}&limit=5`, {
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
            console.log(`     📝 Sample result: "${results[0].chunks?.[0]?.content?.substring(0, 100) || results[0].content?.substring(0, 100)}..."`);
            console.log(`     📊 Document score: ${results[0].score || 'N/A'}`);
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

    // Test 2: Search with different parameters
    console.log('2️⃣ Testing search with different parameters...');
    
    const searchTests = [
      { name: 'High threshold', params: 'q=test&documentThreshold=0.8&limit=3' },
      { name: 'Low threshold', params: 'q=test&documentThreshold=0.3&limit=10' },
      { name: 'Only matching chunks', params: 'q=test&onlyMatchingChunks=true&limit=5' },
      { name: 'With timing', params: 'q=test&limit=5' }
    ];

    for (const test of searchTests) {
      try {
        console.log(`   Testing: ${test.name}`);
        
        const searchResponse = await fetch(`${baseUrl}/search?${test.params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });
        
        if (searchResponse.ok) {
          const searchResult = await searchResponse.json();
          const results = searchResult.results || [];
          console.log(`     ✅ Found ${results.length} results`);
          
          if (searchResult.timing) {
            console.log(`     ⏱️  Search time: ${searchResult.timing}ms`);
          }
          
          if (results.length > 0) {
            console.log(`     📊 Average score: ${(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length).toFixed(3)}`);
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

    // Test 3: Search with container tags (if we have any)
    console.log('3️⃣ Testing search with container tags...');
    
    const tagQueries = [
      'containerTags=elara',
      'containerTags=podcast',
      'containerTags=test',
      'q=test&containerTags=elara',
      'q=test&containerTags=podcast'
    ];

    for (const tagQuery of tagQueries) {
      try {
        console.log(`   Testing: ${tagQuery}`);
        
        const searchResponse = await fetch(`${baseUrl}/search?${tagQuery}&limit=5`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });
        
        if (searchResponse.ok) {
          const searchResult = await searchResponse.json();
          const results = searchResult.results || [];
          console.log(`     ✅ Found ${results.length} results`);
        } else {
          const errorText = await searchResponse.text();
          console.log(`     ❌ Error: ${errorText}`);
        }
      } catch (error) {
        console.log(`     ❌ Exception: ${error.message}`);
      }
    }

    console.log('');

    // Test 4: Check response structure
    console.log('4️⃣ Analyzing response structure...');
    
    try {
      const searchResponse = await fetch(`${baseUrl}/search?q=test&limit=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      if (searchResponse.ok) {
        const searchResult = await searchResponse.json();
        console.log(`   📋 Response keys: ${Object.keys(searchResult).join(', ')}`);
        
        if (searchResult.results && searchResult.results.length > 0) {
          const firstResult = searchResult.results[0];
          console.log(`   📋 Result keys: ${Object.keys(firstResult).join(', ')}`);
          
          if (firstResult.chunks && firstResult.chunks.length > 0) {
            const firstChunk = firstResult.chunks[0];
            console.log(`   📋 Chunk keys: ${Object.keys(firstChunk).join(', ')}`);
          }
        }
        
        console.log(`   📊 Total results: ${searchResult.total || 'N/A'}`);
        console.log(`   ⏱️  Timing: ${searchResult.timing || 'N/A'}ms`);
      } else {
        const errorText = await searchResponse.text();
        console.log(`   ❌ Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
    }

    console.log('\n🎉 Search functionality test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testSearchOnly();
}

module.exports = {
  testSearchOnly,
}; 