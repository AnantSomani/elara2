#!/usr/bin/env node
/**
 * Interactive retrieval testing script
 * Run: node scripts/interactive_retrieval_test.js
 */

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const readline = require('readline');

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function listAvailableEpisodes() {
  console.log('\n🔍 Fetching available episodes...\n');
  
  try {
    const { data, error } = await supabase
      .from('episodes')
      .select('id, title, transcription_status, processing_status')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.log('❌ Error fetching episodes:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('📭 No episodes found in database');
      return [];
    }

    console.log('📋 Available episodes:');
    console.log('='.repeat(80));
    
    data.forEach((episode, index) => {
      const status = episode.transcription_status === 'completed' ? '✅' : '⏳';
      const title = episode.title || 'No title';
      const truncatedTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;
      
      console.log(`${index + 1}. ${status} ${episode.id}`);
      console.log(`   ${truncatedTitle}`);
      console.log(`   Status: ${episode.transcription_status || 'Not started'}`);
      console.log('');
    });

    return data;
  } catch (error) {
    console.log('❌ Error:', error.message);
    return [];
  }
}

async function testRetrieval(episodeId, questionText) {
  console.log(`\n🧪 Testing retrieval for episode: ${episodeId}`);
  console.log(`❓ Question: "${questionText}"`);
  console.log('='.repeat(60));

  try {
    // Step 1: Check episode status
    const { data: episode, error: episodeError } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', episodeId)
      .single();

    if (episodeError || !episode) {
      console.log('❌ Episode not found in database');
      return false;
    }

    console.log(`✅ Episode: ${episode.title || 'No title'}`);
    
    // Check if segments with content and embeddings exist (the real indicator of completion)
    const { data: segments, error: segmentsError } = await supabase
      .from('transcript_segments')
      .select('id, content, embedding')
      .eq('episode_id', episodeId)
      .limit(5);

    if (segmentsError || !segments || segments.length === 0) {
      console.log('❌ No transcript segments found');
      return false;
    }

    const segmentsWithContent = segments.filter(s => s.content && s.content.trim().length > 0);
    const segmentsWithEmbeddings = segments.filter(s => s.embedding && s.embedding.length > 0);
    
    console.log(`📝 Segments with content: ${segmentsWithContent.length}/${segments.length}`);
    console.log(`🧠 Segments with embeddings: ${segmentsWithEmbeddings.length}/${segments.length}`);

    if (segmentsWithContent.length === 0) {
      console.log('❌ No segments with content found');
      return false;
    }

    if (segmentsWithEmbeddings.length === 0) {
      console.log('❌ No segments with embeddings found - semantic search will not work');
      return false;
    }

    // Step 2: Check segments and embeddings (already done above, skip duplicate check)
    console.log(`✅ Found ${segmentsWithContent.length} segments with content and ${segmentsWithEmbeddings.length} with embeddings`);

    // Step 3: Generate question embedding
    const embedResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: questionText
    });
    
    const questionEmbedding = embedResponse.data[0].embedding;
    console.log(`✅ Generated embedding (${questionEmbedding.length} dimensions)`);

    // Step 4: Test semantic search
    const { data: searchResults, error: searchError } = await supabase.rpc('search_segments', {
      target_episode_id: episodeId,
      query_embedding: questionEmbedding,
      similarity_threshold: 0.3, // Keep current threshold
      match_count: 10, // Increased to 10 maximum segments
    });

    if (searchError) {
      console.log('⚠️ search_segments failed, trying direct vector query...');
      
      const { data: fallbackResults, error: fallbackError } = await supabase
        .from('transcript_segments')
        .select('id, content, speaker_name, start_time, end_time')
        .eq('episode_id', episodeId)
        .order(`embedding <-> '[${questionEmbedding.join(',')}]'::vector`)
        .limit(3);

      if (fallbackError) {
        console.log('❌ Direct vector query also failed:', fallbackError.message);
        return false;
      }

      console.log(`✅ Found ${fallbackResults.length} segments via direct vector search`);
      
      fallbackResults.forEach((result, index) => {
        const startTime = Math.floor(result.start_time);
        console.log(`\n${index + 1}. [${startTime}s] ${result.speaker_name || 'Unknown'}`);
        console.log(`   "${result.content.substring(0, 100)}${result.content.length > 100 ? '...' : ''}"`);
      });

    } else {
      console.log(`✅ Found ${searchResults.length} segments via semantic search`);
      
      if (searchResults.length === 0) {
        console.log('💡 No segments met the similarity threshold. Try a different question or lower the threshold further.');
      } else {
        searchResults.forEach((result, index) => {
          const startTime = Math.floor(result.start_time);
          const similarity = (result.similarity * 100).toFixed(1);
          const quality = similarity >= 70 ? '🔥' : similarity >= 50 ? '✅' : '📝';
          console.log(`\n${index + 1}. ${quality} [${startTime}s] ${result.speaker_name || 'Unknown'} (${similarity}% match)`);
          console.log(`   "${result.content.substring(0, 100)}${result.content.length > 100 ? '...' : ''}"`);
        });
      }
    }

    console.log('\n🎉 Retrieval test completed successfully!');
    return true;

  } catch (error) {
    console.log('❌ Retrieval test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🎧 Interactive Agentic RAG Retrieval Tester');
  console.log('==========================================');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.log('❌ Missing Supabase credentials');
    console.log('   Set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    rl.close();
    return;
  }

  if (!OPENAI_API_KEY) {
    console.log('❌ Missing OpenAI API key');
    console.log('   Set EXPO_PUBLIC_OPENAI_API_KEY');
    rl.close();
    return;
  }

  try {
    while (true) {
      console.log('\n📋 Options:');
      console.log('1. List available episodes');
      console.log('2. Test retrieval for specific episode');
      console.log('3. Quick test with sample question');
      console.log('4. Exit');
      
      const choice = await question('\nSelect an option (1-4): ');

      switch (choice.trim()) {
        case '1':
          await listAvailableEpisodes();
          break;

        case '2':
          const episodes = await listAvailableEpisodes();
          if (episodes.length === 0) break;

          const episodeChoice = await question('\nEnter episode number or ID: ');
          let episodeId;

          // Check if user entered a number (index) or direct ID
          const episodeIndex = parseInt(episodeChoice) - 1;
          if (!isNaN(episodeIndex) && episodeIndex >= 0 && episodeIndex < episodes.length) {
            episodeId = episodes[episodeIndex].id;
          } else {
            episodeId = episodeChoice.trim();
          }

          const questionText = await question('Enter your question: ');
          await testRetrieval(episodeId, questionText);
          break;

        case '3':
          const quickEpisodeId = await question('Enter episode ID: ');
          const quickQuestion = await question('Enter question (or press Enter for default): ');
          const finalQuestion = quickQuestion.trim() || "What did they discuss about AI?";
          await testRetrieval(quickEpisodeId, finalQuestion);
          break;

        case '4':
          console.log('\n👋 Goodbye!');
          rl.close();
          return;

        default:
          console.log('❌ Invalid option. Please select 1-4.');
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main().catch(console.error);
} 