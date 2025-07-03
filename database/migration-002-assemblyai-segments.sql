-- Migration 002: AssemblyAI Segments Enhancement
-- Date: 2024-06-30
-- Purpose: Add AssemblyAI-specific columns to segments table

-- Update segments table for AssemblyAI compatibility
ALTER TABLE segments 
ADD COLUMN IF NOT EXISTS confidence DECIMAL(3,2) DEFAULT 0.9,
ADD COLUMN IF NOT EXISTS words JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS segment_type TEXT DEFAULT 'utterance',
ADD COLUMN IF NOT EXISTS language_code TEXT DEFAULT 'en';

-- Add indexes for enhanced querying
CREATE INDEX IF NOT EXISTS idx_segments_confidence ON segments(confidence);
CREATE INDEX IF NOT EXISTS idx_segments_type ON segments(segment_type);
CREATE INDEX IF NOT EXISTS idx_segments_language ON segments(language_code);
CREATE INDEX IF NOT EXISTS idx_segments_words ON segments USING GIN(words);

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_segments_episode_speaker_time ON segments(episode_id, speaker, timestamp_start);

-- Add check constraints for data quality (with existence check)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_confidence_range' 
        AND table_name = 'segments'
    ) THEN
        ALTER TABLE segments ADD CONSTRAINT chk_confidence_range 
        CHECK (confidence >= 0.0 AND confidence <= 1.0);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_timestamp_order' 
        AND table_name = 'segments'
    ) THEN
        ALTER TABLE segments ADD CONSTRAINT chk_timestamp_order 
        CHECK (timestamp_start <= timestamp_end);
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN segments.confidence IS 'Transcription confidence score from AssemblyAI (0.0-1.0)';
COMMENT ON COLUMN segments.words IS 'Word-level timestamps and confidence from AssemblyAI';
COMMENT ON COLUMN segments.segment_type IS 'Type: utterance, chapter, entity, etc.';
COMMENT ON COLUMN segments.language_code IS 'Detected language code for the segment';

-- Update existing segments to have default confidence if null
UPDATE segments 
SET confidence = 0.9 
WHERE confidence IS NULL; 