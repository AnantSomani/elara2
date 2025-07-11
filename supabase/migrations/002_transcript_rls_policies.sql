-- Migration 002: Row Level Security for Transcription Tables
-- Date: 2024-12-30
-- Purpose: Enable RLS and create policies for transcript_segments and processing_logs

-- Enable RLS on transcript_segments table
ALTER TABLE transcript_segments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on processing_logs table  
ALTER TABLE processing_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Public read access to transcript segments" ON transcript_segments;
DROP POLICY IF EXISTS "Service role full access to transcript segments" ON transcript_segments;
DROP POLICY IF EXISTS "Public read access to processing logs" ON processing_logs;
DROP POLICY IF EXISTS "Service role full access to processing logs" ON processing_logs;

-- Transcript segments policies
CREATE POLICY "Public read access to transcript segments" ON transcript_segments
    FOR SELECT USING (true);

CREATE POLICY "Service role full access to transcript segments" ON transcript_segments
    FOR ALL USING (auth.role() = 'service_role');

-- Processing logs policies  
CREATE POLICY "Public read access to processing logs" ON processing_logs
    FOR SELECT USING (true);

CREATE POLICY "Service role full access to processing logs" ON processing_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT SELECT ON transcript_segments TO anon;
GRANT SELECT ON transcript_segments TO authenticated;
GRANT ALL ON transcript_segments TO service_role;

GRANT SELECT ON processing_logs TO anon;
GRANT SELECT ON processing_logs TO authenticated;
GRANT ALL ON processing_logs TO service_role;

-- Grant sequence permissions for inserts
GRANT USAGE, SELECT ON SEQUENCE transcript_segments_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE transcript_segments_id_seq TO authenticated;
GRANT ALL ON SEQUENCE transcript_segments_id_seq TO service_role;

GRANT USAGE, SELECT ON SEQUENCE processing_logs_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE processing_logs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE processing_logs_id_seq TO service_role; 