# Elara2 Database Migrations

This directory contains SQL migration files for the Elara2 podcast app database schema.

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** tab
3. Copy and paste the contents of each migration file **in order**:
   - `001_podcast_transcription_schema.sql`
   - `002_transcript_rls_policies.sql`
4. Click **Run** for each migration

### Option 2: Supabase CLI
```bash
# If you have Supabase CLI set up locally
supabase db push
```

## Migration Files

### 001_podcast_transcription_schema.sql
**Main migration** that adds:
- Transcription columns to `episodes` table:
  - `assemblyai_transcript_id`, `assemblyai_status` 
  - `transcript_id`, `transcription_status`
  - `speakers`, `episode_chapters`, `detected_entities`
  - `processing_metadata`, `published_at`
- New `transcript_segments` table for semantic search
- New `processing_logs` table for audit trail
- Helper functions for transcript operations
- Performance indexes

### 002_transcript_rls_policies.sql
**Security setup** that adds:
- Row Level Security (RLS) policies for new tables
- Proper permissions for public/authenticated/service roles
- Sequence permissions for auto-incrementing IDs

## What These Migrations Enable

✅ **AssemblyAI Integration**: Full transcription workflow with status tracking  
✅ **Semantic Search**: Vector embeddings for episode content search  
✅ **Speaker Identification**: Support for diarized transcript segments  
✅ **Podcast Metadata**: Episode chapters, entities, publish dates  
✅ **Processing Audit**: Complete logs of transcription operations  
✅ **Security**: Proper RLS policies for public app usage  

## After Running Migrations

Once you've applied these migrations, you can:
1. Continue with fixing the TypeScript errors in the app
2. Test the podcast transcription pipeline end-to-end
3. Verify that episodes can be processed with real audio URLs

## Verification

After running the migrations, you can verify they worked by running this query in the SQL Editor:

```sql
-- Check that new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'episodes' 
AND column_name IN ('assemblyai_transcript_id', 'transcription_status', 'published_at');

-- Check that new tables exist  
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('transcript_segments', 'processing_logs');
```

You should see the new columns and tables listed in the results. 