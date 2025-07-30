// Test with the most basic model name
const API_KEY = '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';
const BASE_URL = 'https://api.perplexity.ai';

async function testBasicModel() {
  console.log('🧪 Testing with basic model name...\n');

  // Try different basic model names
  const models = [
    'llama-3-sonar-small-32k-online',
    'llama-3-sonar-small-32k',
    'llama-3-sonar-small-online',
    'llama-3-sonar-small',
    'llama-3-sonar-32k-online',
    'llama-3-sonar-32k',
    'llama-3-sonar-online',
    'llama-3-sonar',
    'llama-3-32k-online',
    'llama-3-32k',
    'llama-3-online',
    'llama-3',
    'sonar-small-32k-online',
    'sonar-small-32k',
    'sonar-small-online',
    'sonar-small',
    'sonar-32k-online',
    'sonar-32k',
    'sonar-online',
    'sonar'
  ];

  for (const model of models) {
    try {
      console.log(`🔍 Testing model: ${model}`);
      
      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [{
            role: 'user',
            content: 'Hello'
          }]
        })
      });

      if (response.ok) {
        console.log(`✅ SUCCESS with model: ${model}`);
        const data = await response.json();
        console.log(`📝 Response: ${JSON.stringify(data, null, 2)}`);
        return; // Found working model
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed with model: ${model} - ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error with model: ${model} - ${error.message}`);
    }
  }

  console.log('\n❌ No working models found. Please check your Perplexity dashboard for available models.');
}

// Run the test
testBasicModel(); 