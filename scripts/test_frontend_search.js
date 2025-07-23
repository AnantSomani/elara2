const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// Supermemory API configuration
const SUPERMEMORY_API_KEY = process.env.EXPO_PUBLIC_SUPERMEMORY_API_KEY;
const SUPERMEMORY_BASE_URL = 'https://api.supermemory.ai/v3';

if (!SUPERMEMORY_API_KEY) {
  console.error('❌ EXPO_PUBLIC_SUPERMEMORY_API_KEY not found in .env.local');
  process.exit(1);
}

async function testFrontendSearch() {
  try {
    console.log(`🔍 Testing Frontend-Style Supermemory Search`);
    console.log(`🔑 API Key: ${SUPERMEMORY_API_KEY.substring(0, 10)}...`);
    console.log(`🌐 Base URL: ${SUPERMEMORY_BASE_URL}`);
    console.log('');

    // Test the exact same parameters your frontend uses
    const searchPayload = {
      q: "tell me about the diet during fasting",
      documentThreshold: 0.3,
      limit: 5,
      containerTags: ['elara_podcast'],
      userId: 'elara_user'
    };

    console.log('🧪 Testing with frontend parameters:', JSON.stringify(searchPayload, null, 2));
    
    const response = await fetch(`${SUPERMEMORY_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPERMEMORY_API_KEY}`
      },
      body: JSON.stringify(searchPayload)
    });

    console.log(`📡 Response Status: ${response.status}`);
    
    const text = await response.text();
    console.log(`📄 Response Body: ${text}`);
    
    if (response.ok) {
      try {
        const result = JSON.parse(text);
        console.log('\n✅ Frontend-style search successful!');
        console.log(`📊 Found ${result.results?.length || 0} results`);
        
        if (result.results && result.results.length > 0) {
          console.log('\n🎯 Results:');
          result.results.forEach((memory, index) => {
            console.log(`\n📖 Result ${index + 1}:`);
            console.log(`   🏷️  Title: ${memory.title || 'No title'}`);
            console.log(`   📊 Score: ${memory.score}`);
            console.log(`   🏷️  Tags: ${memory.metadata?.containerTags?.join(', ') || 'None'}`);
            
            if (memory.chunks && memory.chunks.length > 0) {
              console.log(`   📄 Content: "${memory.chunks[0].content.substring(0, 100)}..."`);
            }
          });
        }
      } catch (e) {
        console.log('\n⚠️ Response is not valid JSON');
      }
    } else {
      console.log('\n❌ Frontend-style search failed');
    }

  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}

testFrontendSearch(); 