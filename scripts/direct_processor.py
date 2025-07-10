#!/usr/bin/env python3
"""
Direct podcast processor - no GitHub Actions dependency
Can be run locally, on Cloud Run, AWS Lambda, or any server
"""

import os
import sys
import argparse
import asyncio
import json
import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging
from dotenv import load_dotenv

# Import existing processor
sys.path.append(str(Path(__file__).parent))
try:
    from process_podcast import AssemblyAIPodcastProcessor
except ImportError:
    print("❌ Could not import process_podcast.py")
    print("Make sure you're running this from the scripts directory")
    sys.exit(1)

# Load environment variables
load_dotenv('../.env.local')
load_dotenv('../.env')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DirectPodcastProcessor(AssemblyAIPodcastProcessor):
    """Direct processor that can run anywhere without GitHub Actions"""
    
    def __init__(self, enable_local_storage=True):
        super().__init__()
        self.enable_local_storage = enable_local_storage
        self.cache_dir = Path("cache")
        self.cache_dir.mkdir(exist_ok=True)
        self.processed_episodes = self.load_processed_episodes()
    
    def load_processed_episodes(self) -> Dict:
        """Load list of processed episodes from local cache"""
        cache_file = self.cache_dir / "processed_episodes.json"
        if cache_file.exists():
            try:
                with open(cache_file, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                logger.warning(f"Could not load cache file: {e}")
                return {}
        return {}
    
    def save_processed_episodes(self):
        """Save processed episodes to local cache"""
        if not self.enable_local_storage:
            return
            
        cache_file = self.cache_dir / "processed_episodes.json"
        try:
            with open(cache_file, 'w') as f:
                json.dump(self.processed_episodes, f, indent=2)
        except IOError as e:
            logger.warning(f"Could not save cache file: {e}")
    
    async def check_if_already_processed(self, youtube_url: str) -> Optional[str]:
        """Check if episode is already processed"""
        # Check local cache first
        if youtube_url in self.processed_episodes:
            episode_id = self.processed_episodes[youtube_url]['episode_id']
            logger.info(f"Episode already processed locally: {episode_id}")
            return episode_id
        
        # Check database
        try:
            result = self.supabase.table('episodes')\
                .select('id, processing_status')\
                .eq('youtube_url', youtube_url)\
                .eq('processing_status', 'completed')\
                .execute()
            
            if result.data:
                episode_id = result.data[0]['id']
                logger.info(f"Episode already processed in database: {episode_id}")
                # Update local cache
                self.processed_episodes[youtube_url] = {
                    'episode_id': episode_id,
                    'processed_at': datetime.datetime.now().isoformat()
                }
                self.save_processed_episodes()
                return episode_id
        except Exception as e:
            logger.warning(f"Error checking database: {e}")
        
        return None
    
    async def get_youtube_metadata(self, youtube_url: str) -> Dict:
        """Get YouTube metadata using yt-dlp (same as existing logic)"""
        try:
            import yt_dlp
            
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(youtube_url, download=False)
                
                return {
                    'title': info.get('title', ''),
                    'description': info.get('description', ''),
                    'duration_seconds': info.get('duration', 0),
                    'thumbnail_url': info.get('thumbnail', ''),
                    'channel_title': info.get('channel', info.get('uploader', '')),
                    'view_count': info.get('view_count', 0),
                    'upload_date': info.get('upload_date', ''),
                }
        except Exception as e:
            logger.error(f"Error getting YouTube metadata: {e}")
            # Return minimal metadata
            return {
                'title': f'Episode from {youtube_url}',
                'description': '',
                'duration_seconds': 0,
                'thumbnail_url': '',
                'channel_title': 'Unknown',
                'view_count': 0,
                'upload_date': '',
            }
    
    async def create_episode_from_url(self, youtube_url: str) -> str:
        """Create episode record if it doesn't exist"""
        try:
            # Extract YouTube video ID from URL
            video_id = self.extract_youtube_video_id(youtube_url)
            if not video_id:
                raise ValueError(f"Could not extract YouTube video ID from: {youtube_url}")
            
            # Check if episode already exists
            result = self.supabase.table('episodes')\
                .select('id')\
                .eq('id', video_id)\
                .execute()
            
            if result.data:
                episode_id = result.data[0]['id']
                logger.info(f"Episode record already exists: {episode_id}")
                return episode_id
            
            # Get YouTube metadata
            logger.info("Fetching YouTube metadata...")
            metadata = await self.get_youtube_metadata(youtube_url)
            
            # Create episode record with explicit ID
            episode_data = {
                'id': video_id,  # Use YouTube video ID as primary key
                'youtube_url': youtube_url,
                'title': metadata['title'],
                'description': metadata['description'],
                'duration_seconds': metadata['duration_seconds'],
                'processing_status': 'pending'
            }
            
            result = self.supabase.table('episodes').insert(episode_data).execute()
            episode_id = result.data[0]['id']
            
            logger.info(f"Created episode record: {episode_id}")
            return episode_id
            
        except Exception as e:
            logger.error(f"Error creating episode: {e}")
            raise
    
    def extract_youtube_video_id(self, youtube_url: str) -> Optional[str]:
        """Extract YouTube video ID from URL"""
        import re
        
        # Handle different YouTube URL formats
        patterns = [
            r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
            r'(?:embed\/)([0-9A-Za-z_-]{11})',
            r'(?:vi\/)([0-9A-Za-z_-]{11})',
            r'(?:youtu\.be\/)([0-9A-Za-z_-]{11})'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, youtube_url)
            if match:
                return match.group(1)
        
        return None
    
    async def process_episode_direct(self, youtube_url: str, episode_id: str = None) -> str:
        """Process a single episode directly without GitHub Actions"""
        try:
            logger.info(f"🎙️ Starting direct processing for: {youtube_url}")
            
            # Check if already processed
            existing_id = await self.check_if_already_processed(youtube_url)
            if existing_id:
                return existing_id
            
            # Create episode if needed
            if not episode_id:
                episode_id = await self.create_episode_from_url(youtube_url)
            
            # Process using existing logic from parent class
            logger.info(f"🚀 Processing episode {episode_id}...")
            await self.process(youtube_url, episode_id)
            
            # Update local cache
            self.processed_episodes[youtube_url] = {
                'episode_id': episode_id,
                'processed_at': datetime.datetime.now().isoformat()
            }
            self.save_processed_episodes()
            
            logger.info(f"✅ Successfully processed episode: {episode_id}")
            return episode_id
            
        except Exception as e:
            logger.error(f"❌ Error processing episode: {e}")
            raise
    
    async def batch_process_episodes(self, episode_urls: List[str], max_concurrent=2) -> List[Dict]:
        """Process multiple episodes with concurrency control"""
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def process_with_semaphore(url):
            async with semaphore:
                try:
                    episode_id = await self.process_episode_direct(url)
                    return {'url': url, 'episode_id': episode_id, 'status': 'success'}
                except Exception as e:
                    logger.error(f"Failed to process {url}: {e}")
                    return {'url': url, 'error': str(e), 'status': 'failed'}
        
        logger.info(f"🎬 Batch processing {len(episode_urls)} episodes...")
        tasks = [process_with_semaphore(url) for url in episode_urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Convert exceptions to error results
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append({
                    'url': episode_urls[i],
                    'error': str(result),
                    'status': 'failed'
                })
            else:
                processed_results.append(result)
        
        return processed_results
    
    def get_cache_stats(self) -> Dict:
        """Get statistics about local cache"""
        return {
            'total_cached': len(self.processed_episodes),
            'cache_file': str(self.cache_dir / "processed_episodes.json"),
            'cache_enabled': self.enable_local_storage,
            'recent_episodes': list(self.processed_episodes.keys())[-5:] if self.processed_episodes else []
        }

# CLI interface
async def main():
    parser = argparse.ArgumentParser(description='Direct podcast processor')
    parser.add_argument('--url', help='Single podcast URL to process')
    parser.add_argument('--episode-id', help='Episode ID (optional)')
    parser.add_argument('--batch-file', help='File with URLs to process (one per line)')
    parser.add_argument('--check-only', action='store_true', help='Only check if already processed')
    parser.add_argument('--max-concurrent', type=int, default=2, help='Max concurrent processes')
    parser.add_argument('--cache-stats', action='store_true', help='Show cache statistics')
    parser.add_argument('--no-cache', action='store_true', help='Disable local caching')
    
    args = parser.parse_args()
    
    processor = DirectPodcastProcessor(enable_local_storage=not args.no_cache)
    
    if args.cache_stats:
        stats = processor.get_cache_stats()
        print("📊 Cache Statistics:")
        print(f"  Total cached episodes: {stats['total_cached']}")
        print(f"  Cache file: {stats['cache_file']}")
        print(f"  Cache enabled: {stats['cache_enabled']}")
        if stats['recent_episodes']:
            print(f"  Recent episodes: {len(stats['recent_episodes'])}")
        return
    
    if args.url:
        if args.check_only:
            result = await processor.check_if_already_processed(args.url)
            print(f"Already processed: {result is not None}")
            if result:
                print(f"Episode ID: {result}")
        else:
            episode_id = await processor.process_episode_direct(args.url, args.episode_id)
            print(f"✅ Processed episode: {episode_id}")
    
    elif args.batch_file:
        if not Path(args.batch_file).exists():
            print(f"❌ Batch file not found: {args.batch_file}")
            return
            
        with open(args.batch_file, 'r') as f:
            urls = [line.strip() for line in f if line.strip() and not line.startswith('#')]
        
        if not urls:
            print("❌ No URLs found in batch file")
            return
        
        logger.info(f"Processing {len(urls)} episodes with max concurrency {args.max_concurrent}")
        results = await processor.batch_process_episodes(urls, args.max_concurrent)
        
        successful = [r for r in results if r.get('status') == 'success']
        failed = [r for r in results if r.get('status') == 'failed']
        
        print(f"\n📊 Batch Processing Complete:")
        print(f"✅ Successful: {len(successful)}")
        print(f"❌ Failed: {len(failed)}")
        
        if successful:
            print(f"\n✅ Successfully processed:")
            for s in successful:
                print(f"  - {s['episode_id']}: {s['url']}")
        
        if failed:
            print(f"\n❌ Failed episodes:")
            for f in failed:
                print(f"  - {f['url']}: {f['error']}")
    else:
        parser.print_help()

if __name__ == "__main__":
    asyncio.run(main()) 