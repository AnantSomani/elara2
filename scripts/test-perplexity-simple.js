// Simple test for Perplexity API configuration
const fs = require('fs');
const path = require('path');

function testPerplexityConfig() {
  console.log('🧪 Testing Perplexity API Configuration...\n');

  try {
    // Check if .env.local exists
    const envPath = path.join(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env.local file not found');
      console.log('📝 Please create .env.local and add your Perplexity API key:');
      console.log('   EXPO_PUBLIC_PERPLEXITY_API_KEY=your_api_key_here');
      return;
    }

    // Read .env.local
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check for Perplexity API key
    if (envContent.includes('PERPLEXITY_API_KEY=') || envContent.includes('EXPO_PUBLIC_PERPLEXITY_API_KEY=')) {
      const apiKeyMatch = envContent.match(/(?:PERPLEXITY_API_KEY|EXPO_PUBLIC_PERPLEXITY_API_KEY)=([^\n]+)/);
      if (apiKeyMatch && apiKeyMatch[1] && apiKeyMatch[1] !== 'your_api_key_here') {
        console.log('✅ Perplexity API key found in .env.local');
        console.log(`🔑 Key: ${apiKeyMatch[1].substring(0, 10)}...`);
        console.log('');
        console.log('🎉 Configuration test passed!');
        console.log('');
        console.log('📝 To test the full API integration:');
        console.log('   1. Make sure your API key is valid');
        console.log('   2. Run the app and test the chat functionality');
        console.log('   3. Check the console for Perplexity API calls');
      } else {
        console.log('❌ Perplexity API key not properly set');
        console.log('📝 Please add your actual API key to .env.local:');
        console.log('   PERPLEXITY_API_KEY=your_actual_api_key');
      }
    } else {
      console.log('❌ Perplexity API key not found in .env.local');
      console.log('📝 Please add to .env.local:');
      console.log('   PERPLEXITY_API_KEY=your_api_key_here');
    }

  } catch (error) {
    console.error('❌ Configuration test failed:', error.message);
  }
}

// Run the test
testPerplexityConfig(); 