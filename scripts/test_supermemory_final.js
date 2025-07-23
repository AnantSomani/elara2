const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// Supermemory API configuration
const SUPERMEMORY_API_KEY = process.env.SUPERMEMORY_API_KEY;
const SUPERMEMORY_BASE_URL = 'https://api.supermemory.ai/v3';

if (!SUPERMEMORY_API_KEY) {
  console.error('❌ SUPERMEMORY_API_KEY not found in .env.local');
  process.exit(1);
}

async function testSupermemorySearch() {
  try {
    console.log(`🔍 Testing Supermemory Search with exact documentation format`);
    console.log(`🔑 API Key: ${SUPERMEMORY_API_KEY.substring(0, 10)}...`);
    console.log(`🌐 Base URL: ${SUPERMEMORY_BASE_URL}`);
    console.log('');

    // Test the exact format from the documentation
    const searchPayload = {
      q: "fasting",
      limit: 5
    };

    console.log('🧪 Testing search with payload:', JSON.stringify(searchPayload, null, 2));
    
    const response = await fetch(`${SUPERMEMORY_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPERMEMORY_API_KEY}`
      },
      body: JSON.stringify(searchPayload)
    });

    console.log(`📡 Response Status: ${response.status}`);
    console.log(`📡 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log(`📄 Response Body: ${text}`);
    
    if (response.ok) {
      try {
        const result = JSON.parse(text);
        console.log('\n✅ Search successful!');
        console.log('📊 Results:', result);
      } catch (e) {
        console.log('\n⚠️ Response is not valid JSON');
      }
    } else {
      console.log('\n❌ Search failed');
    }

  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}

// Also test if we can list memories using a different approach
async function testListMemories() {
  try {
    console.log('\n🧪 Testing alternative memory listing...');
    
    // Try different possible endpoints
    const endpoints = [
      '/memory',
      '/memories/list',
      '/list',
      '/all'
    ];

    for (const endpoint of endpoints) {
      console.log(`\n🔍 Testing endpoint: ${endpoint}`);
      const response = await fetch(`${SUPERMEMORY_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPERMEMORY_API_KEY}`
        }
      });
      
      console.log(`📡 Status: ${response.status}`);
      const text = await response.text();
      console.log(`📄 Response: ${text.substring(0, 200)}...`);
    }

  } catch (error) {
    console.error(`❌ Error listing memories:`, error.message);
  }
}

async function main() {
  await testSupermemorySearch();
  await testListMemories();
}

main(); 