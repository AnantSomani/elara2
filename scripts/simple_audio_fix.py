#!/usr/bin/env python3
"""
Simple script to add audio URL to episode
"""

import os
import sys
from pathlib import Path

# Load environment variables from .env.local file
def load_env_file():
    env_file = Path(__file__).parent.parent / '.env.local'
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value
        print(f"✅ Loaded environment from {env_file}")
    else:
        print(f"❌ .env.local file not found at {env_file}")

# Load the .env.local file
load_env_file()

# Check if environment variables are set
supabase_url = os.getenv('EXPO_PUBLIC_SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

print(f"\n🔍 Environment check:")
print(f"  EXPO_PUBLIC_SUPABASE_URL: {'✅ Set' if supabase_url else '❌ Missing'}")
print(f"  SUPABASE_SERVICE_ROLE_KEY: {'✅ Set' if supabase_key else '❌ Missing'}")

if supabase_url:
    print(f"  URL: {supabase_url[:30]}...")
if supabase_key:
    print(f"  Key: {supabase_key[:30]}...")

if not supabase_url or not supabase_key:
    print("\n❌ Missing environment variables!")
    print("Check your .env.local file for:")
    print("  EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co")
    print("  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key")
    sys.exit(1)

try:
    from supabase import create_client
    
    print(f"\n🔗 Connecting to Supabase...")
    supabase = create_client(supabase_url, supabase_key)
    
    episode_id = 'e6d8ed84-c6a3-42b9-9e3b-b6859cddeaf3'
    test_audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    
    print(f"🎵 Adding test audio URL to episode {episode_id}...")
    
    # Update the episode
    result = supabase.table('episodes').update({
        'audio_url': test_audio_url
    }).eq('id', episode_id).execute()
    
    print(f"✅ Successfully updated episode!")
    print(f"🎵 Audio URL: {test_audio_url}")
    
    # Verify
    check = supabase.table('episodes').select('id, title, audio_url').eq('id', episode_id).single().execute()
    if check.data and check.data.get('audio_url'):
        print(f"✅ Verification successful!")
        print(f"📺 Title: {check.data.get('title', 'Unknown')}")
        print(f"🎵 Audio URL confirmed: {check.data['audio_url']}")
        print(f"\n🎉 Now try testing the audio in your app!")
    else:
        print("❌ Verification failed - audio_url still empty")
        
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nTroubleshooting:")
    print("1. Verify your Supabase project is active")
    print("2. Check your SUPABASE_SERVICE_ROLE_KEY is correct")
    print("3. Make sure the episode ID exists in the database") 