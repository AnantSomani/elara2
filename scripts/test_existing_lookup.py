#!/usr/bin/env python3
"""
Test existing episode lookup functionality
"""

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

load_env_file()

from supabase import create_client

supabase = create_client(
    os.getenv('EXPO_PUBLIC_SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

def test_existing_lookup(test_url):
    """Test if existing episode lookup works for a given URL"""
    
    print(f"🔍 Testing existing episode lookup for:")
    print(f"   URL: {test_url}")
    print("=" * 60)
    
    try:
        # Same query as in lib/api.real.ts
        result = supabase.table('episodes').select('id, title, processing_status, youtube_url').eq('youtube_url', test_url).eq('processing_status', 'completed').execute()
        
        if result.data:
            episode = result.data[0]
            print(f"✅ FOUND existing episode!")
            print(f"   Episode ID: {episode['id']}")
            print(f"   Title: {episode['title']}")
            print(f"   Status: {episode['processing_status']}")
            print(f"   Stored URL: {episode['youtube_url']}")
            print(f"   URL Match: {'✅ EXACT' if episode['youtube_url'] == test_url else '❌ DIFFERENT'}")
            return True
        else:
            print(f"❌ NO existing episode found")
            print(f"   The app will try to process this as a new episode")
            return False
            
    except Exception as e:
        print(f"❌ Error during lookup: {e}")
        return False

def main():
    print("🧪 Testing Existing Episode Lookup")
    print("=" * 60)
    
    # Test different URL formats
    test_urls = [
        "https://www.youtube.com/watch?v=u1Rp1J3HwrE",
        "https://youtu.be/u1Rp1J3HwrE",
        "https://www.youtube.com/watch?v=u1Rp1J3HwrE&t=10s",
        "https://www.youtube.com/watch?v=u1Rp1J3HwrE&ab_channel=SomeChannel"
    ]
    
    for i, url in enumerate(test_urls, 1):
        print(f"\n{i}. Testing URL format:")
        found = test_existing_lookup(url)
        if found:
            print(f"   ✅ This URL format will load existing episode")
        else:
            print(f"   ❌ This URL format will try to process as new")
        print()

if __name__ == "__main__":
    main() 