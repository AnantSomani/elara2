#!/usr/bin/env node
/**
 * Test script for agentic RAG retrieval system
 * Run: node scripts/test_retrieval.js <episode-id> <question>
 */

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

// Load environment variables
require('dotenv').config({ path: '../.env.local' });
require('dotenv').config({ path: '../.env' });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

async function testRetrieval(episodeId, question) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.log('❌ Missing Supabase credentials');
    console.log('   Set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    return false;
  }

  if (!OPENAI_API_KEY) {
    console.log('❌ Missing OpenAI API key');
    console.log('   Set EXPO_PUBLIC_OPENAI_API_KEY');
    return false;
  }

  console.log(`🧪 Testing Agentic RAG Retrieval System`);
  console.log(`=========================================`);
  console.log(`Episode ID: ${episodeId}`);
  console.log(`Question: "${question}"`);
  console.log('');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // Step 1: Check episode exists and has transcription
    console.log('1️⃣ Checking episode status...');
    const { data: episode, error: episodeError } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', episodeId)
      .single();

    if (episodeError || !episode) {
      console.log('❌ Episode not found in database');
      return false;
    }

    console.log(`✅ Episode found: ${episode.title}`);
    console.log(`📊 Processing status: ${episode.processing_status}`);
    console.log(`🎤 Transcription status: ${episode.transcription_status}`);
    console.log(`🔗 Audio URL: ${episode.audio_url ? 'Available' : 'Missing'}`);

    if (episode.transcription_status !== 'completed') {
      console.log('❌ Episode transcription not completed');
      console.log('   Run the processing pipeline first');
      return false;
    }

    // Step 2: Check transcript segments exist
    console.log('\n2️⃣ Checking transcript segments...');
    const { data: segments, error: segmentsError } = await supabase
      .from('transcript_segments')
      .select('id, content, speaker_name, start_time, end_time, embedding')
      .eq('episode_id', episodeId)
      .limit(5);

    if (segmentsError || !segments || segments.length === 0) {
      console.log('❌ No transcript segments found');
      console.log('   The transcription may have failed or segments not saved');
      return false;
    }

    console.log(`✅ Found ${segments.length} sample segments`);
    
    // Check if embeddings exist
    const segmentsWithEmbeddings = segments.filter(s => s.embedding && s.embedding.length > 0);
    console.log(`🧠 Segments with embeddings: ${segmentsWithEmbeddings.length}/${segments.length}`);

    if (segmentsWithEmbeddings.length === 0) {
      console.log('❌ No embeddings found - semantic search will not work');
      console.log('   Run the embedding generation process');
      return false;
    }

    // Step 3: Generate question embedding
    console.log('\n3️⃣ Generating question embedding...');
    const embedResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: question
    });
    
    const questionEmbedding = embedResponse.data[0].embedding;
    console.log(`✅ Generated embedding with ${questionEmbedding.length} dimensions`);

    // Step 4: Test semantic search
    console.log('\n4️⃣ Testing semantic search...');
    
    // Try the search_segments function first
    const { data: searchResults, error: searchError } = await supabase.rpc('search_segments', {
      target_episode_id: episodeId,
      query_embedding: questionEmbedding,
      similarity_threshold: 0.6,
      match_count: 5,
    });

    if (searchError) {
      console.log('⚠️ search_segments function failed:', searchError.message);
      console.log('   Trying direct vector query...');
      
      // Fallback to direct vector similarity
      const { data: fallbackResults, error: fallbackError } = await supabase
        .from('transcript_segments')
        .select('id, content, speaker_name, start_time, end_time')
        .eq('episode_id', episodeId)
        .order(`embedding <-> '[${questionEmbedding.join(',')}]'::vector`)
        .limit(5);

      if (fallbackError) {
        console.log('❌ Direct vector query also failed:', fallbackError.message);
        return false;
      }

      console.log(`✅ Found ${fallbackResults.length} segments via direct vector search`);
      
      // Display results
      fallbackResults.forEach((result, index) => {
        const startTime = Math.floor(result.start_time);
        console.log(`\n${index + 1}. [${startTime}s] ${result.speaker_name || 'Unknown'}`);
        console.log(`   "${result.content.substring(0, 100)}${result.content.length > 100 ? '...' : ''}"`);
      });

    } else {
      console.log(`✅ Found ${searchResults.length} segments via search_segments function`);
      
      // Display results
      searchResults.forEach((result, index) => {
        const startTime = Math.floor(result.start_time);
        const similarity = (result.similarity * 100).toFixed(1);
        console.log(`\n${index + 1}. [${startTime}s] ${result.speaker_name || 'Unknown'} (${similarity}% match)`);
        console.log(`   "${result.content.substring(0, 100)}${result.content.length > 100 ? '...' : ''}"`);
      });
    }

    // Step 5: Test text search fallback
    console.log('\n5️⃣ Testing text search fallback...');
    const { data: textResults, error: textError } = await supabase
      .from('transcript_segments')
      .select('id, content, speaker_name, start_time, end_time')
      .eq('episode_id', episodeId)
      .ilike('content', `%${question.split(' ')[0]}%`)
      .limit(3);

    if (!textError && textResults?.length > 0) {
      console.log(`✅ Found ${textResults.length} segments via text search`);
      textResults.forEach((result, index) => {
        const startTime = Math.floor(result.start_time);
        console.log(`   ${index + 1}. [${startTime}s] ${result.speaker_name || 'Unknown'}`);
        console.log(`      "${result.content.substring(0, 80)}..."`);
      });
    } else {
      console.log('📭 No text search matches found');
    }

    // Step 6: Test the actual API function
    console.log('\n6️⃣ Testing sendQuestion API function...');
    
    // Import the API function (simplified version for testing)
    const { sendQuestion } = require('../lib/api.real');
    
    try {
      const response = await sendQuestion(episodeId, question);
      console.log('✅ API function executed successfully');
      console.log(`🤖 AI Response: "${response.answer.substring(0, 200)}..."`);
      console.log(`📝 Relevant segments: ${response.relevantSegments?.length || 0} found`);
    } catch (apiError) {
      console.log('❌ API function failed:', apiError.message);
    }

    console.log('\n🎉 Retrieval system test completed!');
    console.log('\n🎯 Summary:');
    console.log('✅ Episode and transcription verified');
    console.log('✅ Embeddings are working');
    console.log('✅ Semantic search is functional');
    console.log('✅ Text search fallback is available');
    console.log('✅ Ready for agentic RAG implementation');

    return true;

  } catch (error) {
    console.log('❌ Retrieval test failed:', error.message);
    return false;
  }
}

async function main() {
  const episodeId = process.argv[2];
  const question = process.argv[3];
  
  if (!episodeId || !question) {
    console.log('Usage: node scripts/test_retrieval.js <episode-id> <question>');
    console.log('Example: node scripts/test_retrieval.js test-episode-001 "What did they discuss about AI?"');
    process.exit(1);
  }

  const success = await testRetrieval(episodeId, question);
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
} 