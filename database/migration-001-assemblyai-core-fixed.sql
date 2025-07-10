-- Migration 001: AssemblyAI Core Schema Changes (CORRECTED)
-- Date: 2024-12-30
-- Purpose: Add AssemblyAI-specific columns and processing logs table
-- Fixed: episode_id type changed from UUID to TEXT to match episodes.id

-- Add AssemblyAI columns to existing episodes table
ALTER TABLE episodes 
ADD COLUMN IF NOT EXISTS assemblyai_transcript_id TEXT,
ADD COLUMN IF NOT EXISTS assemblyai_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS speakers TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS episode_chapters JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS detected_entities JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS processing_metadata JSONB DEFAULT '{}';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_episodes_assemblyai_transcript_id ON episodes(assemblyai_transcript_id);
CREATE INDEX IF NOT EXISTS idx_episodes_assemblyai_status ON episodes(assemblyai_status);
CREATE INDEX IF NOT EXISTS idx_episodes_speakers ON episodes USING GIN(speakers);

-- Add processing logs table for debugging and audit trail
-- CORRECTED: Using TEXT for episode_id to match episodes.id type
CREATE TABLE IF NOT EXISTS processing_logs (
    id BIGSERIAL PRIMARY KEY,
    episode_id TEXT REFERENCES episodes(id),
    processing_type TEXT NOT NULL,
    status TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for processing logs
CREATE INDEX IF NOT EXISTS idx_processing_logs_episode_id ON processing_logs(episode_id);
CREATE INDEX IF NOT EXISTS idx_processing_logs_status ON processing_logs(status);
CREATE INDEX IF NOT EXISTS idx_processing_logs_type ON processing_logs(processing_type);
CREATE INDEX IF NOT EXISTS idx_processing_logs_created_at ON processing_logs(created_at);

-- Add comments for documentation
COMMENT ON COLUMN episodes.assemblyai_transcript_id IS 'AssemblyAI transcript ID for tracking';
COMMENT ON COLUMN episodes.assemblyai_status IS 'Status: pending, processing, completed, failed';
COMMENT ON COLUMN episodes.speakers IS 'Array of identified speaker names';
COMMENT ON COLUMN episodes.episode_chapters IS 'Auto-detected chapters from AssemblyAI';
COMMENT ON COLUMN episodes.detected_entities IS 'Named entities detected by AssemblyAI';
COMMENT ON COLUMN episodes.processing_metadata IS 'AssemblyAI processing metadata and config';

COMMENT ON TABLE processing_logs IS 'Audit trail for all podcast processing operations';
COMMENT ON COLUMN processing_logs.processing_type IS 'Type: assemblyai_transcription, embedding_generation, etc.';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎤 ======================================';
    RAISE NOTICE '🎤 AssemblyAI Core Migration Complete!';
    RAISE NOTICE '🎤 ======================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Added AssemblyAI columns to episodes table:';
    RAISE NOTICE '   - assemblyai_transcript_id (TEXT)';
    RAISE NOTICE '   - assemblyai_status (TEXT)';
    RAISE NOTICE '   - speakers (TEXT[])';
    RAISE NOTICE '   - episode_chapters (JSONB)';
    RAISE NOTICE '   - detected_entities (JSONB)';
    RAISE NOTICE '   - processing_metadata (JSONB)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Created processing_logs table:';
    RAISE NOTICE '   - episode_id (TEXT) → matches episodes.id';
    RAISE NOTICE '   - processing_type, status, metadata';
    RAISE NOTICE '   - created_at, updated_at timestamps';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready for AssemblyAI processing!';
    RAISE NOTICE '';
END $$; 