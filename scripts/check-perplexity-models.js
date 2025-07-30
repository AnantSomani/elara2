// Check available Perplexity models
const API_KEY = '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';
const BASE_URL = 'https://api.perplexity.ai';

async function checkModels() {
  console.log('🔍 Checking available Perplexity models...\n');

  try {
    const response = await fetch(`${BASE_URL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ Available models:');
    data.data.forEach((model, index) => {
      console.log(`  ${index + 1}. ${model.id}`);
    });

    console.log('\n📝 Note: Use the model ID (without any additional suffixes)');

  } catch (error) {
    console.error('❌ Failed to get models:', error.message);
  }
}

// Run the check
checkModels(); 