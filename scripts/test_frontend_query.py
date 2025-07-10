#!/usr/bin/env python3
"""
Test the exact frontend query that's hanging
"""

import os
import sys
import time
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

def test_frontend_query():
    """Test the exact query that's hanging in the frontend"""
    
    # Use same configuration as frontend
    supabase_url = os.getenv('EXPO_PUBLIC_SUPABASE_URL') or ''
    supabase_key = os.getenv('EXPO_PUBLIC_SUPABASE_ANON_KEY') or ''
    
    print("🧪 Testing Frontend Query (Exact Replica)")
    print("=" * 50)
    print(f"🔗 Supabase URL: {supabase_url[:50]}...")
    print(f"🔑 Anon Key: {supabase_key[:20]}...")
    print()
    
    # Create client exactly like frontend
    supabase = create_client(supabase_url, supabase_key)
    
    # Test the exact query from checkExistingProcessedEpisode
    youtube_url = "https://www.youtube.com/watch?v=u1Rp1J3HwrE"
    
    print(f"🔍 Testing query for URL: {youtube_url}")
    print()
    
    # Start timer
    start_time = time.time()
    
    try:
        print("⏱️  Starting query...")
        
        # Exact query from frontend code
        result = supabase.table('episodes').select('id, processing_status').eq('youtube_url', youtube_url).eq('processing_status', 'completed').single().execute()
        
        end_time = time.time()
        query_time = end_time - start_time
        
        print(f"✅ Query completed in {query_time:.2f} seconds")
        
        if result.data:
            print(f"✅ Found existing episode: {result.data['id']}")
            print(f"✅ Processing status: {result.data['processing_status']}")
            return True
        else:
            print("❌ No existing episode found")
            return False
            
    except Exception as e:
        end_time = time.time()
        query_time = end_time - start_time
        
        print(f"❌ Query FAILED after {query_time:.2f} seconds")
        print(f"❌ Error: {e}")
        print(f"❌ Error type: {type(e).__name__}")
        
        # Print detailed error info
        if hasattr(e, 'code'):
            print(f"❌ Error code: {e.code}")
        if hasattr(e, 'message'):
            print(f"❌ Error message: {e.message}")
        if hasattr(e, 'details'):
            print(f"❌ Error details: {e.details}")
            
        return False

def test_alternative_queries():
    """Test alternative query approaches"""
    
    print("\n🧪 Testing Alternative Query Approaches")
    print("=" * 50)
    
    supabase = create_client(
        os.getenv('EXPO_PUBLIC_SUPABASE_URL') or '',
        os.getenv('EXPO_PUBLIC_SUPABASE_ANON_KEY') or ''
    )
    
    youtube_url = "https://www.youtube.com/watch?v=u1Rp1J3HwrE"
    
    # Test 1: Without .single()
    print("🔍 Test 1: Query without .single()")
    try:
        start_time = time.time()
        result = supabase.table('episodes').select('id, processing_status').eq('youtube_url', youtube_url).eq('processing_status', 'completed').execute()
        end_time = time.time()
        
        print(f"✅ Success in {end_time - start_time:.2f}s - Found {len(result.data)} rows")
        
    except Exception as e:
        print(f"❌ Failed: {e}")
    
    # Test 2: Just check if episode exists
    print("\n🔍 Test 2: Simple existence check")
    try:
        start_time = time.time()
        result = supabase.table('episodes').select('id').eq('youtube_url', youtube_url).limit(1).execute()
        end_time = time.time()
        
        print(f"✅ Success in {end_time - start_time:.2f}s - Found {len(result.data)} rows")
        
    except Exception as e:
        print(f"❌ Failed: {e}")
        
    # Test 3: Count query
    print("\n🔍 Test 3: Count query")
    try:
        start_time = time.time()
        result = supabase.table('episodes').select('id', count='exact').eq('youtube_url', youtube_url).execute()
        end_time = time.time()
        
        print(f"✅ Success in {end_time - start_time:.2f}s - Count: {result.count}")
        
    except Exception as e:
        print(f"❌ Failed: {e}")

def main():
    print("🚀 Debugging Frontend Query Hanging Issue")
    print("=" * 60)
    
    # Test the exact frontend query
    frontend_works = test_frontend_query()
    
    if frontend_works:
        print("\n🎉 Frontend query works perfectly!")
        print("🤔 The issue might be in the JavaScript client or network")
    else:
        print("\n❌ Frontend query fails in Python too!")
        print("🔍 Testing alternative approaches...")
        test_alternative_queries()

if __name__ == "__main__":
    main() 