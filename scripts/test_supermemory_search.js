const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// Supermemory API configuration
const SUPERMEMORY_API_KEY = process.env.SUPERMEMORY_API_KEY;
const SUPERMEMORY_BASE_URL = 'https://api.supermemory.ai/v3';

if (!SUPERMEMORY_API_KEY) {
  console.error('❌ SUPERMEMORY_API_KEY not found in .env.local');
  process.exit(1);
}

async function searchSupermemory(query) {
  try {
    console.log(`🔍 Searching Supermemory for: "${query}"`);
    console.log(`🔑 Using API Key: ${SUPERMEMORY_API_KEY.substring(0, 10)}...`);
    console.log(`🌐 API Base URL: ${SUPERMEMORY_BASE_URL}`);
    console.log('');

    const response = await fetch(`${SUPERMEMORY_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPERMEMORY_API_KEY}`
      },
      body: JSON.stringify({
        q: query,
        limit: 10,
        includeSummary: true,
        rerank: true,
        containerTags: ['elara_podcast']
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Supermemory search failed:`, result);
      return { success: false, error: result };
    }

    console.log(`✅ Search completed successfully!`);
    console.log(`📊 Found ${result.total} total results`);
    console.log(`⏱️ Search took ${result.timing}ms`);
    console.log(`📝 Retrieved ${result.results.length} results`);
    console.log('');

    // Display results
    if (result.results && result.results.length > 0) {
      console.log('🎯 Search Results:');
      console.log('='.repeat(80));
      
      result.results.forEach((memory, index) => {
        console.log(`\n📖 Result ${index + 1}:`);
        console.log(`   🏷️  Title: ${memory.title || 'No title'}`);
        console.log(`   📅 Created: ${memory.createdAt}`);
        console.log(`   📊 Score: ${memory.score}`);
        console.log(`   🏷️  Tags: ${memory.metadata?.containerTags?.join(', ') || 'None'}`);
        
        if (memory.summary) {
          console.log(`   📝 Summary: ${memory.summary}`);
        }
        
        if (memory.chunks && memory.chunks.length > 0) {
          console.log(`   📄 Content Chunks:`);
          memory.chunks.forEach((chunk, chunkIndex) => {
            console.log(`      Chunk ${chunkIndex + 1} (Score: ${chunk.score}):`);
            console.log(`      "${chunk.content.substring(0, 200)}${chunk.content.length > 200 ? '...' : ''}"`);
            console.log('');
          });
        }
        
        console.log('-'.repeat(60));
      });
    } else {
      console.log('⚠️ No results found for this query');
    }

    return { success: true, data: result };
  } catch (error) {
    console.error(`❌ Error searching Supermemory:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testMultipleQueries() {
  const queries = [
    "tell me about the diet during fasting",
    "how long did they fast",
    "what did they say about weight loss",
    "ketogenic diet",
    "41 days fasting"
  ];

  console.log('🧪 Testing Supermemory Search with Multiple Queries');
  console.log('='.repeat(80));
  console.log('');

  for (const query of queries) {
    console.log(`\n🔍 Testing Query: "${query}"`);
    console.log('-'.repeat(60));
    
    const result = await searchSupermemory(query);
    
    if (result.success) {
      console.log(`✅ Query successful - found ${result.data.total} results`);
    } else {
      console.log(`❌ Query failed: ${result.error}`);
    }
    
    // Add delay between queries
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--multiple')) {
    await testMultipleQueries();
  } else {
    const query = args[0] || "tell me about the diet during fasting";
    await searchSupermemory(query);
  }
}

main().catch(console.error); 