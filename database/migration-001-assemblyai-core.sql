-- Migration 001: AssemblyAI Core Schema Changes
-- Date: 2024-06-30
-- Purpose: Add AssemblyAI-specific columns and processing logs table

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
CREATE TABLE IF NOT EXISTS processing_logs (
    id BIGSERIAL PRIMARY KEY,
    episode_id UUID REFERENCES episodes(id),
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