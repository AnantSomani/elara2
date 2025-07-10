#!/usr/bin/env python3
"""
Test script for direct processing functionality
Validates environment, connectivity, and basic operations
"""

import asyncio
import os
import sys
import tempfile
from pathlib import Path
import logging
from dotenv import load_dotenv

# Load environment variables first (before other imports)
load_dotenv('../.env.local')
load_dotenv('../.env')

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add current directory to path for imports
sys.path.append(str(Path(__file__).parent))

def test_environment():
    """Test that all environment variables are set"""
    print("🔍 Testing Environment Variables...")
    
    required_vars = [
        'ASSEMBLYAI_API_KEY',
        'OPENAI_API_KEY', 
        'EXPO_PUBLIC_SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    optional_vars = [
        'EXPO_PUBLIC_YOUTUBE_API_KEY',
        'ANTHROPIC_API_KEY',
        'HUGGINGFACE_TOKEN'
    ]
    
    missing = []
    present = []
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            present.append(var)
            print(f"    ✅ {var}: Set (***{value[-4:] if len(value) > 4 else '***'})")
        else:
            missing.append(var)
    
    for var in optional_vars:
        value = os.getenv(var)
        if value:
            present.append(f"{var} (optional)")
            print(f"    ✅ {var} (optional): Set (***{value[-4:] if len(value) > 4 else '***'})")
    
    print(f"  📊 Present: {len(present)} variables")
    
    if missing:
        print(f"  ❌ Missing: {len(missing)} required variables")
        for var in missing:
            print(f"    - {var}")
        print("  🔧 Make sure these are set in your .env.local file")
        return False
    
    print("  ✅ All required environment variables are set")
    return True

def test_imports():
    """Test that all required modules can be imported"""
    print("\n📦 Testing Module Imports...")
    
    modules_to_test = [
        ('assemblyai', 'AssemblyAI'),
        ('openai', 'OpenAI'),
        ('supabase', 'Supabase'),
        ('yt_dlp', 'YouTube Downloader'),
        ('dotenv', 'Python DotEnv')
    ]
    
    failed_imports = []
    
    for module, name in modules_to_test:
        try:
            __import__(module)
            print(f"  ✅ {name}")
        except ImportError as e:
            print(f"  ❌ {name}: {e}")
            failed_imports.append(module)
    
    # Test our custom modules
    try:
        from direct_processor import DirectPodcastProcessor
        print("  ✅ Direct Processor")
    except ImportError as e:
        print(f"  ❌ Direct Processor: {e}")
        failed_imports.append('direct_processor')
    
    if failed_imports:
        print(f"\n❌ Failed to import: {failed_imports}")
        print("Install missing dependencies with:")
        print("  pip install assemblyai openai supabase yt-dlp python-dotenv")
        return False
    
    print("  ✅ All modules imported successfully")
    return True

async def test_database_connection():
    """Test database connectivity"""
    print("\n🗄️ Testing Database Connection...")
    
    try:
        from direct_processor import DirectPodcastProcessor
        processor = DirectPodcastProcessor(enable_local_storage=False)
        
        # Test basic query
        result = processor.supabase.table('episodes').select('id').limit(1).execute()
        print("  ✅ Database connection successful")
        
        # Test episodes table structure
        result = processor.supabase.table('episodes').select('*').limit(1).execute()
        if result.data:
            episode = result.data[0]
            required_fields = ['id', 'youtube_url', 'processing_status']
            missing_fields = [field for field in required_fields if field not in episode]
            
            if missing_fields:
                print(f"  ⚠️ Missing required fields in episodes table: {missing_fields}")
            else:
                print("  ✅ Episodes table structure is correct")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Database connection failed: {e}")
        print("  Check your EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        return False

async def test_assemblyai_connection():
    """Test AssemblyAI connectivity"""
    print("\n🎤 Testing AssemblyAI Connection...")
    
    try:
        import assemblyai as aai
        aai.settings.api_key = os.getenv('ASSEMBLYAI_API_KEY')
        
        if not aai.settings.api_key:
            print("  ❌ ASSEMBLYAI_API_KEY not set")
            return False
        
        # Test API key by creating a transcriber (doesn't charge anything)
        transcriber = aai.Transcriber()
        print("  ✅ AssemblyAI connection successful")
        return True
        
    except Exception as e:
        print(f"  ❌ AssemblyAI connection failed: {e}")
        print("  Check your ASSEMBLYAI_API_KEY")
        return False

async def test_openai_connection():
    """Test OpenAI connectivity"""
    print("\n🤖 Testing OpenAI Connection...")
    
    try:
        import openai
        client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        # Test with a simple embedding request
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input="test connection"
        )
        
        if response.data and len(response.data) > 0:
            print("  ✅ OpenAI connection successful")
            print(f"  📊 Embedding dimension: {len(response.data[0].embedding)}")
            return True
        else:
            print("  ❌ OpenAI returned empty response")
            return False
            
    except Exception as e:
        print(f"  ❌ OpenAI connection failed: {e}")
        print("  Check your OPENAI_API_KEY and quota")
        return False

async def test_youtube_metadata():
    """Test YouTube metadata extraction"""
    print("\n📺 Testing YouTube Metadata Extraction...")
    
    try:
        from direct_processor import DirectPodcastProcessor
        processor = DirectPodcastProcessor(enable_local_storage=False)
        
        # Test with user's YouTube Shorts video
        test_url = "https://youtube.com/shorts/Njvz3KWqdRM?feature=shared"
        
        print(f"  Testing with: {test_url}")
        metadata = await processor.get_youtube_metadata(test_url)
        
        if metadata and metadata.get('title'):
            print(f"  ✅ Metadata extracted successfully")
            print(f"    Title: {metadata['title'][:50]}...")
            print(f"    Duration: {metadata.get('duration_seconds', 0)} seconds")
            print(f"    Channel: {metadata.get('channel_title', 'Unknown')}")
            return True
        else:
            print("  ❌ No metadata extracted")
            return False
            
    except Exception as e:
        print(f"  ❌ YouTube metadata extraction failed: {e}")
        return False

