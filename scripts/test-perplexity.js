// Test Perplexity API integration
async function testPerplexityAPI() {
  console.log('🧪 Testing Perplexity API Integration...\n');

  try {
    // Dynamic import for TypeScript module
    const { PerplexityClient } = await import('../lib/perplexity.ts');
    const client = new PerplexityClient();

    // Check if API is available
    if (!client.isAvailable()) {
      console.log('❌ Perplexity API key not found. Please set EXPO_PUBLIC_PERPLEXITY_API_KEY in .env.local');
      return;
    }

    console.log('✅ Perplexity API key found\n');

    // Test web search
    console.log('🔍 Testing web search...');
    const webResult = await client.searchWeb('latest AI developments 2024');
    console.log('✅ Web search successful');
    console.log(`📝 Answer: ${webResult.answer.substring(0, 200)}...`);
    console.log(`🔗 Sources: ${webResult.sources.length} found\n`);

    // Test news search
    console.log('📰 Testing news search...');
    const newsResult = await client.searchNews('tech news today');
    console.log('✅ News search successful');
    console.log(`📝 Answer: ${newsResult.answer.substring(0, 200)}...`);
    console.log(`🔗 Sources: ${newsResult.sources.length} found\n`);

    // Test academic search
    console.log('🎓 Testing academic search...');
    const academicResult = await client.searchAcademic('machine learning research');
    console.log('✅ Academic search successful');
    console.log(`📝 Answer: ${academicResult.answer.substring(0, 200)}...`);
    console.log(`🔗 Sources: ${academicResult.sources.length} found\n`);

    console.log('🎉 All Perplexity API tests passed!');

  } catch (error) {
    console.error('❌ Perplexity API test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testPerplexityAPI().catch(console.error); 