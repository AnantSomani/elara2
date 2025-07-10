#!/usr/bin/env python3

import os
import sys
from pathlib import Path

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

# Load environment
load_env_file()

# Check current audio URL in database
from supabase import create_client

supabase = create_client(
    os.getenv('EXPO_PUBLIC_SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

episode_id = 'e6d8ed84-c6a3-42b9-9e3b-b6859cddeaf3'

try:
    result = supabase.table('episodes').select('id, title, audio_url, processing_status, youtube_url').eq('id', episode_id).execute()
    
    if result.data:
        episode = result.data[0]
        print(f'🎵 Episode: {episode["title"]}')
        print(f'🎬 Original YouTube URL: {episode["youtube_url"]}')
        print(f'🔗 Current audio URL: {episode["audio_url"]}')
        print(f'📊 Processing Status: {episode["processing_status"]}')
        
        # Check if it's localhost, Supabase, or something else
        url = episode['audio_url']
        if 'localhost' in url:
            print('❌ Still using localhost URL (will break)')
        elif 'supabase.co' in url:
            print('✅ Using Supabase Storage URL (good!)')
        elif 'soundhelix.com' in url:
            print('🧪 Using test audio URL')
        else:
            print(f'❓ Using other URL type')
            
        # Test if URL is accessible
        import requests
        try:
            response = requests.head(url, timeout=5)
            if response.status_code == 200:
                print(f'✅ URL is accessible (status: {response.status_code})')
            else:
                print(f'⚠️ URL returned status: {response.status_code}')
        except Exception as e:
            print(f'❌ URL not accessible: {e}')
            
    else:
        print('❌ Episode not found')
        
except Exception as e:
    print(f'❌ Database error: {e}') 