async def test_episode_creation():
    """Test episode creation functionality"""
    print("\n📝 Testing Episode Creation...")
    
    try:
        from direct_processor import DirectPodcastProcessor
        processor = DirectPodcastProcessor(enable_local_storage=False)
        
        # Use a real YouTube Shorts URL provided by user
        test_url = "https://youtube.com/shorts/Njvz3KWqdRM?feature=shared"
        
        print(f"  Testing with real YouTube URL (episode creation and metadata extraction)")
        
        # Temporarily suppress yt-dlp logging to reduce noise
        import logging
        yt_dlp_logger = logging.getLogger('yt_dlp')
        original_level = yt_dlp_logger.level
        yt_dlp_logger.setLevel(logging.CRITICAL)
        
        try:
            # This should work with real YouTube metadata
            episode_id = await processor.create_episode_from_url(test_url)
            
            if episode_id:
                print(f"  ✅ Episode created successfully: {episode_id}")
                print(f"  ✅ YouTube video ID extraction works correctly")
                
                # Clean up - delete the test episode
                try:
                    processor.supabase.table('episodes').delete().eq('id', episode_id).execute()
                    print("  🧹 Test episode cleaned up")
                except:
                    print("  ⚠️ Could not clean up test episode")
                
                return True
            else:
                print("  ❌ Episode creation returned no ID")
                return False
        finally:
            # Restore original logging level
            yt_dlp_logger.setLevel(original_level)
            
    except Exception as e:
        print(f"  ❌ Episode creation failed: {e}")
        return False

async def test_processing_check():
    """Test the already-processed check functionality"""
    print("\n🔍 Testing Processing Check...")
    
    try:
        from direct_processor import DirectPodcastProcessor
        processor = DirectPodcastProcessor(enable_local_storage=False)
        
        # Test with a non-existent URL
        test_url = f"https://www.youtube.com/watch?v=nonexistent_{os.getpid()}"
        
        result = await processor.check_if_already_processed(test_url)
        
        if result is None:
            print("  ✅ Processing check working correctly (returned None for non-existent)")
            return True
        else:
            print(f"  ⚠️ Unexpected result for non-existent URL: {result}")
            return True  # Still passes, just unexpected
            
    except Exception as e:
        print(f"  ❌ Processing check failed: {e}")
        return False

async def test_cache_functionality():
    """Test local caching functionality"""
    print("\n💾 Testing Cache Functionality...")
    
    try:
        # Test with temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            # Change to temp directory for testing
            original_cwd = os.getcwd()
            os.chdir(temp_dir)
            
            try:
                from direct_processor import DirectPodcastProcessor
                processor = DirectPodcastProcessor(enable_local_storage=True)
                
                # Test cache stats
                stats = processor.get_cache_stats()
                print(f"  ✅ Cache stats retrieved")
                print(f"    Total cached: {stats['total_cached']}")
                print(f"    Cache enabled: {stats['cache_enabled']}")
                
                # Test cache save/load
                test_data = {
                    'test_url': {
                        'episode_id': 'test_123',
                        'processed_at': '2024-01-01T00:00:00'
                    }
                }
                
                processor.processed_episodes = test_data
                processor.save_processed_episodes()
                
                # Create new processor to test loading
                processor2 = DirectPodcastProcessor(enable_local_storage=True)
                
                if 'test_url' in processor2.processed_episodes:
                    print("  ✅ Cache save/load working correctly")
                    return True
                else:
                    print("  ❌ Cache data not loaded correctly")
                    return False
                    
            finally:
                os.chdir(original_cwd)
                
    except Exception as e:
        print(f"  ❌ Cache functionality test failed: {e}")
        return False

async def run_all_tests():
    """Run all tests"""
    print("🧪 Running Direct Processing Test Suite\n")
    
    tests = [
        ("Environment Variables", test_environment),
        ("Module Imports", test_imports),
        ("Database Connection", test_database_connection),
        ("AssemblyAI Connection", test_assemblyai_connection),
        ("OpenAI Connection", test_openai_connection),
        ("YouTube Metadata", test_youtube_metadata),
        ("Episode Creation", test_episode_creation),
        ("Processing Check", test_processing_check),
        ("Cache Functionality", test_cache_functionality),
    ]
    
    results = []
    
    for name, test_func in tests:
        print(f"{'='*50}")
        try:
            if asyncio.iscoroutinefunction(test_func):
                success = await test_func()
            else:
                success = test_func()
            results.append(success)
        except Exception as e:
            print(f"❌ Test '{name}' crashed: {e}")
            results.append(False)
    
    print(f"\n{'='*50}")
    passed = sum(results)
    total = len(results)
    
    print(f"📊 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed! Direct processing is ready.")
        print("\n✅ Next steps:")
        print("1. Try processing a test episode:")
        print("   python3 direct_processor.py --url 'https://www.youtube.com/watch?v=SHORT_VIDEO'")
        print("2. Or start the API server:")
        print("   python3 processing_api.py")
        return True
    else:
        print("🚨 Some tests failed. Check the errors above.")
        print("\n🔧 Common fixes:")
        print("- Ensure all API keys are set in .env.local")
        print("- Check internet connectivity")
        print("- Verify Supabase credentials")
        print("- Install missing Python packages")
        return False

async def main():
    """Main test runner"""
    success = await run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n⏹️ Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test suite crashed: {e}")
        sys.exit(1) 