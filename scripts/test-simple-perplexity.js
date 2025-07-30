// Simple Perplexity API test
const API_KEY = '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';
const BASE_URL = 'https://api.perplexity.ai';

async function testSimpleAPI() {
  console.log('🧪 Testing Perplexity API with simple approach...\n');

  try {
    // Try a simple chat completion without search domain
    console.log('🔍 Testing basic chat completion...');
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{
          role: 'user',
          content: 'Hello, how are you?'
        }],
        max_tokens: 50,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ API Error: ${response.status}`);
      console.log(`📝 Error details: ${errorText}`);
      
      // Try to parse the error to see what models are suggested
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          console.log(`💡 Suggestion: ${errorData.error.message}`);
        }
      } catch (e) {
        // Ignore parsing errors
      }
      
      return;
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const answer = data.choices[0].message.content;
      console.log('✅ Basic API call successful!');
      console.log(`📝 Answer: ${answer}`);
      console.log(`🔢 Tokens used: ${data.usage.total_tokens}`);
    } else {
      throw new Error('No response from API');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSimpleAPI(); 