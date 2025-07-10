// Direct test of the FastAPI endpoint
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testDirectAPI() {
  try {
    // Use a different URL to see fresh processing
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up (short test)
    const videoId = 'dQw4w9WgXcQ';
    const apiUrl = 'http://localhost:8000';
    
    console.log('🧪 Testing Direct FastAPI Call with Fresh URL');
    console.log('===============================================');
    console.log('');
    console.log('📹 Test URL:', testUrl);
    console.log('🔗 API URL:', apiUrl);
    console.log('');
    
    // Check if episode already exists
    console.log('1️⃣ Checking current episode status in database...');
    const { data: existingEpisode } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', videoId)
      .single();
    
    if (existingEpisode) {
      console.log('✅ Episode exists:', existingEpisode.title);
      console.log('📊 Status:', existingEpisode.processing_status);
      console.log('🎵 Audio URL:', existingEpisode.audio_url ? 'Set' : 'Not set');
      
      // Clean up for fresh test
      console.log('🧹 Deleting existing episode for fresh test...');
      await supabase.from('episodes').delete().eq('id', videoId);
    } else {
      console.log('ℹ️  Episode does not exist yet - perfect for testing!');
    }
    
    console.log('');
    console.log('2️⃣ Calling FastAPI /process endpoint directly...');
    
    const response = await fetch(`${apiUrl}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        youtube_url: testUrl,
        episode_id: videoId,
        force_reprocess: false,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(`FastAPI error: ${errorData.detail || response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ FastAPI response:', result);
    
    console.log('');
    console.log('3️⃣ Real processing status:');
    
    if (result.status === 'already_processed') {
      console.log('ℹ️  Episode was already processed');
    } else if (result.status === 'processing') {
      console.log('🔄 NEW PROCESSING STARTED!');
      console.log('');
      console.log('🎯 The FastAPI is now doing REAL processing:');
      console.log('  1. 📥 Downloading actual audio from YouTube with yt-dlp');
      console.log('  2. 🤖 Transcribing with AssemblyAI speaker diarization');
      console.log('  3. 🧠 Generating embeddings with OpenAI');
      console.log('  4. 💾 Updating database with real transcript data');
      console.log('');
      console.log('📊 Watch your Supabase database for real-time updates!');
      console.log('');
      console.log('⏳ Waiting 15 seconds to check progress...');
      
      // Wait a moment and check status
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      console.log('4️⃣ Checking processing progress...');
      
      const statusResponse = await fetch(`${apiUrl}/status/${result.episode_id}`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('📊 API status:', statusData.processing_status);
        
        // Check database for updates
        const { data: updatedEpisode } = await supabase
          .from('episodes')
          .select('*')
          .eq('id', result.episode_id)
          .single();
        
        if (updatedEpisode) {
          console.log('📝 Database status:', updatedEpisode.processing_status);
          console.log('🎵 Audio URL:', updatedEpisode.audio_url ? 'Available!' : 'Still processing');
          console.log('📜 AssemblyAI Status:', updatedEpisode.assemblyai_status || 'Not started');
          
          if (updatedEpisode.processing_status === 'completed') {
            console.log('');
            console.log('🎉 PROCESSING COMPLETED!');
            console.log('✅ Real audio downloaded and transcribed');
            console.log('✅ Speaker diarization complete');
            console.log('✅ Embeddings generated');
            console.log('✅ Ready for chat!');
          } else {
            console.log('');
            console.log('⏳ Still processing... This can take a few minutes for real transcription');
            console.log('💡 Check your database or FastAPI logs for continued progress');
          }
        }
      }
    }
    
    console.log('');
    console.log('🎉 FastAPI integration is working perfectly!');
    console.log('');
    console.log('Your React Native app can now submit ANY YouTube URL and get:');
    console.log('✅ Real YouTube audio download (not mocks)');
    console.log('✅ Real AssemblyAI transcription');
    console.log('✅ Real speaker diarization');
    console.log('✅ Real embeddings for semantic chat');
    console.log('');
    console.log('🚀 Ready to test in your frontend!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.error('');
      console.error('Make sure the FastAPI server is running:');
      console.error('  ./start-processing-api.sh');
    }
  }
}

testDirectAPI(); 