#!/usr/bin/env python3
"""
Quick fix: Add audio URL to processed episode for testing
"""

import os
import sys
from pathlib import Path

# Add the parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

# Import from the working processor
from scripts.direct_processor import DirectPodcastProcessor

# Create processor (this handles environment setup)
processor = DirectPodcastProcessor(enable_local_storage=False)
supabase = processor.supabase

episode_id = 'e6d8ed84-c6a3-42b9-9e3b-b6859cddeaf3'

# Use a test audio URL (this is a real working audio file)
test_audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

try:
    # Update the episode with a test audio URL
    result = supabase.table('episodes').update({
        'audio_url': test_audio_url
    }).eq('id', episode_id).execute()
    
    print(f"✅ Updated episode {episode_id} with test audio URL")
    print(f"🎵 Audio URL: {test_audio_url}")
    
    # Verify the update
    check = supabase.table('episodes').select('id, title, audio_url').eq('id', episode_id).single().execute()
    if check.data and check.data['audio_url']:
        print(f"✅ Verification successful: {check.data['title']}")
        print(f"🎵 Audio URL confirmed: {check.data['audio_url']}")
    else:
        print("❌ Verification failed - audio_url still empty")
        
except Exception as e:
    print(f"❌ Error: {e}") 