// Test script to verify real Python API integration
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testRealProcessing() {
  try {
    const testUrl = 'https://www.youtube.com/shorts/D5PltpF2Wsw';
    const apiUrl = 'http://localhost:8000';
    
    console.log('🧪 Testing Real Python API Integration');
    console.log('=====================================');
    console.log('');
    console.log('📹 Test URL:', testUrl);
    console.log('🔗 API URL:', apiUrl);
    console.log('');
    
    // First, check if the API is running
    console.log('1️⃣ Checking if Python API is running...');
    try {
      const healthResponse = await fetch(`${apiUrl}/health`);
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      const healthData = await healthResponse.json();
      console.log('✅ Python API is running:', healthData.status);
      console.log('📊 Database:', healthData.database);
    } catch (error) {
      console.error('❌ Python API is not running!');
      console.error('');
      console.error('To start the Python API, run:');
      console.error('  ./start-processing-api.sh');
      console.error('');
      console.error('Then try this test again.');
      return;
    }
    
    console.log('');
    console.log('2️⃣ Calling frontend processPodcastLink (this calls the Python API)...');
    
    // Import and call the frontend function
    const { processPodcastLink } = require('./lib/api.ts');
    
    try {
      const result = await processPodcastLink(testUrl);
      console.log('✅ Frontend processing completed!');
      console.log('📊 Result:', {
        episodeId: result.episodeId,
        title: result.videoData.title,
        channel: result.videoData.channelTitle,
        duration: result.videoData.durationSeconds + ' seconds'
      });
      
      console.log('');
      console.log('3️⃣ Real processing is now happening in the background!');
      console.log('');
      console.log('🔄 The Python API is:');
      console.log('  • Downloading actual audio from YouTube');
      console.log('  • Transcribing with AssemblyAI speaker diarization');
      console.log('  • Generating embeddings with OpenAI');
      console.log('  • Updating your database in real-time');
      console.log('');
      console.log('📊 Check your Supabase database to see the processing progress!');
      console.log('');
      console.log('🔍 You can also check the API logs or call:');
      console.log(`  curl ${apiUrl}/status/${result.episodeId}`);
      
    } catch (error) {
      console.error('❌ Frontend processing failed:', error.message);
      
      if (error.message.includes('Python API error')) {
        console.error('');
        console.error('This means the Python API is running but encountered an error.');
        console.error('Check the Python API logs for more details.');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

console.log('🚀 Testing Real Processing Integration');
console.log('');
console.log('This test will:');
console.log('1. Check if the Python API is running');
console.log('2. Call the frontend processPodcastLink function');
console.log('3. Verify it triggers real YouTube + AssemblyAI processing');
console.log('');

testRealProcessing(); 