// Simple Perplexity API integration test
// This can be run to verify the API works with your key

const API_KEY = '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';
const BASE_URL = 'https://api.perplexity.ai';

async function testPerplexityAPI() {
  console.log('🧪 Testing Perplexity API with your key...\n');

  try {
    // Test web search
    console.log('🔍 Testing web search...');
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
          content: 'What are the latest developments in AI in 2024?'
        }],
        max_tokens: 200,
        temperature: 0.1,
        top_p: 0.9,
        search_domain: 'web'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const answer = data.choices[0].message.content;
      console.log('✅ Web search successful!');
      console.log(`📝 Answer: ${answer.substring(0, 150)}...`);
      console.log(`🔢 Tokens used: ${data.usage.total_tokens}`);
    } else {
      throw new Error('No response from API');
    }

    console.log('\n🎉 Perplexity API integration test passed!');
    console.log('✅ Your API key is working correctly');
    console.log('✅ The integration is ready to use in your app');

  } catch (error) {
    console.error('❌ Perplexity API test failed:', error.message);
    
    if (error.message.includes('401')) {
      console.log('💡 This might be an authentication error. Check your API key.');
    } else if (error.message.includes('429')) {
      console.log('💡 Rate limit exceeded. Try again later.');
    } else if (error.message.includes('500')) {
      console.log('💡 Server error. Try again later.');
    }
  }
}

// Run the test
testPerplexityAPI(); 