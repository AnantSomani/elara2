#!/usr/bin/env node
/**
 * Test script to verify database results after podcast processing
 * Run: node scripts/test_database.js test-episode-001
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function testDatabase(episodeId) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.log('❌ Missing Supabase credentials');
    console.log('   Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables');
    return false;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  console.log(`🔍 Testing database results for episode: ${episodeId}\n`);

  try {
    // Test 1: Check episode exists
    console.log('1. Checking episode record...');
    const { data: episode, error: episodeError } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', episodeId)
      .single();

    if (episodeError || !episode) {
      console.log('❌ Episode not found in database');
      console.log('   Make sure the workflow completed successfully');
      return false;
    }

    console.log('✅ Episode found!');
    console.log(`   Title: ${episode.title || 'N/A'}`);
    console.log(`   Status: ${episode.processing_status}`);
    console.log(`   Duration: ${episode.duration_seconds ? Math.floor(episode.duration_seconds / 60) + ' minutes' : 'N/A'}`);
    console.log(`   Has transcript: ${episode.transcript ? 'Yes' : 'No'}`);

    if (episode.processing_status !== 'completed') {
      console.log(`⚠️  Episode status is '${episode.processing_status}', not 'completed'`);
      if (episode.processing_status === 'failed') {
        console.log('   Check GitHub Actions logs for error details');
      }
      return false;
    }

    // Test 2: Check segments
    console.log('\n2. Checking transcript segments...');
    const { data: segments, error: segmentsError } = await supabase
      .from('segments')
      .select('*')
      .eq('episode_id', episodeId)
      .order('timestamp_start');

    if (segmentsError || !segments || segments.length === 0) {
      console.log('❌ No segments found');
      console.log('   The transcription/diarization may have failed');
      return false;
    }

    console.log(`✅ Found ${segments.length} transcript segments`);
    
    // Show sample segments
    console.log('\n📝 Sample segments:');
    segments.slice(0, 3).forEach((segment, index) => {
      const startTime = Math.floor(segment.timestamp_start);
      const endTime = Math.floor(segment.timestamp_end);
      const duration = endTime - startTime;
      
      console.log(`   ${index + 1}. [${startTime}s-${endTime}s] ${segment.speaker}`);
      console.log(`      "${segment.content.substring(0, 80)}${segment.content.length > 80 ? '...' : ''}"`);
      console.log(`      Has embedding: ${segment.embedding ? 'Yes' : 'No'}`);
    });

    // Test 3: Check speaker distribution
    console.log('\n3. Analyzing speakers...');
    const speakerCounts = {};
    segments.forEach(segment => {
      speakerCounts[segment.speaker] = (speakerCounts[segment.speaker] || 0) + 1;
    });

    console.log('✅ Speaker distribution:');
    Object.entries(speakerCounts).forEach(([speaker, count]) => {
      const percentage = ((count / segments.length) * 100).toFixed(1);
      console.log(`   ${speaker}: ${count} segments (${percentage}%)`);
    });

    // Test 4: Check embeddings
    console.log('\n4. Checking embeddings...');
    const segmentsWithEmbeddings = segments.filter(s => s.embedding && s.embedding.length > 0);
    console.log(`✅ ${segmentsWithEmbeddings.length}/${segments.length} segments have embeddings`);

    if (segmentsWithEmbeddings.length > 0) {
      const sampleEmbedding = segmentsWithEmbeddings[0].embedding;
      console.log(`   Embedding dimensions: ${sampleEmbedding.length}`);
      console.log(`   Sample values: [${sampleEmbedding.slice(0, 3).map(v => v.toFixed(3)).join(', ')}...]`);
    }

    // Test 5: Check podcast hosts table
    console.log('\n5. Checking podcast hosts...');
    const { data: hosts, error: hostsError } = await supabase
      .from('podcast_hosts')
      .select('*');

    if (hostsError || !hosts || hosts.length === 0) {
      console.log('❌ No podcast hosts found');
    } else {
      console.log(`✅ Found ${hosts.length} podcast hosts:`);
      hosts.forEach(host => {
        console.log(`   - ${host.name}: ${host.description?.substring(0, 50)}...`);
      });
    }

    console.log('\n🎉 Database test completed successfully!');
    console.log('\n🎯 Next steps:');
    console.log('1. Test semantic search with embeddings');
    console.log('2. Build chat interface using this data');
    console.log('3. Implement voice responses with ElevenLabs');

    return true;

  } catch (error) {
    console.log('❌ Database test failed:', error.message);
    return false;
  }
}

async function main() {
  const episodeId = process.argv[2];
  
  if (!episodeId) {
    console.log('Usage: node scripts/test_database.js <episode-id>');
    console.log('Example: node scripts/test_database.js test-episode-001');
    process.exit(1);
  }

  const success = await testDatabase(episodeId);
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
} 