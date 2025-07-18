-- Migration 006: Supermemory Integration
-- Date: 2024-12-30
-- Purpose: Add Supermemory tracking columns to transcript_segments table

-- Add Supermemory tracking columns to transcript_segments
ALTER TABLE transcript_segments 
ADD COLUMN IF NOT EXISTS supermemory_id TEXT,
ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'completed', 'failed'));

-- Add indexes for efficient sync queries
CREATE INDEX IF NOT EXISTS idx_segments_sync_status ON transcript_segments(sync_status);
CREATE INDEX IF NOT EXISTS idx_segments_supermemory_id ON transcript_segments(supermemory_id);
CREATE INDEX IF NOT EXISTS idx_segments_synced_at ON transcript_segments(synced_at);

-- Add comments for documentation
COMMENT ON COLUMN transcript_segments.supermemory_id IS 'Supermemory memory ID for tracking';
COMMENT ON COLUMN transcript_segments.synced_at IS 'Timestamp when segment was synced to Supermemory';
COMMENT ON COLUMN transcript_segments.sync_status IS 'Sync status: pending, syncing, completed, failed';

-- Drop existing function if it exists (to handle column name change)
DROP FUNCTION IF EXISTS get_unsynced_segments(INTEGER);

-- Create function to get unsynced segments
CREATE OR REPLACE FUNCTION get_unsynced_segments(limit_count INTEGER DEFAULT 100)
RETURNS TABLE (
  id INTEGER,
  episode_id TEXT,
  content TEXT,
  speaker_name TEXT,
  start_time FLOAT8,
  end_time FLOAT8,
  embedding VECTOR(1536)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ts.id,
    ts.episode_id,
    ts.content,
    ts.speaker_name,
    ts.start_time,
    ts.end_time,
    ts.embedding
  FROM transcript_segments ts
  WHERE ts.sync_status = 'pending'
    AND ts.embedding IS NOT NULL
  ORDER BY ts.created_at
  LIMIT limit_count;
END;
$$;

-- Create function to update sync status
CREATE OR REPLACE FUNCTION update_segment_sync_status(
  segment_id INTEGER,
  new_status TEXT,
  supermemory_id_param TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE transcript_segments 
  SET 
    sync_status = new_status,
    supermemory_id = COALESCE(supermemory_id_param, supermemory_id),
    synced_at = CASE 
      WHEN new_status = 'completed' THEN NOW()
      ELSE synced_at
    END
  WHERE id = segment_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_unsynced_segments(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION update_segment_sync_status(INTEGER, TEXT, TEXT) TO service_role; 