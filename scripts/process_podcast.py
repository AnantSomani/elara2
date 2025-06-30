#!/usr/bin/env python3
"""
Background podcast processing agent
Handles transcription, diarization, and embedding generation
"""

import os
import sys
import argparse
import asyncio
from typing import List, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    import whisperx
    import torch
    from pyannote.audio import Pipeline
    import openai
    from supabase import create_client, Client
    import yt_dlp
    from pydub import AudioSegment
except ImportError as e:
    logger.error(f"Missing dependency: {e}")
    sys.exit(1)

class PodcastProcessor:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.supabase: Client = create_client(
            os.getenv('SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_KEY')
        )
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
    async def download_audio(self, url: str, output_path: str) -> str:
        """Download audio from podcast URL"""
        logger.info(f"Downloading audio from: {url}")
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': output_path,
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'wav',
                'preferredquality': '192',
            }],
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
            
        return output_path.replace('.%(ext)s', '.wav')
    
    async def transcribe_audio(self, audio_path: str) -> Dict[str, Any]:
        """Transcribe audio using WhisperX"""
        logger.info("Starting transcription...")
        
        # Load WhisperX model
        model = whisperx.load_model("large-v2", self.device)
        
        # Load audio
        audio = whisperx.load_audio(audio_path)
        
        # Transcribe
        result = model.transcribe(audio, batch_size=16)
        
        return result
    
    async def diarize_speakers(self, audio_path: str, transcription: Dict) -> Dict[str, Any]:
        """Perform speaker diarization using pyannote"""
        logger.info("Starting speaker diarization...")
        
        # Load diarization pipeline
        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token=os.getenv('HUGGINGFACE_TOKEN')
        )
        
        # Run diarization
        diarization = pipeline(audio_path)
        
        # Align with transcription
        model_a, metadata = whisperx.load_align_model(
            language_code=transcription["language"], 
            device=self.device
        )
        
        result = whisperx.align(
            transcription["segments"], 
            model_a, 
            metadata, 
            audio_path, 
            self.device
        )
        
        # Assign speakers
        result = whisperx.assign_word_speakers(diarization, result)
        
        return result
    
    async def generate_embeddings(self, segments: List[Dict]) -> List[Dict]:
        """Generate embeddings for text segments"""
        logger.info("Generating embeddings...")
        
        embeddings_data = []
        
        for segment in segments:
            if 'text' in segment and segment['text'].strip():
                try:
                    response = self.openai_client.embeddings.create(
                        model="text-embedding-3-small",
                        input=segment['text']
                    )
                    
                    embeddings_data.append({
                        'content': segment['text'],
                        'speaker': segment.get('speaker', 'Unknown'),
                        'timestamp_start': segment.get('start', 0),
                        'timestamp_end': segment.get('end', 0),
                        'embedding': response.data[0].embedding
                    })
                    
                except Exception as e:
                    logger.error(f"Error generating embedding: {e}")
                    continue
                    
        return embeddings_data
    
    async def save_to_supabase(self, episode_id: str, segments: List[Dict], full_transcript: str):
        """Save processed data to Supabase"""
        logger.info("Saving to Supabase...")
        
        try:
            # Update episode with transcript
            self.supabase.table('episodes').update({
                'transcript': full_transcript,
                'processing_status': 'processing'
            }).eq('id', episode_id).execute()
            
            # Insert segments
            segment_data = []
            for segment in segments:
                segment_data.append({
                    'episode_id': episode_id,
                    'content': segment['content'],
                    'speaker': segment['speaker'],
                    'timestamp_start': segment['timestamp_start'],
                    'timestamp_end': segment['timestamp_end'],
                    'embedding': segment['embedding']
                })
            
            # Batch insert segments
            self.supabase.table('segments').insert(segment_data).execute()
            
            # Update status to completed
            self.supabase.table('episodes').update({
                'processing_status': 'completed'
            }).eq('id', episode_id).execute()
            
            logger.info("Successfully saved to Supabase")
            
        except Exception as e:
            logger.error(f"Error saving to Supabase: {e}")
            # Update status to failed
            self.supabase.table('episodes').update({
                'processing_status': 'failed'
            }).eq('id', episode_id).execute()
            raise
    
    async def process(self, podcast_url: str, episode_id: str):
        """Main processing pipeline"""
        try:
            # Update status to processing
            self.supabase.table('episodes').update({
                'processing_status': 'processing'
            }).eq('id', episode_id).execute()
            
            # Download audio
            audio_path = await self.download_audio(podcast_url, f"/tmp/{episode_id}")
            
            # Transcribe
            transcription = await self.transcribe_audio(audio_path)
            
            # Diarize speakers
            diarized_result = await self.diarize_speakers(audio_path, transcription)
            
            # Generate embeddings
            segments_with_embeddings = await self.generate_embeddings(diarized_result['segments'])
            
            # Create full transcript
            full_transcript = " ".join([seg['text'] for seg in diarized_result['segments']])
            
            # Save to Supabase
            await self.save_to_supabase(episode_id, segments_with_embeddings, full_transcript)
            
            logger.info(f"Successfully processed episode {episode_id}")
            
        except Exception as e:
            logger.error(f"Error processing podcast: {e}")
            # Update status to failed
            self.supabase.table('episodes').update({
                'processing_status': 'failed'
            }).eq('id', episode_id).execute()
            raise

async def main():
    parser = argparse.ArgumentParser(description='Process podcast episode')
    parser.add_argument('--url', required=True, help='Podcast episode URL')
    parser.add_argument('--episode-id', required=True, help='Episode ID')
    
    args = parser.parse_args()
    
    processor = PodcastProcessor()
    await processor.process(args.url, args.episode_id)

if __name__ == "__main__":
    asyncio.run(main()) 