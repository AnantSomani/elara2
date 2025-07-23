require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

const SUPERMEMORY_API_KEY = process.env.SUPERMEMORY_API_KEY || process.env.EXPO_PUBLIC_SUPERMEMORY_API_KEY;
if (!SUPERMEMORY_API_KEY) {
  throw new Error('Supermemory API key not found in .env.local');
}
const SUPERMEMORY_API_URL = 'https://api.supermemory.com/v3/memories'; // or your endpoint

// Load your test data
const segments = JSON.parse(fs.readFileSync('test_segment.json', 'utf8'));

async function importSegment(segment) {
  // Only send required fields, ignore embedding and unnecessary fields
  const memory = {
    content: segment.content,
    metadata: {
      speaker_name: segment.speaker_name,
      episode_id: segment.episode_id,
      start_time: parseFloat(segment.start_time),
      end_time: parseFloat(segment.end_time),
      created_at: segment.created_at,
      // Optionally add more fields if needed, but do NOT include embedding
    },
    userId: 'elara-user',
    spaceId: 'elara-podcast-space',
    containerTags: ['elara', 'podcast', 'transcript'],
  };

  try {
    const res = await axios.post(SUPERMEMORY_API_URL, memory, {
      headers: {
        'Authorization': `Bearer ${SUPERMEMORY_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    console.log(`✅ Imported segment ${segment.id}:`, res.data);
  } catch (err) {
    console.error(`❌ Failed to import segment ${segment.id}:`, err.response?.data || err.message);
  }
}

(async () => {
  for (const segment of segments) {
    await importSegment(segment);
    await new Promise(r => setTimeout(r, 100)); // avoid rate limits
  }
})(); 