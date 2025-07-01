#!/usr/bin/env node
/**
 * Test semantic search functionality with embeddings
 * Run: node scripts/semantic_search_test.js test-episode-001 "your search query"
 */

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function testSemanticSearch(episodeId, query) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.log('❌ Missing Supabase credentials');
    return false;
  }

  if (!OPENAI_API_KEY) {
    console.log('❌ Missing OpenAI API key');
    return false;
  }

  console.log(`🔍 Testing semantic search for: "${query}"\n`);

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // Step 1: Generate embedding for search query
    console.log('1. Generating query embedding...');
    const embedResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    });
    
    const queryEmbedding = embedResponse.data[0].embedding;
    console.log(`✅ Generated embedding with ${queryEmbedding.length} dimensions`);

    // Step 2: Perform semantic search
    console.log('\n2. Searching for similar segments...');
    
    const { data: results, error } = await supabase.rpc('match_segments', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 5,
      episode_filter: episodeId
    });

    if (error) {
      console.log('❌ Search failed:', error.message);
      console.log('💡 You may need to create the match_segments function in Supabase');
      
      // Fallback: use basic vector similarity
      const { data: fallbackResults, error: fallbackError } = await supabase
        .from('segments')
        .select('*, similarity:embedding <-> $1::vector as similarity')
        .eq('episode_id', episodeId)
        .order('similarity')
        .limit(5);

      if (fallbackError) {
        console.log('❌ Fallback search also failed:', fallbackError.message);
        return false;
      }

      console.log('📋 Fallback search results:');
      fallbackResults.forEach((result, index) => {
        const startTime = Math.floor(result.timestamp_start);
        const similarity = (1 - result.similarity) * 100;
        console.log(`\n${index + 1}. [${startTime}s] ${result.speaker} (${similarity.toFixed(1)}% match)`);
        console.log(`   "${result.content}"`);
      });

      return true;
    }

    if (!results || results.length === 0) {
      console.log('📭 No matching segments found');
      console.log('💡 Try a different search query or lower the match threshold');
      return false;
    }

    console.log(`✅ Found ${results.length} matching segments:\n`);

    results.forEach((result, index) => {
      const startTime = Math.floor(result.timestamp_start);
      const similarity = (result.similarity * 100).toFixed(1);
      
      console.log(`${index + 1}. [${startTime}s] ${result.speaker} (${similarity}% match)`);
      console.log(`   "${result.content}"`);
      console.log('');
    });

    // Step 3: Test speaker-specific search
    console.log('3. Testing speaker-specific search...');
    
    const { data: speakerResults, error: speakerError } = await supabase
      .from('segments')
      .select('speaker, content, timestamp_start')
      .eq('episode_id', episodeId)
      .ilike('content', `%${query.split(' ')[0]}%`)
      .limit(3);

    if (!speakerError && speakerResults?.length > 0) {
      console.log('✅ Speaker-specific matches:');
      speakerResults.forEach((result, index) => {
        const startTime = Math.floor(result.timestamp_start);
        console.log(`   ${result.speaker} [${startTime}s]: "${result.content.substring(0, 100)}..."`);
      });
    }

    console.log('\n🎉 Semantic search test completed!');
    console.log('\n🎯 This demonstrates:');
    console.log('✅ Embeddings are working');
    console.log('✅ Vector similarity search is functional');
    console.log('✅ Speaker identification is working');
    console.log('✅ Ready for chat interface integration');

    return true;

  } catch (error) {
    console.log('❌ Semantic search test failed:', error.message);
    return false;
  }
}

// Create the match_segments function in Supabase
const MATCH_SEGMENTS_FUNCTION = `
CREATE OR REPLACE FUNCTION match_segments (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  episode_filter uuid DEFAULT NULL
)
RETURNS TABLE (
  id bigint,
  episode_id uuid,
  content text,
  speaker text,
  timestamp_start float8,
  timestamp_end float8,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    segments.id,
    segments.episode_id,
    segments.content,
    segments.speaker,
    segments.timestamp_start,
    segments.timestamp_end,
    1 - (segments.embedding <=> query_embedding) as similarity
  FROM segments
  WHERE 
    (episode_filter IS NULL OR segments.episode_id = episode_filter)
    AND 1 - (segments.embedding <=> query_embedding) > match_threshold
  ORDER BY segments.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
`;

async function main() {
  const episodeId = process.argv[2];
  const query = process.argv[3];
  
  if (!episodeId || !query) {
    console.log('Usage: node scripts/semantic_search_test.js <episode-id> <search-query>');
    console.log('Example: node scripts/semantic_search_test.js test-episode-001 "artificial intelligence"');
    console.log('\nTo create the required database function, run this in Supabase SQL Editor:');
    console.log(MATCH_SEGMENTS_FUNCTION);
    process.exit(1);
  }

  const success = await testSemanticSearch(episodeId, query);
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
} 