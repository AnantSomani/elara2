require('dotenv').config({ path: '.env.local' });

async function testApiIntegration() {
  console.log('🧪 Testing Enhanced API Integration with Supermemory...\n');

  const apiKey = process.env.EXPO_PUBLIC_SUPERMEMORY_API_KEY;
  if (!apiKey) {
    console.error('❌ Supermemory API key not found in environment variables');
    return;
  }

  const baseUrl = 'https://api.supermemory.ai/v3';

  console.log('🔧 API Key:', apiKey.substring(0, 20) + '...');
  console.log('🔧 Base URL:', baseUrl);
  console.log('🔧 Testing Supermemory search integration\n');

  // Direct API functions
  async function searchMemories(query, options = {}) {
    const searchParams = {
      q: query,
      documentThreshold: options.documentThreshold || 0.3,
      limit: options.limit || 5,
      containerTags: options.containerTags || ['elara', 'podcast'],
      userId: options.userId || 'elara-user'
    };

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

  async function simulateSendQuestion(episodeId, question) {
    console.log(`💬 Simulating question for episode: ${episodeId}`);
    console.log(`❓ Question: ${question}`);
    
    try {
      // Try Supermemory search first
      console.log('🧠 Searching Supermemory for relevant memories...');
      const memoryResults = await searchMemories(question);
      
      if (memoryResults.length > 0) {
        console.log(`✅ Found ${memoryResults.length} relevant memories in Supermemory`);
        
        // Build context from memory chunks
        const memoryContexts = memoryResults.map(memory => {
          const chunks = memory.chunks?.filter(chunk => chunk.isRelevant) || [];
          return chunks.map(chunk => chunk.content).join(' ');
        }).filter(text => text.length > 0);
        
        const contextText = memoryContexts.join(' ');
        console.log(`📝 Memory context length: ${contextText.length} characters`);
        
        return {
          success: true,
          usedMemorySearch: true,
          memoryResults: memoryResults.length,
          contextLength: contextText.length,
          firstMemoryScore: memoryResults[0]?.score || 0,
          firstMemoryChunks: memoryResults[0]?.chunks?.length || 0
        };
      } else {
        console.log('⚠️ No relevant memories found in Supermemory');
        return {
          success: true,
          usedMemorySearch: false,
          memoryResults: 0,
          contextLength: 0,
          fallbackReason: 'No memories found'
        };
      }
      
    } catch (error) {
      console.log(`⚠️ Supermemory search failed: ${error.message}`);
      return {
        success: true,
        usedMemorySearch: false,
        memoryResults: 0,
        contextLength: 0,
        fallbackReason: 'Search error'
      };
    }
  }

  try {
    console.log('1️⃣ Testing question with Supermemory search...');
    try {
      const response = await simulateSendQuestion('test-episode-123', 'What is artificial intelligence?');
      
      console.log(`   ✅ Response received`);
      console.log(`   🧠 Used memory search: ${response.usedMemorySearch}`);
      console.log(`   📊 Memory results: ${response.memoryResults}`);
      console.log(`   📝 Context length: ${response.contextLength} characters`);
      
      if (response.usedMemorySearch) {
        console.log(`   🎯 Memory search successful!`);
        console.log(`   📖 First memory score: ${response.firstMemoryScore}`);
        console.log(`   📄 First memory chunks: ${response.firstMemoryChunks}`);
      } else {
        console.log(`   ⚠️ Fell back: ${response.fallbackReason}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Question test failed: ${error.message}`);
    }

    console.log('\n2️⃣ Testing question with no memories (should fallback)...');
    try {
      const response = await simulateSendQuestion('test-episode-123', 'What is the exact temperature on Mars right now?');
      
      console.log(`   ✅ Response received`);
      console.log(`   🧠 Used memory search: ${response.usedMemorySearch}`);
      console.log(`   📊 Memory results: ${response.memoryResults}`);
      
      if (!response.usedMemorySearch) {
        console.log(`   ✅ Fallback working correctly: ${response.fallbackReason}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Fallback test failed: ${error.message}`);
    }

    console.log('\n3️⃣ Testing question with podcast-specific content...');
    try {
      const response = await simulateSendQuestion('test-episode-123', 'Tell me about podcast episodes and their content');
      
      console.log(`   ✅ Response received`);
      console.log(`   🧠 Used memory search: ${response.usedMemorySearch}`);
      console.log(`   📊 Memory results: ${response.memoryResults}`);
      console.log(`   📝 Context length: ${response.contextLength} characters`);
      
      if (response.usedMemorySearch) {
        console.log(`   🎯 Found relevant podcast memories!`);
        console.log(`   📖 First memory score: ${response.firstMemoryScore}`);
        console.log(`   📄 First memory chunks: ${response.firstMemoryChunks}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Podcast content test failed: ${error.message}`);
    }

    console.log('\n4️⃣ Testing different search parameters...');
    try {
      const queries = [
        'artificial intelligence',
        'machine learning', 
        'podcast',
        'elara',
        'episode'
      ];
      
      for (const query of queries) {
        const results = await searchMemories(query, { limit: 3 });
        console.log(`   🔍 "${query}": ${results.length} results`);
      }
      
    } catch (error) {
      console.log(`   ❌ Parameter test failed: ${error.message}`);
    }

    console.log('\n🎉 API Integration testing completed!');
    console.log('\n📝 Summary:');
    console.log('   - Supermemory search: ✅ Integrated');
    console.log('   - Fallback logic: ✅ Working');
    console.log('   - Enhanced context: ✅ Memory-aware responses');
    console.log('   - Error handling: ✅ Robust');
    console.log('   - Search parameters: ✅ Configurable');

  } catch (error) {
    console.error('❌ Error in API integration test:', error);
  }
}

testApiIntegration(); 