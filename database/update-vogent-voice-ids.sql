-- Update Podcast Hosts with Vogent Speaker IDs
-- Replace the placeholder IDs below with your actual Vogent speaker IDs
-- EXPO_PUBLIC_CHAMATH_SPEAKER_ID=28b3e8a4-9e8f-4e98-a9a7-2e8734384408
-- EXPO_PUBLIC_SACKS_SPEAKER_ID=b33d7ea6-6cc9-4332-bb4d-fb37d612aa55  
-- EXPO_PUBLIC_FRIEDBERG_SPEAKER_ID=c1523713-1c69-42e8-b40d-4d28df1d8feb
-- EXPO_PUBLIC_CALACANIS_SPEAKER_ID=734518cc-3a1a-4f67-8eda-adfdaa546746
-- Update Chamath's voice ID
UPDATE podcast_hosts 
SET voice_id = '28b3e8a4-9e8f-4e98-a9a7-2e8734384408' 
WHERE name = 'Chamath';

-- Update Sacks' voice ID  
UPDATE podcast_hosts 
SET voice_id = 'b33d7ea6-6cc9-4332-bb4d-fb37d612aa55'
WHERE name = 'Sacks';

-- Update Friedberg's voice ID
UPDATE podcast_hosts 
SET voice_id = 'c1523713-1c69-42e8-b40d-4d28df1d8feb'
WHERE name = 'Friedberg';

-- Update Calacanis' voice ID
UPDATE podcast_hosts 
SET voice_id = '734518cc-3a1a-4f67-8eda-adfdaa546746'
WHERE name = 'Calacanis';

-- Verification query to check the updates
SELECT name, voice_id, description 
FROM podcast_hosts 
ORDER BY name;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎤 ========================================';
    RAISE NOTICE '🎤 VOGENT SPEAKER IDs UPDATED!';
    RAISE NOTICE '🎤 ========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Chamath speaker ID updated';
    RAISE NOTICE '✅ Sacks speaker ID updated';
    RAISE NOTICE '✅ Friedberg speaker ID updated';
    RAISE NOTICE '✅ Calacanis speaker ID updated';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 All hosts ready for Vogent TTS!';
    RAISE NOTICE '';
END $$; 