const fs = require('fs');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

// Supermemory API configuration
const SUPERMEMORY_API_KEY = process.env.SUPERMEMORY_API_KEY;
const SUPERMEMORY_BASE_URL = 'https://api.supermemory.ai/v3';

if (!SUPERMEMORY_API_KEY) {
  console.error('❌ SUPERMEMORY_API_KEY not found in .env.local');
  process.exit(1);
}

async function addMemoryToSupermemory(memoryData) {
  try {
    const response = await fetch(`${SUPERMEMORY_BASE_URL}/memories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPERMEMORY_API_KEY}`
      },
      body: JSON.stringify({
        content: memoryData.content,
        metadata: {
          source: 'podcast_transcript',
          episode_id: memoryData.episode_id,
          speaker_name: memoryData.speaker_name,
          start_time: memoryData.start_time,
          end_time: memoryData.end_time,
          segment_id: memoryData.id
        },
        containerTags: ['elara_podcast', `episode_${memoryData.episode_id}`],
        userId: 'elara_user'
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Failed to add memory:`, result);
      return { success: false, error: result };
    }

    console.log(`✅ Memory added successfully: ${result.id}`);
    return { success: true, id: result.id, status: result.status };
  } catch (error) {
    console.error(`❌ Error adding memory:`, error.message);
    return { success: false, error: error.message };
  }
}

async function importTranscriptSegments() {
  try {
    // Read the transcript segments JSON file
    const segmentsData = JSON.parse(fs.readFileSync('transcript_segments.json', 'utf8'));
    
    console.log(`📊 Found ${segmentsData.length} transcript segments to import`);
    console.log(`🔑 Using API Key: ${SUPERMEMORY_API_KEY.substring(0, 10)}...`);
    console.log(`🌐 API Base URL: ${SUPERMEMORY_BASE_URL}`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    // Process segments in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < segmentsData.length; i += batchSize) {
      const batch = segmentsData.slice(i, i + batchSize);
      
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(segmentsData.length / batchSize)} (segments ${i + 1}-${Math.min(i + batchSize, segmentsData.length)})`);
      
      // Process batch in parallel
      const promises = batch.map(async (segment, index) => {
        const segmentIndex = i + index + 1;
        console.log(`  📝 Processing segment ${segmentIndex}/${segmentsData.length}: "${segment.content.substring(0, 50)}..."`);
        
        const result = await addMemoryToSupermemory(segment);
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
        
        return result;
      });

      const results = await Promise.all(promises);
      
      // Log batch results
      const batchSuccess = results.filter(r => r.success).length;
      const batchErrors = results.filter(r => !r.success).length;
      console.log(`  ✅ Batch complete: ${batchSuccess} success, ${batchErrors} errors`);
      
      // Add a small delay between batches to be respectful to the API
      if (i + batchSize < segmentsData.length) {
        console.log('  ⏳ Waiting 1 second before next batch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('');
    }

    console.log('🎉 Import completed!');
    console.log(`📈 Summary:`);
    console.log(`   ✅ Successful imports: ${successCount}`);
    console.log(`   ❌ Failed imports: ${errorCount}`);
    console.log(`   📊 Total processed: ${successCount + errorCount}`);
    
    if (errorCount > 0) {
      console.log(`\n⚠️  ${errorCount} segments failed to import. Check the logs above for details.`);
    }

  } catch (error) {
    console.error('❌ Error reading transcript segments file:', error.message);
    process.exit(1);
  }
}

// Test with a single memory first
async function testSingleMemory() {
  console.log('🧪 Testing with a single memory...');
  
  const testMemory = {
    content: "This is a test memory from Elara podcast app to verify Supermemory integration is working correctly.",
    episode_id: "test_episode",
    speaker_name: "Test Speaker",
    start_time: "00:00:00",
    end_time: "00:00:30",
    id: "test_segment_001"
  };

  const result = await addMemoryToSupermemory(testMemory);
  
  if (result.success) {
    console.log('✅ Test memory added successfully!');
    console.log(`   Memory ID: ${result.id}`);
    console.log(`   Status: ${result.status}`);
    console.log('\n🎯 You should now see this memory in your Supermemory dashboard.');
    console.log('   Check your dashboard at https://supermemory.ai/');
  } else {
    console.log('❌ Test memory failed to add.');
    console.log('   Error:', result.error);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    await testSingleMemory();
  } else {
    await importTranscriptSegments();
  }
}

main().catch(console.error); 