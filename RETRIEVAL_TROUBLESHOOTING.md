# Agentic RAG Retrieval System Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. **"No segments found" or "No embeddings found"**

**Symptoms:**
- Semantic search returns no results
- API returns empty relevant segments
- Test script shows 0 segments with embeddings

**Causes:**
- Episode transcription not completed
- Embeddings not generated during processing
- Database functions not properly set up
- Vector extension not enabled

**Solutions:**

1. **Check episode status:**
   ```bash
   node scripts/test_retrieval.js <episode-id> "test question"
   ```

2. **Verify transcription completion:**
   ```sql
   SELECT id, title, transcription_status, processing_status 
   FROM episodes 
   WHERE id = 'your-episode-id';
   ```

3. **Check embedding coverage:**
   ```sql
   SELECT * FROM check_episode_embeddings('your-episode-id');
   ```

4. **Re-run embedding generation:**
   ```bash
   # If using the processing API
   curl -X POST http://localhost:8000/process \
     -H "Content-Type: application/json" \
     -d '{"youtube_url": "your-url", "episode_id": "your-episode-id", "force_reprocess": true}'
   ```

### 2. **"search_segments function failed"**

**Symptoms:**
- Database function errors
- Vector search not working
- Fallback to text search only
- Memory errors: "memory required is X MB, maintenance_work_mem is Y MB"

**Causes:**
- Database function not created
- Wrong function signature
- Missing permissions
- Vector extension issues
- **Supabase free tier memory limits** (most common)

**Solutions:**

1. **For memory errors (Supabase free tier):**
   ```sql
   -- Use the memory-efficient version instead
   -- Copy and paste the contents of database/fix-retrieval-functions-memory-efficient.sql
   -- into your Supabase SQL Editor
   ```

2. **For other function errors:**
   ```sql
   -- Copy and paste the contents of database/fix-retrieval-functions.sql
   -- into your Supabase SQL Editor
   ```

2. **Verify function exists:**
   ```sql
   SELECT routine_name, routine_type 
   FROM information_schema.routines 
   WHERE routine_name IN ('search_segments', 'match_segments');
   ```

3. **Test function manually:**
   ```sql
   -- Generate a test embedding first, then:
   SELECT * FROM search_segments('your-episode-id', '[0.1,0.2,...]'::vector, 0.6, 5);
   ```

### 3. **"Vector similarity query failed"**

**Symptoms:**
- Direct vector queries fail
- Embedding format issues
- Dimension mismatches

**Causes:**
- Wrong embedding format
- Dimension mismatch (should be 1536)
- Vector extension not properly configured

**Solutions:**

1. **Check embedding dimensions:**
   ```sql
   SELECT id, array_length(embedding, 1) as dimensions 
   FROM transcript_segments 
   WHERE episode_id = 'your-episode-id' 
   AND embedding IS NOT NULL 
   LIMIT 5;
   ```

2. **Verify vector extension:**
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

3. **Check embedding format:**
   ```sql
   SELECT id, embedding[1:5] as sample_values 
   FROM transcript_segments 
   WHERE episode_id = 'your-episode-id' 
   AND embedding IS NOT NULL 
   LIMIT 1;
   ```

### 4. **"API function failed"**

**Symptoms:**
- sendQuestion function throws errors
- No AI response generated
- Context not found

**Causes:**
- Missing API keys
- Network issues
- Function import problems
- Data format mismatches

**Solutions:**

1. **Check environment variables:**
   ```bash
   echo $EXPO_PUBLIC_OPENAI_API_KEY
   echo $EXPO_PUBLIC_SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```

2. **Test API keys individually:**
   ```bash
   # Test OpenAI
   curl -H "Authorization: Bearer $EXPO_PUBLIC_OPENAI_API_KEY" \
     https://api.openai.com/v1/models
   
   # Test Supabase
   curl -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
     "$EXPO_PUBLIC_SUPABASE_URL/rest/v1/episodes?select=id&limit=1"
   ```

3. **Check function imports:**
   ```javascript
   // In your test script, verify imports work:
   const { sendQuestion } = require('../lib/api.real');
   console.log('Function imported:', typeof sendQuestion);
   ```

## 🔧 Step-by-Step Debugging Process

