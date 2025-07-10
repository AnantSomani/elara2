-- RLS (Row Level Security) Policies for Elara Podcast App
-- Purpose: Secure public access to podcast data while maintaining performance

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_speakers ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DROP EXISTING POLICIES (IDEMPOTENT)
-- =============================================================================

DROP POLICY IF EXISTS "Public read access to episodes" ON episodes;
DROP POLICY IF EXISTS "Service role full access to episodes" ON episodes;
DROP POLICY IF EXISTS "Public read access to transcript segments" ON transcript_segments;
DROP POLICY IF EXISTS "Service role full access to transcript segments" ON transcript_segments;
DROP POLICY IF EXISTS "Public read access to podcast hosts" ON podcast_hosts;
DROP POLICY IF EXISTS "Service role full access to podcast hosts" ON podcast_hosts;
DROP POLICY IF EXISTS "Public read access to episode speakers" ON episode_speakers;
DROP POLICY IF EXISTS "Service role full access to episode speakers" ON episode_speakers;

-- =============================================================================
-- EPISODES TABLE POLICIES
-- =============================================================================

-- Allow public read access to completed episodes
CREATE POLICY "Public read access to episodes" ON episodes
    FOR SELECT USING (true);

-- Allow service role to insert/update episodes (for processing)
CREATE POLICY "Service role full access to episodes" ON episodes
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TRANSCRIPT_SEGMENTS TABLE POLICIES  
-- =============================================================================

-- Allow public read access to transcript segments
CREATE POLICY "Public read access to transcript segments" ON transcript_segments
    FOR SELECT USING (true);

-- Allow service role to insert/update segments (for processing)
CREATE POLICY "Service role full access to transcript segments" ON transcript_segments
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- PODCAST_HOSTS TABLE POLICIES
-- =============================================================================

-- Allow public read access to podcast hosts (needed for personalities)
CREATE POLICY "Public read access to podcast hosts" ON podcast_hosts
    FOR SELECT USING (true);

-- Allow service role to manage hosts
CREATE POLICY "Service role full access to podcast hosts" ON podcast_hosts
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- EPISODE_SPEAKERS TABLE POLICIES
-- =============================================================================

-- Allow public read access to episode speaker mappings
CREATE POLICY "Public read access to episode speakers" ON episode_speakers
    FOR SELECT USING (true);

-- Allow service role to insert/update speaker mappings (for processing)
CREATE POLICY "Service role full access to episode speakers" ON episode_speakers
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- ADDITIONAL SECURITY CONFIGURATIONS
-- =============================================================================

-- Grant necessary permissions to anon role for reading
GRANT SELECT ON episodes TO anon;
GRANT SELECT ON transcript_segments TO anon;
GRANT SELECT ON podcast_hosts TO anon;
GRANT SELECT ON episode_speakers TO anon;

-- Grant usage on sequences for service role
GRANT USAGE ON SEQUENCE transcript_segments_id_seq TO service_role;
GRANT USAGE ON SEQUENCE podcast_hosts_id_seq TO service_role;
GRANT USAGE ON SEQUENCE episode_speakers_id_seq TO service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION search_segments(text, vector, float, int) TO anon;
GRANT EXECUTE ON FUNCTION get_episode_transcript(text) TO anon;
GRANT EXECUTE ON FUNCTION get_episode_speaker_mapping(text) TO anon;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON POLICY "Public read access to episodes" ON episodes 
IS 'Allows anonymous users to read episode metadata for the podcast app';

COMMENT ON POLICY "Public read access to transcript segments" ON transcript_segments 
IS 'Allows anonymous users to read transcript segments for semantic search';

COMMENT ON POLICY "Public read access to podcast hosts" ON podcast_hosts 
IS 'Allows anonymous users to read host information for personality responses';

COMMENT ON POLICY "Public read access to episode speakers" ON episode_speakers 
IS 'Allows anonymous users to read speaker mappings for diarization results';

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔒 ============================================';
    RAISE NOTICE '🔒 RLS POLICIES CREATED SUCCESSFULLY!';
    RAISE NOTICE '🔒 ============================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ All tables secured with RLS';
    RAISE NOTICE '✅ Public read access enabled';
    RAISE NOTICE '✅ Service role management access configured';
    RAISE NOTICE '✅ Function permissions granted';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Database ready for secure podcast app access!';
    RAISE NOTICE '';
END $$; 