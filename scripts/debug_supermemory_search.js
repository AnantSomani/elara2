// Debug script for Supermemory search issues
// Tests different endpoints and parameters to identify the problem

require('dotenv').config({ path: '.env.local' });

async function debugSupermemorySearch() {
  console.log('🔍 Debugging Supermemory Search Issues...\n');

  const apiKey = process.env.EXPO_PUBLIC_SUPERMEMORY_API_KEY;
  const baseUrl = 'https://api.supermemory.ai/v3';

  if (!apiKey) {
    console.log('❌ Supermemory API key not found');
    return;
  }

  console.log(`🔧 API Key: ${apiKey.substring(0, 20)}...`);
  console.log(`🔧 Base URL: ${baseUrl}\n`);

  try {
    // Test 1: Check what endpoints are available
    console.log('1️⃣ Testing different search endpoints...');
    
    const searchEndpoints = [
      '/memories/search',
      '/search',
      '/memories',
      '/v3/memories/search',
      '/v3/search'
    ];

    for (const endpoint of searchEndpoints) {
      try {
        console.log(`   Testing: ${endpoint}`);
        
        const response = await fetch(`${baseUrl}${endpoint}?q=test`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });
        
        console.log(`     Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log(`     ✅ Success! Found ${result.memories?.length || 0} memories`);
          console.log(`     Response structure:`, Object.keys(result));
          break;
        } else {
          const errorText = await response.text();
          console.log(`     ❌ Error: ${errorText}`);
        }
      } catch (error) {
        console.log(`     ❌ Exception: ${error.message}`);
      }
    }

    console.log('');

    // Test 2: Try different search parameters
    console.log('2️⃣ Testing different search parameters...');
    
    const searchParams = [
      '?q=test',
      '?query=test',
      '?q=test&limit=5',
      '?q=test&documentThreshold=0.5',
      '?q=test&limit=5&documentThreshold=0.5',
      '?q=podcast',
      '?q=elara'
    ];

    for (const params of searchParams) {
      try {
        console.log(`   Testing: /memories/search${params}`);
        
        const response = await fetch(`${baseUrl}/memories/search${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });
        
        console.log(`     Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log(`     ✅ Success! Found ${result.memories?.length || 0} memories`);
          break;
        } else {
          const errorText = await response.text();
          console.log(`     ❌ Error: ${errorText}`);
        }
      } catch (error) {
        console.log(`     ❌ Exception: ${error.message}`);
      }
    }

    console.log('');

    // Test 3: Try POST search (some APIs use POST for search)
    console.log('3️⃣ Testing POST search...');
    
    try {
      const response = await fetch(`${baseUrl}/memories/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: 'test',
          limit: 5,
          documentThreshold: 0.5
        }),
      });
      
      console.log(`   POST search status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log(`   ✅ POST search success! Found ${result.memories?.length || 0} memories`);
      } else {
        const errorText = await response.text();
        console.log(`   ❌ POST search error: ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ POST search exception: ${error.message}`);
    }

    console.log('');

    // Test 4: Check memory status to see if they're indexed
    console.log('4️⃣ Checking memory status...');
    
    try {
      // Try to get a specific memory we created earlier
      const response = await fetch(`${baseUrl}/memories/ktBs1dcmxnzbZxnv6D9JiX`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      console.log(`   Memory status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log(`   ✅ Memory found:`, {
          id: result.id,
          status: result.status,
          content: result.content?.substring(0, 50) + '...'
        });
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Memory error: ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ Memory exception: ${error.message}`);
    }

    console.log('');

    // Test 5: Try different API versions
    console.log('5️⃣ Testing different API versions...');
    
    const apiVersions = [
      'https://api.supermemory.ai/v1',
      'https://api.supermemory.ai/v2',
      'https://api.supermemory.ai/v3',
      'https://api.supermemory.ai'
    ];

    for (const version of apiVersions) {
      try {
        console.log(`   Testing: ${version}/memories/search?q=test`);
        
        const response = await fetch(`${version}/memories/search?q=test`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });
        
        console.log(`     Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const result = await response.json();
          console.log(`     ✅ Success with ${version}! Found ${result.memories?.length || 0} memories`);
          break;
        } else {
          const errorText = await response.text();
          console.log(`     ❌ Error: ${errorText}`);
        }
      } catch (error) {
        console.log(`     ❌ Exception: ${error.message}`);
      }
    }

    console.log('\n🎉 Search debugging completed!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
if (require.main === module) {
  debugSupermemorySearch();
}

module.exports = {
  debugSupermemorySearch,
}; 