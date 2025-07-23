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
    console.log(`🔍 Testing Supermemory Search`);
    console.log(`🔑 API Key: ${SUPERMEMORY_API_KEY.substring(0, 10)}...`);
    console.log(`🌐 Base URL: ${SUPERMEMORY_BASE_URL}`);
    console.log('');

    // Test 1: Simple search without filters
    console.log('🧪 Test 1: Simple search for "fasting"');
    const response1 = await fetch(`${SUPERMEMORY_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPERMEMORY_API_KEY}`
      },
      body: JSON.stringify({
        q: "fasting"
      })
    });

    console.log(`📡 Response 1 Status: ${response1.status}`);
    const result1 = await response1.json();
    console.log(`📄 Response 1 Body:`, JSON.stringify(result1, null, 2));
    console.log('');

    // Test 2: Search with different parameters
    console.log('🧪 Test 2: Search with limit parameter');
    const response2 = await fetch(`${SUPERMEMORY_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPERMEMORY_API_KEY}`
      },
      body: JSON.stringify({
        q: "fasting",
        limit: 5
      })
    });

    console.log(`📡 Response 2 Status: ${response2.status}`);
    const result2 = await response2.json();
    console.log(`📄 Response 2 Body:`, JSON.stringify(result2, null, 2));
    console.log('');

    // Test 3: List memories to see what's available
    console.log('🧪 Test 3: List all memories');
    const response3 = await fetch(`${SUPERMEMORY_BASE_URL}/memories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPERMEMORY_API_KEY}`
      }
    });

    console.log(`📡 Response 3 Status: ${response3.status}`);
    const result3 = await response3.json();
    console.log(`📄 Response 3 Body:`, JSON.stringify(result3, null, 2));

  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}

testSupermemorySearch(); 