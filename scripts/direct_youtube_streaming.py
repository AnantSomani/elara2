#!/usr/bin/env python3
"""
Direct YouTube Audio Streaming for MVP
Extract direct YouTube audio URLs for immediate playback
"""

import os
import sys
import json
from pathlib import Path
import subprocess

# Load environment variables from .env.local
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
        sys.exit(1)

# Load environment
load_env_file()

# Create Supabase client
from supabase import create_client

supabase = create_client(
    os.getenv('EXPO_PUBLIC_SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

def extract_direct_audio_url(youtube_url):
    """Extract direct YouTube audio stream URL using yt-dlp"""
    
    print(f"🎵 Extracting direct audio URL from: {youtube_url}")
    
    try:
        # Use yt-dlp to get the best audio-only stream URL
        cmd = [
            'yt-dlp',
            '--no-download',
            '--get-url',
            '--format', 'bestaudio[ext=m4a]/bestaudio/best',
            '--quiet',
            youtube_url
        ]
        
        print(f"🔍 Running: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0 and result.stdout.strip():
            direct_url = result.stdout.strip()
            print(f"✅ Direct audio URL extracted successfully")
            print(f"🔗 URL: {direct_url[:100]}...")
            return direct_url
        else:
            print(f"❌ yt-dlp failed: {result.stderr}")
            return None
            
    except subprocess.TimeoutExpired:
        print(f"❌ yt-dlp timeout after 30 seconds")
        return None
    except Exception as e:
        print(f"❌ Error extracting URL: {e}")
        return None

def validate_audio_url(audio_url):
    """Validate that the audio URL is accessible"""
    
    print(f"🔍 Validating audio URL...")
    
    try:
        import requests
        
        # Test with HEAD request (don't download the whole file)
        response = requests.head(audio_url, timeout=10, allow_redirects=True)
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            content_length = response.headers.get('content-length', '')
            
            print(f"✅ URL is accessible (status: {response.status_code})")
            print(f"📊 Content-Type: {content_type}")
            
            if content_length:
                size_mb = int(content_length) / 1024 / 1024
                print(f"📊 Content-Length: {size_mb:.2f} MB")
            
            return True
        else:
            print(f"❌ URL returned status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ URL validation failed: {e}")
        return False

def update_episode_audio_url(episode_id, audio_url):
    """Update episode in database with direct YouTube audio URL"""
    
    print(f"🗄️  Updating episode {episode_id} with direct audio URL...")
    
    try:
        # Update the episode record
        result = supabase.table('episodes').update({
            'audio_url': audio_url
        }).eq('id', episode_id).execute()
        
        if result.data:
            print(f"✅ Database updated successfully")
            
            # Verify the update
            verify_result = supabase.table('episodes').select('id, title, audio_url').eq('id', episode_id).execute()
            if verify_result.data:
                episode = verify_result.data[0]
                print(f"📺 Episode: {episode['title']}")
                print(f"🎵 New audio URL: {episode['audio_url'][:100]}...")
                return True
            else:
                print(f"⚠️  Could not verify database update")
                return False
        else:
            print(f"❌ Database update failed - no data returned")
            return False
            
    except Exception as e:
        print(f"❌ Database update failed: {e}")
        return False

def get_youtube_video_id(youtube_url):
    """Extract video ID from YouTube URL"""
    
    if 'youtu.be/' in youtube_url:
        return youtube_url.split('youtu.be/')[1].split('?')[0]
    elif 'youtube.com/watch' in youtube_url:
        return youtube_url.split('v=')[1].split('&')[0]
    else:
        return None

def main():
    """Main function to convert episode to direct YouTube streaming"""
    
    # Test episode details
    episode_id = "e6d8ed84-c6a3-42b9-9e3b-b6859cddeaf3"
    youtube_url = "https://www.youtube.com/watch?v=u1Rp1J3HwrE"
    
    print("🚀 Converting to Direct YouTube Audio Streaming")
    print("=" * 60)
    print(f"📺 Episode ID: {episode_id}")
    print(f"🎬 YouTube URL: {youtube_url}")
    print("=" * 60)
    
    # Step 1: Extract direct audio URL
    direct_url = extract_direct_audio_url(youtube_url)
    if not direct_url:
        print("\n❌ Failed to extract direct audio URL")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    
    # Step 2: Validate the URL
    if not validate_audio_url(direct_url):
        print("\n❌ Direct audio URL is not accessible")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    
    # Step 3: Update database
    if update_episode_audio_url(episode_id, direct_url):
        print("\n🎉 SUCCESS! Episode converted to direct YouTube streaming!")
        print("=" * 60)
        print("✅ Direct audio URL extracted from YouTube")
        print("✅ URL validated and accessible")
        print("✅ Database updated with direct URL")
        print("🎵 Your React Native app should now play audio directly from YouTube!")
        print("\n📱 Test your app now - audio should work without any servers!")
    else:
        print("\n❌ Failed to update database")
        sys.exit(1)

if __name__ == "__main__":
    main() 