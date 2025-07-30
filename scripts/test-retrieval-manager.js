// Test Unified Retrieval Manager
async function testRetrievalManager() {
  console.log('🧪 Testing Unified Retrieval Manager...\n');

  try {
    // Dynamic import for TypeScript module
    const { retrievalManager } = await import('../lib/retrievalManager.ts');

    // Test 1: Quick retrieval without episode context
    console.log('🔍 Test 1: Quick retrieval (no episode context)...');
    const quickResults = await retrievalManager.quickRetrieve('artificial intelligence trends');
    console.log(`✅ Found ${quickResults.length} results`);
    
    quickResults.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.source} (relevance: ${result.relevance.toFixed(2)})`);
    });
    console.log('');

    // Test 2: Full retrieval with context
    console.log('🔍 Test 2: Full retrieval with context...');
    const fullResults = await retrievalManager.retrieveAll({
      userQuery: 'machine learning applications',
      maxResults: 8
    });
    console.log(`✅ Found ${fullResults.length} results`);
    
    fullResults.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.source} (relevance: ${result.relevance.toFixed(2)})`);
      if (result.content && result.content.answer) {
        console.log(`     📝 ${result.content.answer.substring(0, 100)}...`);
      }
    });
    console.log('');

    // Test 3: Check available sources
    console.log('🔍 Test 3: Available data sources...');
    const availableSources = retrievalManager.getAvailableSources();
    console.log(`✅ Available sources: ${availableSources.join(', ')}`);
    console.log(`✅ Has real-time sources: ${retrievalManager.hasRealTimeSources()}`);
    console.log('');

    console.log('🎉 All retrieval manager tests passed!');

  } catch (error) {
    console.error('❌ Retrieval manager test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testRetrievalManager().catch(console.error); 