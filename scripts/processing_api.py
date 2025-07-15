#!/usr/bin/env python3
"""
Simple HTTP API for triggering processing (optional for Cloud Run deployment)
FastAPI-based API that can replace GitHub Actions
"""

import asyncio
import logging
import sys
from pathlib import Path
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, HttpUrl

try:
    from fastapi import FastAPI, HTTPException, BackgroundTasks
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
except ImportError:
    print("❌ FastAPI not installed. Install with: pip install fastapi uvicorn")
    sys.exit(1)

# Import our direct processor
sys.path.append(str(Path(__file__).parent))
try:
    from direct_processor import DirectPodcastProcessor
except ImportError:
    print("❌ Could not import direct_processor.py")
    print("Make sure direct_processor.py exists in the same directory")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Podcast Processing API",
    description="Direct podcast processing API without GitHub Actions dependency",
    version="1.0.0"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class ProcessRequest(BaseModel):
    youtube_url: HttpUrl
    episode_id: Optional[str] = None
    force_reprocess: bool = False

class ProcessResponse(BaseModel):
    episode_id: str
    status: str
    message: str
    started_at: str

class StatusRequest(BaseModel):
    episode_id: str

class StatusResponse(BaseModel):
    episode_id: str
    processing_status: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    error_message: Optional[str] = None

class BatchProcessRequest(BaseModel):
    youtube_urls: list[HttpUrl]
    max_concurrent: int = 2

class BatchProcessResponse(BaseModel):
    total_submitted: int
    message: str
    batch_id: str

# New Podcast Index models
class PodcastIndexEpisodeData(BaseModel):
    guid: str
    enclosureUrl: str
    title: str
    description: Optional[str] = None
    duration: Optional[int] = None
    pubDate: Optional[str] = None
    imageUrl: Optional[str] = None
    podcastTitle: Optional[str] = None
    episodeType: Optional[str] = None
    explicit: Optional[bool] = None

class PodcastIndexProcessRequest(BaseModel):
    episode_data: PodcastIndexEpisodeData
    episode_id: Optional[str] = None
    force_reprocess: bool = False

class PodcastIndexProcessResponse(BaseModel):
    episode_id: str
    status: str
    message: str
    started_at: str

# Global processor instance
processor = None

def get_processor():
    """Get or create processor instance"""
    global processor
    if processor is None:
        processor = DirectPodcastProcessor()
    return processor

# Background task for processing
async def process_episode_background(youtube_url: str, episode_id: str = None, force_reprocess: bool = False):
    """Background task to process episode"""
    try:
        proc = get_processor()
        
        if not force_reprocess:
            # Check if already processed
            existing_id = await proc.check_if_already_processed(youtube_url)
            if existing_id:
                logger.info(f"Episode already processed: {existing_id}")
                return existing_id
        
        # Ensure episode exists in database
        if episode_id:
            # Check if episode with this ID exists
            result = proc.supabase.table('episodes').select('id').eq('id', episode_id).execute()
            if not result.data:
                # Episode doesn't exist, create it
                logger.info(f"Creating episode with provided ID: {episode_id}")
                episode_id = await proc.create_episode_from_url(youtube_url)
            else:
                logger.info(f"Episode already exists: {episode_id}")
        else:
            # Create new episode
            episode_id = await proc.create_episode_from_url(youtube_url)
        
        # Process the episode
        result_id = await proc.process_episode_direct(youtube_url, episode_id)
        logger.info(f"Successfully processed episode: {result_id}")
        return result_id
        
    except Exception as e:
        logger.error(f"Background processing failed: {e}")
        # Update episode status to failed if possible
        try:
            proc = get_processor()
            if episode_id:
                proc.supabase.table('episodes').update({
                    'processing_status': 'failed',
                    'processing_metadata': {'error': str(e), 'failed_at': datetime.now().isoformat()}
                }).eq('id', episode_id).execute()
        except:
            pass  # Don't fail on status update error
        raise

