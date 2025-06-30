# Background Agents Setup Guide

This guide explains how to set up background agents for podcast processing in your ElaraV2 project.

## 🔧 Setup Options

### Option 1: GitHub Actions (Recommended)
Use GitHub Actions to run background processing workflows when triggered from your app.

#### Prerequisites
1. Push your code to a GitHub repository
2. Set up repository secrets
3. Configure the GitHub token in your app

#### Repository Secrets Setup

Go to your GitHub repo settings → Secrets and variables → Actions, and add:

```
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
HUGGINGFACE_TOKEN=your_huggingface_token
```

#### App Configuration

Add to your `.env` file:
```
EXPO_PUBLIC_GITHUB_TOKEN=your_github_personal_access_token
```

Create a GitHub Personal Access Token with these permissions:
- `repo` (for private repos) or `public_repo` (for public repos)
- `actions:write`

#### Usage in Your App

```typescript
import { triggerPodcastProcessing } from '../lib/github';

// When user submits a podcast URL
const handlePodcastSubmit = async (url: string, episodeId: string) => {
  const result = await triggerPodcastProcessing(url, episodeId);
  if (result.success) {
    console.log('Processing started in background');
  } else {
    console.error('Failed to start processing:', result.error);
  }
};
```

### Option 2: Dedicated Server
Deploy the processing script to a cloud server (AWS, GCP, DigitalOcean).

#### Server Setup
```bash
# On your server
git clone https://github.com/AnantSomani/elara2.git
cd elara2/scripts
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY=your_key
export SUPABASE_URL=your_url
export SUPABASE_SERVICE_KEY=your_key
export HUGGINGFACE_TOKEN=your_token

# Run processing
python process_podcast.py --url "podcast_url" --episode-id "episode_id"
```

#### Webhook Integration
Set up a webhook endpoint that triggers processing when called from your app.

### Option 3: Serverless Functions
Deploy to Vercel, Netlify, or AWS Lambda for serverless processing.

## 🚀 How It Works

1. **User submits podcast URL** in your app
2. **Episode record created** in Supabase with `processing_status: 'pending'`
3. **Background agent triggered** via GitHub Actions, webhook, or manual run
4. **Processing pipeline runs**:
   - Download audio from URL
   - Transcribe with WhisperX
   - Diarize speakers with Pyannote
   - Generate embeddings with OpenAI
   - Save segments to Supabase
5. **Status updated** to `'completed'` or `'failed'`

## 📁 File Structure

```
.github/workflows/
├── podcast-processing.yml      # GitHub Actions workflow

scripts/
├── process_podcast.py          # Main processing script
├── update_status.py           # Status update utility
├── requirements.txt           # Python dependencies
└── trigger_processing.js      # Trigger utility

lib/
└── github.ts                  # GitHub Actions integration
```

## 🔍 Monitoring

### Check Processing Status
```typescript
import { supabase } from '../lib/supabase';

const checkStatus = async (episodeId: string) => {
  const { data } = await supabase
    .from('episodes')
    .select('processing_status')
    .eq('id', episodeId)
    .single();
    
  return data?.processing_status;
};
```

### GitHub Actions Logs
View workflow runs in your GitHub repo:
`https://github.com/AnantSomani/elara2/actions`

## 🛠 Troubleshooting

### Common Issues

1. **Workflow not triggering**
   - Check GitHub token permissions
   - Verify repository secrets are set
   - Check workflow syntax

2. **Processing fails**
   - Check Hugging Face token for Pyannote access
   - Verify audio URL is accessible
   - Check Python dependencies

3. **Slow processing**
   - Large audio files take longer
   - Consider using GPU runners for faster processing
   - Implement chunking for very long episodes

### Debug Commands

```bash
# Test processing locally
python scripts/process_podcast.py \
  --url "https://example.com/podcast.mp3" \
  --episode-id "test-id"

# Check status
python scripts/update_status.py \
  --episode-id "test-id" \
  --status "completed"
```

## 💡 Advanced Features

### Batch Processing
Process multiple episodes in parallel:

```yaml
# Add to workflow
strategy:
  matrix:
    episode: ${{ fromJson(github.event.client_payload.episodes) }}
```

### Custom Models
Use different models for specific hosts:

```python
# In process_podcast.py
WHISPER_MODELS = {
  'all-in': 'large-v2',
  'tech-podcast': 'medium'
}
```

### Real-time Updates
Use Supabase real-time subscriptions to show progress in your app:

```typescript
const subscription = supabase
  .channel('episode-updates')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'episodes' },
    (payload) => console.log('Status update:', payload)
  )
  .subscribe();
``` 