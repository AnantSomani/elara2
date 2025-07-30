// Minimal Perplexity API test - removes all optional parameters
const API_KEY = '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';
const BASE_URL = 'https://api.perplexity.ai';

async function testMinimalAPI() {
  console.log('🧪 Testing Perplexity API with minimal request...\n');

  try {
    // Test 1: Check if API key is valid with a simple request
    console.log('🔍 Test 1: Minimal request...');
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3-sonar-small-32k-online',
        messages: [{
          role: 'user',
          content: 'Hello'
        }]
      })
    });

    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error Response: ${errorText}`);
      
      // Try to parse error details
      try {
        const errorData = JSON.parse(errorText);
        console.log(`🔍 Error Type: ${errorData.error?.type}`);
        console.log(`🔍 Error Code: ${errorData.error?.code}`);
        console.log(`🔍 Error Message: ${errorData.error?.message}`);
      } catch (e) {
        console.log('Could not parse error response');
      }
    } else {
      const data = await response.json();
      console.log('✅ Success!');
      console.log(`📝 Response: ${JSON.stringify(data, null, 2)}`);
    }

  } catch (error) {
    console.error('❌ Network/Request Error:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testMinimalAPI(); 