# Background task for Podcast Index processing
async def process_podcast_index_background(episode_data: PodcastIndexEpisodeData, episode_id: str = None, force_reprocess: bool = False):
    """Background task to process Podcast Index episode"""
    try:
        proc = get_processor()
        
        if not force_reprocess:
            # Check if already processed using guid
            existing_id = await proc.check_if_already_processed_podcast_index(episode_data.guid)
            if existing_id:
                logger.info(f"Podcast Index episode already processed: {existing_id}")
                return existing_id
        
        # Ensure episode exists in database
        if episode_id:
            # Check if episode with this ID exists
            result = proc.supabase.table('episodes').select('id').eq('id', episode_id).execute()
            if not result.data:
                # Episode doesn't exist, create it
                logger.info(f"Creating Podcast Index episode with provided ID: {episode_id}")
                episode_id = await proc.create_episode_from_podcast_index(episode_data)
            else:
                logger.info(f"Podcast Index episode already exists: {episode_id}")
        else:
            # Create new episode
            episode_id = await proc.create_episode_from_podcast_index(episode_data)
        
        # Process the episode
        result_id = await proc.process_podcast_index_episode(episode_data, episode_id)
        logger.info(f"Successfully processed Podcast Index episode: {result_id}")
        return result_id
        
    except Exception as e:
        logger.error(f"Podcast Index background processing failed: {e}")
        # Update episode status to failed if possible
        try:
            proc = get_processor()
            if episode_id:
                proc.supabase.table('episodes').update({
                    'processing_status': 'failed',
                    'processing_metadata': {'error': str(e), 'failed_at': datetime.now().isoformat()}
                }).eq('id', episode_id).execute()
        except:
            pass  # Don't fail on status update error
        raise

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Podcast Processing API",
        "version": "1.0.0",
        "endpoints": {
            "process": "/process - Process a single YouTube episode",
            "process-podcast-index": "/process-podcast-index - Process a Podcast Index episode",
            "status": "/status/{episode_id} - Get processing status",
            "batch": "/batch - Process multiple episodes",
            "health": "/health - Health check"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connectivity
        proc = get_processor()
        result = proc.supabase.table('episodes').select('id').limit(1).execute()
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "database": "connected",
            "cache_stats": proc.get_cache_stats()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@app.post("/process", response_model=ProcessResponse)
async def process_episode(request: ProcessRequest, background_tasks: BackgroundTasks):
    """Process a single episode"""
    try:
        youtube_url = str(request.youtube_url)
        logger.info(f"Received processing request for: {youtube_url}")
        
        proc = get_processor()
        
        # Check if already processed (unless force reprocess)
        if not request.force_reprocess:
            existing_id = await proc.check_if_already_processed(youtube_url)
            if existing_id:
                return ProcessResponse(
                    episode_id=existing_id,
                    status="already_processed",
                    message="Episode already processed",
                    started_at=datetime.now().isoformat()
                )
        
        # Create episode record if needed
        episode_id = request.episode_id
        if not episode_id:
            episode_id = await proc.create_episode_from_url(youtube_url)
        
        # Start background processing
        background_tasks.add_task(
            process_episode_background, 
            youtube_url, 
            episode_id, 
            request.force_reprocess
        )
        
        return ProcessResponse(
            episode_id=episode_id,
            status="processing",
            message="Episode processing started",
            started_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Process endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-podcast-index", response_model=PodcastIndexProcessResponse)
async def process_podcast_index_episode(request: PodcastIndexProcessRequest, background_tasks: BackgroundTasks):
    """Process a Podcast Index episode"""
    try:
        episode_data = request.episode_data
        logger.info(f"Received Podcast Index processing request for: {episode_data.title} (GUID: {episode_data.guid})")
        
        proc = get_processor()
        
        # Check if already processed (unless force reprocess)
        if not request.force_reprocess:
            existing_id = await proc.check_if_already_processed_podcast_index(episode_data.guid)
            if existing_id:
                return PodcastIndexProcessResponse(
                    episode_id=existing_id,
                    status="already_processed",
                    message="Podcast Index episode already processed",
                    started_at=datetime.now().isoformat()
                )
        
        # Create episode record if needed
        episode_id = request.episode_id
        if not episode_id:
            episode_id = await proc.create_episode_from_podcast_index(episode_data)
        
        # Start background processing
        background_tasks.add_task(
            process_podcast_index_background, 
            episode_data, 
            episode_id, 
            request.force_reprocess
        )
        
        return PodcastIndexProcessResponse(
            episode_id=episode_id,
            status="processing",
            message="Podcast Index episode processing started",
            started_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Podcast Index process endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status/{episode_id}", response_model=StatusResponse)
async def get_episode_status(episode_id: str):
    """Get processing status for an episode"""
    try:
        proc = get_processor()
        
        result = proc.supabase.table('episodes')\
            .select('id, processing_status, created_at, updated_at, processing_metadata')\
            .eq('id', episode_id)\
            .execute()
        
        # Check if episode exists
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail=f"Episode with ID '{episode_id}' not found")
        
        episode = result.data[0]  # Get first result instead of using .single()
        error_message = None
        
        # Extract error from metadata if exists
        if episode.get('processing_metadata') and isinstance(episode['processing_metadata'], dict):
            error_message = episode['processing_metadata'].get('error')
        
        return StatusResponse(
            episode_id=episode['id'],
            processing_status=episode['processing_status'],
            created_at=episode.get('created_at'),
            updated_at=episode.get('updated_at'),
            error_message=error_message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Status endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch", response_model=BatchProcessResponse)
async def batch_process(request: BatchProcessRequest, background_tasks: BackgroundTasks):
    """Process multiple episodes in batch"""
    try:
        urls = [str(url) for url in request.youtube_urls]
        batch_id = f"batch_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        logger.info(f"Received batch processing request: {len(urls)} episodes")
        
        # Start batch processing in background
        async def batch_process_background():
            proc = get_processor()
            results = await proc.batch_process_episodes(urls, request.max_concurrent)
            logger.info(f"Batch {batch_id} completed: {len(results)} episodes processed")
            return results
        
        background_tasks.add_task(batch_process_background)
        
        return BatchProcessResponse(
            total_submitted=len(urls),
            message=f"Batch processing started with {request.max_concurrent} concurrent workers",
            batch_id=batch_id
        )
        
    except Exception as e:
        logger.error(f"Batch endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cache")
async def get_cache_stats():
    """Get cache statistics"""
    try:
        proc = get_processor()
        return proc.get_cache_stats()
    except Exception as e:
        logger.error(f"Cache endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Error handlers
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return {"error": "Internal server error", "detail": str(exc)}

# Development server runner
async def main():
    """Run the API server"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Podcast Processing API Server')
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind to')
    parser.add_argument('--port', type=int, default=8000, help='Port to bind to')
    parser.add_argument('--reload', action='store_true', help='Enable auto-reload for development')
    
    args = parser.parse_args()
    
    print(f"🚀 Starting Podcast Processing API on {args.host}:{args.port}")
    print(f"📖 API docs available at: http://{args.host}:{args.port}/docs")
    print(f"🔍 Health check: http://{args.host}:{args.port}/health")
    
    # Test processor initialization
    try:
        test_proc = get_processor()
        logger.info("✅ Processor initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize processor: {e}")
        return
    
    # Run the server
    config = uvicorn.Config(
        app,
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level="info"
    )
    server = uvicorn.Server(config)
    await server.serve()

if __name__ == "__main__":
    asyncio.run(main()) 