### Step 1: Environment Setup
```bash
# 1. Check all required environment variables
cat .env.local | grep -E "(OPENAI|SUPABASE|CLAUDE)"

# 2. Verify API keys are valid
node scripts/test_retrieval.js <episode-id> "test"
```

### Step 2: Database Verification
```sql
-- 1. Check episode exists and has transcription
SELECT id, title, transcription_status, processing_status 
FROM episodes 
WHERE id = 'your-episode-id';

-- 2. Check segments exist
SELECT COUNT(*) as total_segments 
FROM transcript_segments 
WHERE episode_id = 'your-episode-id';

-- 3. Check embeddings exist
SELECT COUNT(*) as segments_with_embeddings 
FROM transcript_segments 
WHERE episode_id = 'your-episode-id' 
AND embedding IS NOT NULL;
```

### Step 3: Function Testing
```bash
# 1. Test the retrieval system
node scripts/test_retrieval.js <episode-id> "What did they discuss?"

# 2. Test semantic search specifically
node scripts/semantic_search_test.js <episode-id> "artificial intelligence"

# 3. Test database connectivity
node scripts/test_database.js <episode-id>
```

### Step 4: API Testing
```bash
# 1. Test the processing API
curl -X POST http://localhost:8000/process \
  -H "Content-Type: application/json" \
  -d '{"youtube_url": "your-url", "episode_id": "your-episode-id"}'

# 2. Test the status endpoint
curl http://localhost:8000/status/your-episode-id
```

## 🎯 Quick Fixes for Common Scenarios

### Scenario 1: Fresh Installation
```bash
# 1. Set up database functions
# Copy database/fix-retrieval-functions.sql to Supabase SQL Editor

# 2. Process a test episode
node test-direct-api.js

# 3. Test retrieval
node scripts/test_retrieval.js <episode-id> "test question"
```

### Scenario 2: Existing Data, No Retrieval
```bash
# 1. Check embedding coverage
# Run the SQL query from Step 2 above

# 2. If no embeddings, regenerate them
# Re-run the processing pipeline with force_reprocess: true

# 3. Test retrieval again
node scripts/test_retrieval.js <episode-id> "test question"
```

### Scenario 3: Retrieval Works, API Fails
```bash
# 1. Check API keys
echo $EXPO_PUBLIC_OPENAI_API_KEY

# 2. Test individual components
node -e "
const { generateEmbedding } = require('./lib/openai');
generateEmbedding('test').then(console.log).catch(console.error);
"

# 3. Check function imports
node -e "
const { sendQuestion } = require('./lib/api.real');
console.log('Function available:', typeof sendQuestion);
"
```

## 📊 Monitoring and Logs

### Key Metrics to Monitor:
- **Embedding Coverage**: Should be >90% for good retrieval
- **Search Response Time**: Should be <500ms for semantic search
- **Match Quality**: Similarity scores should be >0.6 for good matches
- **API Success Rate**: Should be >95% for production

### Useful Queries:
```sql
-- Check overall system health
SELECT 
  COUNT(*) as total_episodes,
  COUNT(*) FILTER (WHERE transcription_status = 'completed') as transcribed_episodes,
  COUNT(*) FILTER (WHERE processing_status = 'completed') as processed_episodes
FROM episodes;

-- Check embedding coverage across all episodes
SELECT 
  episode_id,
  COUNT(*) as total_segments,
  COUNT(*) FILTER (WHERE embedding IS NOT NULL) as segments_with_embeddings,
  ROUND((COUNT(*) FILTER (WHERE embedding IS NOT NULL)::FLOAT / COUNT(*)::FLOAT) * 100, 2) as coverage_percent
FROM transcript_segments 
GROUP BY episode_id 
ORDER BY coverage_percent DESC;
```

## 🆘 Still Stuck?

If you're still experiencing issues after following this guide:

1. **Check the logs**: Look for specific error messages in your console
2. **Verify data**: Ensure you have at least one episode with completed transcription
3. **Test incrementally**: Start with the database functions, then add API layers
4. **Check versions**: Ensure all dependencies are up to date
5. **Review the test scripts**: They provide detailed debugging information

The test scripts will help identify exactly where the issue is occurring in your retrieval pipeline. 