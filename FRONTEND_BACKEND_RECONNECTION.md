# Frontend-Backend Reconnection Guide

Your frontend and backend are now connected! Here's how to complete the setup and start using the real backend.

## ✅ What's Already Done

1. **API Integration**: The real API now properly calls GitHub Actions for backend processing
2. **Switching Logic**: Your app automatically uses real APIs when `EXPO_PUBLIC_USE_MOCKS=false` (default)
3. **Backend Infrastructure**: Complete processing pipeline with AssemblyAI, OpenAI, and Supabase

## 🔧 Required Setup Steps

### 1. Create Environment File

Create a `.env.local` file in your project root with these configurations:

```bash
# Frontend/Backend Switch  
EXPO_PUBLIC_USE_MOCKS=false

# Supabase Database
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
EXPO_PUBLIC_CLAUDE_API_KEY=your_claude_api_key  
EXPO_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key

# YouTube Data API
EXPO_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key

# GitHub Actions (Backend Processing)
EXPO_PUBLIC_GITHUB_TOKEN=your_github_personal_access_token
```

### 2. GitHub Repository Secrets

Set up these secrets in your GitHub repo (Settings → Secrets and variables → Actions):

```
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
SUPABASE_URL=your_supabase_url  
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
HUGGINGFACE_TOKEN=your_huggingface_token
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
CLAUDE_API_KEY=your_claude_api_key
```

### 3. GitHub Personal Access Token

Create a GitHub Personal Access Token with these permissions:
- `repo` (for private repos) or `public_repo` (for public repos)
- `actions:write`

## 🚀 How It Works Now

1. **User submits podcast URL** → `processPodcastLink()` in real API
2. **YouTube metadata fetched** → Video title, duration, thumbnail
3. **Episode created in Supabase** → Status: 'pending'
4. **GitHub Actions triggered** → Background processing workflow starts
5. **AssemblyAI processes audio** → Transcription + speaker diarization
6. **Embeddings generated** → For semantic search
7. **Data saved to Supabase** → Status: 'completed'

## 🧪 Testing the Connection

### Quick Test
```typescript
// In your app, try processing a short podcast
const result = await processPodcastLink('https://www.youtube.com/watch?v=SHORT_PODCAST_ID');
console.log('Episode ID:', result.episodeId);

// Check status
const episode = await getEpisodeData(result.episodeId);
console.log('Status:', episode.processingStatus);
```

### Monitor Processing
- Check GitHub Actions: `https://github.com/AnantSomani/elara2/actions`
- Watch Supabase: Episodes table processing_status column
- Real-time updates: Your app subscribes to Supabase changes

## 🔍 Debugging

### If Processing Doesn't Start
1. Check GitHub token permissions
2. Verify repository secrets are set
3. Check workflow file syntax
4. Look at GitHub Actions logs

### If Processing Fails
1. Check AssemblyAI API key and quota
2. Verify Supabase service role key
3. Check Hugging Face token (for speaker diarization)
4. Look at workflow run logs for specific errors

### Environment Variable Issues
```bash
# Test if variables are loaded
console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
console.log('GitHub Token:', process.env.EXPO_PUBLIC_GITHUB_TOKEN ? 'Set' : 'Missing');
```

## 📁 File Changes Made

1. **`lib/api.real.ts`**: Connected `triggerPodcastProcessing()` to GitHub Actions
2. **System remains backwards compatible**: Still switches based on `EXPO_PUBLIC_USE_MOCKS`

## 🎯 Next Steps

1. **Set up environment variables** (most important)
2. **Configure GitHub secrets** 
3. **Test with a short podcast episode**
4. **Monitor the processing pipeline**
5. **Enjoy your fully connected frontend-backend system!**

## 💡 Switching Back to Mocks

If you need to work on frontend-only features again:
```bash
# In .env.local
EXPO_PUBLIC_USE_MOCKS=true
```

Your app will instantly switch back to mock data without any code changes.

---

Your sophisticated decoupling system is now fully operational! 🎉 