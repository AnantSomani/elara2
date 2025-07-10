#!/usr/bin/env python3
"""
Extract real YouTube audio and update episode with actual audio URL
"""

import os
import sys
import asyncio
import shutil
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

# Load environment
load_env_file()

try:
    from supabase import create_client
    import yt_dlp
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("Make sure you're in the virtual environment:")
    print("source podcast-env/bin/activate")
    sys.exit(1)

# Configuration
EPISODE_ID = 'e6d8ed84-c6a3-42b9-9e3b-b6859cddeaf3'
YOUTUBE_URL = 'https://www.youtube.com/watch?v=u1Rp1J3HwrE'

# Create audio storage directory
AUDIO_DIR = Path(__file__).parent.parent / 'audio'
AUDIO_DIR.mkdir(exist_ok=True)

async def download_youtube_audio(youtube_url: str, episode_id: str) -> str:
    """Download audio from YouTube and save permanently"""
    
    output_path = AUDIO_DIR / f"{episode_id}"
    
    print(f"🎵 Downloading audio from: {youtube_url}")
    print(f"📁 Saving to: {output_path}")
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': str(output_path) + '.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'quiet': False,  # Show progress
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([youtube_url])
        
        # Find the actual output file
        mp3_file = output_path.with_suffix('.mp3')
        if mp3_file.exists():
            print(f"✅ Audio downloaded successfully: {mp3_file}")
            return str(mp3_file)
        else:
            # Try to find any audio file with that base name
            for file in AUDIO_DIR.glob(f"{episode_id}.*"):
                if file.suffix in ['.mp3', '.m4a', '.wav']:
                    print(f"✅ Audio downloaded as: {file}")
                    return str(file)
            
            raise Exception("No audio file found after download")
            
    except Exception as e:
        print(f"❌ Error downloading audio: {e}")
        raise

def create_audio_url(audio_file_path: str) -> str:
    """Create a URL for the audio file"""
    # For now, we'll use a local file path
    # In production, you'd upload this to a CDN or storage service
    audio_file = Path(audio_file_path)
    
    # Create a simple file URL (this works for local testing)
    # Note: In production, you'd want to serve this through a proper web server
    return f"file://{audio_file.absolute()}"

async def main():
    print("🎯 Extracting Real YouTube Audio for Episode")
    print("=" * 50)
    
    # Connect to Supabase
    try:
        supabase = create_client(
            os.getenv('EXPO_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        )
        print("✅ Connected to Supabase")
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return
    
    # Check current episode
    try:
        result = supabase.table('episodes').select('id, title, audio_url').eq('id', EPISODE_ID).single().execute()
        episode = result.data
        print(f"📺 Episode: {episode['title']}")
        print(f"🎵 Current audio URL: {episode.get('audio_url', 'None')}")
    except Exception as e:
        print(f"❌ Error fetching episode: {e}")
        return
    
    # Download the real YouTube audio
    try:
        audio_file_path = await download_youtube_audio(YOUTUBE_URL, EPISODE_ID)
        audio_url = create_audio_url(audio_file_path)
        
        print(f"🎵 Real audio saved: {audio_file_path}")
        print(f"🔗 Audio URL: {audio_url}")
        
        # Update database with real audio URL
        update_result = supabase.table('episodes').update({
            'audio_url': audio_url
        }).eq('id', EPISODE_ID).execute()
        
        print(f"✅ Database updated successfully!")
        
        # Verify the update
        verify = supabase.table('episodes').select('audio_url').eq('id', EPISODE_ID).single().execute()
        print(f"✅ Verification: {verify.data['audio_url']}")
        
        print(f"\n🎉 Success! Your episode now has the real YouTube audio!")
        print(f"🧪 Test the app again - it should play the actual video audio now.")
        
    except Exception as e:
        print(f"❌ Error processing audio: {e}")

if __name__ == "__main__":
    asyncio.run(main()) 