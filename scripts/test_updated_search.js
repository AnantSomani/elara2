require('dotenv').config({ path: '.env.local' });

async function testUpdatedSearch() {
  console.log('🧪 Testing Updated Supermemory Search with Official API Structure...\n');

  const apiKey = process.env.EXPO_PUBLIC_SUPERMEMORY_API_KEY;
  if (!apiKey) {
    console.error('❌ Supermemory API key not found in environment variables');
    return;
  }

  const baseUrl = 'https://api.supermemory.ai/v3';

  console.log('🔧 API Key:', apiKey.substring(0, 20) + '...');
  console.log('🔧 Base URL:', baseUrl);
  console.log('🔧 Using direct API calls with official structure\n');

  async function searchMemories(query, options = {}) {
    const searchParams = {
      q: query,
      documentThreshold: options.documentThreshold || 0.3,
      limit: options.limit || 10,
      onlyMatchingChunks: options.onlyMatchingChunks || false,
    };

    if (options.userId) searchParams.userId = options.userId;
    if (options.space) searchParams.space = options.space;
    if (options.containerTags) searchParams.containerTags = options.containerTags;

    const response = await fetch(`${baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const result = await response.json();
    return result.results || [];
  }

  try {
    console.log('1️⃣ Testing basic search with lower threshold...');
    try {
      const results = await searchMemories('podcast', {
        documentThreshold: 0.3,
        limit: 10
      });
      console.log(`   ✅ Found ${results.length} results`);
      if (results.length > 0) {
        console.log('   📝 First result structure:', {
          documentId: results[0].documentId,
          score: results[0].score,
          chunks: results[0].chunks?.length || 0,
          metadata: results[0].metadata ? 'present' : 'none'
        });
        if (results[0].chunks && results[0].chunks.length > 0) {
          console.log('   📄 First chunk:', results[0].chunks[0].content.substring(0, 100) + '...');
        }
      }
    } catch (error) {
      console.log(`   ❌ Basic search failed: ${error.message}`);
    }

    console.log('\n2️⃣ Testing search with user ID...');
    try {
      const results = await searchMemories('podcast', {
        documentThreshold: 0.3,
        limit: 10,
        userId: 'elara-user' // Add user ID as suggested
      });
      console.log(`   ✅ Found ${results.length} results with user ID`);
      if (results.length > 0) {
        console.log('   📝 First result documentId:', results[0].documentId);
      }
    } catch (error) {
      console.log(`   ❌ Search with user ID failed: ${error.message}`);
    }

    console.log('\n3️⃣ Testing search with space parameter...');
    try {
      const results = await searchMemories('podcast', {
        documentThreshold: 0.3,
        limit: 10,
        space: 'elara-podcast-space' // Add space parameter as suggested
      });
      console.log(`   ✅ Found ${results.length} results with space`);
      if (results.length > 0) {
        console.log('   📝 First result documentId:', results[0].documentId);
      }
    } catch (error) {
      console.log(`   ❌ Search with space failed: ${error.message}`);
    }

    console.log('\n4️⃣ Testing search with container tags...');
    try {
      const results = await searchMemories('podcast', {
        documentThreshold: 0.3,
        limit: 10,
        containerTags: ['elara', 'podcast'] // Add container tags
      });
      console.log(`   ✅ Found ${results.length} results with container tags`);
      if (results.length > 0) {
        console.log('   📝 First result documentId:', results[0].documentId);
      }
    } catch (error) {
      console.log(`   ❌ Search with container tags failed: ${error.message}`);
    }

    console.log('\n5️⃣ Testing search with very low threshold...');
    try {
      const results = await searchMemories('podcast', {
        documentThreshold: 0.1, // Very low threshold as suggested
        limit: 10
      });
      console.log(`   ✅ Found ${results.length} results with very low threshold`);
      if (results.length > 0) {
        console.log('   📝 First result documentId:', results[0].documentId);
      }
    } catch (error) {
      console.log(`   ❌ Search with very low threshold failed: ${error.message}`);
    }

    console.log('\n6️⃣ Testing different search queries...');
    const queries = ['elara', 'artificial intelligence', 'machine learning', 'speaker', 'episode'];
    
    for (const query of queries) {
      try {
        const results = await searchMemories(query, {
          documentThreshold: 0.3,
          limit: 5
        });
        console.log(`   🔍 "${query}": ${results.length} results`);
      } catch (error) {
        console.log(`   ❌ "${query}" failed: ${error.message}`);
      }
    }

    console.log('\n7️⃣ Testing search with all parameters combined...');
    try {
      const results = await searchMemories('podcast', {
        documentThreshold: 0.2,
        limit: 10,
        userId: 'elara-user',
        space: 'elara-podcast-space',
        containerTags: ['elara', 'podcast'],
        onlyMatchingChunks: true
      });
      console.log(`   ✅ Found ${results.length} results with all parameters`);
      if (results.length > 0) {
        console.log('   📝 First result structure:', {
          documentId: results[0].documentId,
          score: results[0].score,
          chunks: results[0].chunks?.length || 0,
          title: results[0].title || 'no title',
          summary: results[0].summary ? 'present' : 'none'
        });
      }
    } catch (error) {
      console.log(`   ❌ Search with all parameters failed: ${error.message}`);
    }

    console.log('\n🎉 Updated search testing completed!');

  } catch (error) {
    console.error('❌ Error in updated search test:', error);
  }
}

testUpdatedSearch(); 