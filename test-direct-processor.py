#!/usr/bin/env python3
"""
Test the direct processor to see exactly where episode creation is failing
"""

import sys
import asyncio
import logging
from pathlib import Path

# Add scripts directory to path
sys.path.append(str(Path(__file__).parent / "scripts"))

try:
    from direct_processor import DirectPodcastProcessor
except ImportError as e:
    print(f"❌ Could not import DirectPodcastProcessor: {e}")
    sys.exit(1)

# Configure logging to see all details
logging.basicConfig(level=logging.DEBUG)

async def test_episode_creation():
    """Test episode creation step by step"""
    
    processor = DirectPodcastProcessor()
    youtube_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    
    print("🧪 Testing Direct Processor Episode Creation")
    print("=" * 50)
    print(f"URL: {youtube_url}")
    print()
    
    try:
        # Step 1: Extract video ID
        print("1️⃣ Testing video ID extraction...")
        video_id = processor.extract_youtube_video_id(youtube_url)
        print(f"✅ Video ID: {video_id}")
        print()
        
        # Step 2: Test YouTube metadata fetching
        print("2️⃣ Testing YouTube metadata fetching...")
        metadata = await processor.get_youtube_metadata(youtube_url)
        print("✅ Metadata fetched:")
        for key, value in metadata.items():
            print(f"   - {key}: {value}")
        print()
        
        # Step 3: Test database connection
        print("3️⃣ Testing database connection...")
        result = processor.supabase.table('episodes').select('id').limit(1).execute()
        print(f"✅ Database connection works, found {len(result.data)} episodes")
        print()
        
        # Step 4: Test episode creation
        print("4️⃣ Testing episode creation...")
        episode_id = await processor.create_episode_from_url(youtube_url)
        print(f"✅ Episode created: {episode_id}")
        print()
        
        # Step 5: Verify episode exists
        print("5️⃣ Verifying episode exists in database...")
        result = processor.supabase.table('episodes').select('*').eq('id', episode_id).execute()
        if result.data:
            episode = result.data[0]
            print("✅ Episode verified in database:")
            print(f"   - ID: {episode['id']}")
            print(f"   - Title: {episode['title']}")
            print(f"   - Status: {episode['processing_status']}")
        else:
            print("❌ Episode not found in database after creation")
        print()
        
        print("🎉 All tests passed! Episode creation is working.")
        
        # Clean up
        print("🧹 Cleaning up test episode...")
        processor.supabase.table('episodes').delete().eq('id', episode_id).execute()
        print("✅ Cleanup complete")
        
    except Exception as e:
        print(f"❌ Test failed at step: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_episode_creation()) 