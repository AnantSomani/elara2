const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// Supermemory API configuration
const SUPERMEMORY_API_KEY = process.env.SUPERMEMORY_API_KEY;
const SUPERMEMORY_BASE_URL = 'https://api.supermemory.ai/v3';

if (!SUPERMEMORY_API_KEY) {
  console.error('❌ SUPERMEMORY_API_KEY not found in .env.local');
  process.exit(1);
}

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const url = `${SUPERMEMORY_BASE_URL}${endpoint}`;
    console.log(`🔍 Testing: ${method} ${url}`);
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${SUPERMEMORY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    console.log(`📡 Status: ${response.status}`);
    
    const text = await response.text();
    console.log(`📄 Response: ${text}`);
    console.log('');
    
    return { status: response.status, body: text };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { status: 'error', body: error.message };
  }
}

async function debugSupermemoryAPI() {
  console.log(`🔍 Debugging Supermemory API`);
  console.log(`🔑 API Key: ${SUPERMEMORY_API_KEY.substring(0, 10)}...`);
  console.log(`🌐 Base URL: ${SUPERMEMORY_BASE_URL}`);
  console.log('');

  // Test different endpoints
  await testEndpoint('/memories');
  await testEndpoint('/search', 'POST', { q: 'fasting' });
  await testEndpoint('/search', 'GET');
  await testEndpoint('/');
  await testEndpoint('/health');
  await testEndpoint('/status');
  
  // Try different search formats
  console.log('🧪 Testing different search formats...');
  await testEndpoint('/search', 'POST', { query: 'fasting' });
  await testEndpoint('/search', 'POST', { search: 'fasting' });
  await testEndpoint('/search', 'POST', { text: 'fasting' });
}

debugSupermemoryAPI(); 