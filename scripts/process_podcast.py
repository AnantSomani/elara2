#!/usr/bin/env python3
"""
Background podcast processing agent with AssemblyAI
Handles transcription, speaker diarization, and embedding generation
"""

import os
import sys
import argparse
import asyncio
import time
from typing import List, Dict, Any, Optional
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')
load_dotenv('.env')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    import assemblyai as aai
    import openai
    from supabase import create_client, Client
    import yt_dlp
except ImportError as e:
    logger.error(f"Missing dependency: {e}")
    logger.error("Install with: pip install assemblyai openai supabase yt-dlp")
    sys.exit(1)

class AssemblyAIPodcastProcessor:
    def __init__(self):
        # Initialize AssemblyAI
        aai.settings.api_key = os.getenv('ASSEMBLYAI_API_KEY')
        if not aai.settings.api_key:
            raise ValueError("ASSEMBLYAI_API_KEY environment variable is required")
        
        # Initialize other clients
        self.openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.supabase: Client = create_client(
            os.getenv('EXPO_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        )
        
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
        
        # Fix: yt-dlp converts to .wav and deletes the original, so return the .wav path
        if output_path.endswith('.mp3'):
            wav_path = output_path[:-4] + '.wav'
        else:
            wav_path = output_path + '.wav'
        return wav_path
    
    async def transcribe_with_assemblyai(self, audio_path: str) -> Any:
        """Transcribe and diarize audio using AssemblyAI"""
        logger.info("Starting AssemblyAI transcription with speaker diarization...")
        
        # Configure transcription settings
        config = aai.TranscriptionConfig(
            # Core features
            speaker_labels=True,  # Enable speaker diarization
            # speakers_expected=4,  # Let AssemblyAI auto-detect speakers
            
            # Enhanced features
            auto_chapters=True,   # Auto-detect chapters
            entity_detection=True,  # Detect names, companies, etc.
            iab_categories=True,  # Content categorization
            
            # Quality settings
            language_code="en_us",
            punctuate=True,
            format_text=True,
            
            # Boost important words for better accuracy
            word_boost=[
                "Chamath", "Palihapitiya", "Sacks", "David", "Friedberg", 
                "Jason", "Calacanis", "All-In", "SPAC", "IPO", "SaaS", 
                "AI", "ML", "cryptocurrency", "venture capital", "startup"
            ],
            boost_param="high"
        )
        
        # Start transcription
        transcriber = aai.Transcriber(config=config)
        transcript = transcriber.transcribe(audio_path)
        
        # Wait for completion
        logger.info(f"Transcription queued with ID: {transcript.id}")
        
        while transcript.status not in [aai.TranscriptStatus.completed, aai.TranscriptStatus.error]:
            await asyncio.sleep(10)
            transcript = transcriber.get_transcript(transcript.id)
            logger.info(f"Transcription status: {transcript.status}")
        
        if transcript.status == aai.TranscriptStatus.error:
            raise Exception(f"AssemblyAI transcription failed: {transcript.error}")
        
        logger.info("Transcription completed successfully")
        return transcript
    
    def extract_segments_with_speakers(self, transcript) -> List[Dict]:
        """Extract segments with speaker labels and timestamps"""
        segments = []
        
        for utterance in transcript.utterances:
            # Extract word-level details if available
            words = []
            if hasattr(utterance, 'words') and utterance.words:
                for word in utterance.words:
                    words.append({
                        'text': word.text,
                        'start': word.start / 1000.0,
                        'end': word.end / 1000.0,
                        'confidence': word.confidence
                    })
            
            segment = {
                'text': utterance.text,
                'speaker': f"Speaker_{utterance.speaker}",  # Simple speaker labeling
                'start': utterance.start / 1000.0,  # Convert to seconds
                'end': utterance.end / 1000.0,
                'confidence': getattr(utterance, 'confidence', 0.9),
                'words': words,
                'segment_type': 'utterance',
                'language_code': 'en'
            }
            segments.append(segment)
        
        return segments
    
    def extract_chapters(self, transcript) -> List[Dict]:
        """Extract auto-detected chapters from AssemblyAI"""
        chapters = []
        
        if hasattr(transcript, 'chapters') and transcript.chapters:
            for chapter in transcript.chapters:
                chapters.append({
                    'start': chapter.start / 1000.0,
                    'end': chapter.end / 1000.0,
                    'headline': chapter.headline,
                    'summary': chapter.summary,
                    'gist': chapter.gist
                })
        
        return chapters
    
    def extract_entities(self, transcript) -> List[Dict]:
        """Extract detected entities from AssemblyAI"""
        entities = []
        
        if hasattr(transcript, 'entities') and transcript.entities:
            for entity in transcript.entities:
                entities.append({
                    'text': entity.text,
                    'entity_type': entity.entity_type,
                    'start': entity.start / 1000.0,
                    'end': entity.end / 1000.0
                })
        
        return entities
    
    async def generate_embeddings(self, segments: List[Dict]) -> List[Dict]:
        """Generate embeddings for text segments"""
        logger.info("Generating embeddings...")
        
        embeddings_data = []
        
        for segment in segments:
            if segment['text'].strip():
                try:
                    response = self.openai_client.embeddings.create(
                        model="text-embedding-3-small",
                        input=segment['text']
                    )
                    
                    embeddings_data.append({
                        'content': segment['text'],
                        'speaker': segment['speaker'],
                        'timestamp_start': segment['start'],
                        'timestamp_end': segment['end'],
                        'embedding': response.data[0].embedding
                    })
                    
                except Exception as e:
                    logger.error(f"Error generating embedding for segment: {e}")
                    continue
                    
        return embeddings_data
    
    def get_processing_metadata(self, transcript) -> Dict:
        """Extract processing metadata from AssemblyAI"""
        return {
            'assemblyai_transcript_id': transcript.id,
            'language_detected': getattr(transcript, 'language_code', 'en'),
            'audio_duration': getattr(transcript, 'audio_duration', 0) / 1000.0,
            'confidence_score': getattr(transcript, 'confidence', 0.0),
            'processing_time': time.time(),
            'model_version': 'assemblyai-v2',
            'features_used': [
                'speaker_diarization',
                'auto_chapters', 
                'entity_detection',
                'iab_categories'
            ]
        }
    
    async def save_to_supabase(self, episode_id: str, segments: List[Dict], 
                             full_transcript: str, chapters: List[Dict], 
                             entities: List[Dict], metadata: Dict):
        """Save processed data to Supabase with AssemblyAI schema"""
        logger.info("Saving to Supabase...")
        
        try:
            # Get unique speakers
            speakers = list(set(segment['speaker'] for segment in segments))
            
            # Update episode with AssemblyAI data
            episode_update = {
                'processing_status': 'processing',
                'assemblyai_transcript_id': metadata['assemblyai_transcript_id'],
                'assemblyai_status': 'completed',
                'speakers': speakers,
                'processing_metadata': metadata
            }
            
            # Add chapters if available
            if chapters:
                episode_update['episode_chapters'] = chapters
            
            # Add entities if available
            if entities:
                episode_update['detected_entities'] = entities
            
            self.supabase.table('episodes').update(episode_update).eq('id', episode_id).execute()
            
            # Insert segments
            segment_data = []
            for segment in segments:
                segment_data.append({
                    'episode_id': episode_id,
                    'content': segment['content'],
                    'speaker_name': segment['speaker'],
                    'start_time': segment['timestamp_start'],
                    'end_time': segment['timestamp_end'],
                    'embedding': segment['embedding']
                })
            
            # Batch insert segments
            if segment_data:
                self.supabase.table('transcript_segments').insert(segment_data).execute()
            
            # Insert processing log entry
            processing_log = {
                'episode_id': episode_id,
                'processing_type': 'assemblyai_transcription',
                'status': 'completed',
                'metadata': metadata
            }
            self.supabase.table('processing_logs').insert(processing_log).execute()
            
            # Update final status
            self.supabase.table('episodes').update({
                'processing_status': 'completed'
            }).eq('id', episode_id).execute()
            
            logger.info("Successfully saved to Supabase")
            
        except Exception as e:
            logger.error(f"Error saving to Supabase: {e}")
            # Log the error
            try:
                error_log = {
                    'episode_id': episode_id,
                    'processing_type': 'assemblyai_transcription',
                    'status': 'failed',
                    'error_message': str(e),
                    'metadata': metadata
                }
                self.supabase.table('processing_logs').insert(error_log).execute()
            except:
                pass  # Don't fail on logging error
            
            # Update episode status to failed
            self.supabase.table('episodes').update({
                'processing_status': 'failed',
                'assemblyai_status': 'failed'
            }).eq('id', episode_id).execute()
            raise
    
    async def process(self, podcast_url: str, episode_id: str):
        """Main processing pipeline using AssemblyAI"""
        try:
            # Update status to processing
            self.supabase.table('episodes').update({
                'processing_status': 'processing',
                'assemblyai_status': 'processing'
            }).eq('id', episode_id).execute()
            
            # Step 1: Download audio
            logger.info("Step 1: Downloading audio...")
            logger.info(f"Calling download_audio with output_path: /tmp/{episode_id}")
            base_episode_id = os.path.splitext(episode_id)[0]
            audio_path = await self.download_audio(podcast_url, f"/tmp/{base_episode_id}")
            
            # Step 2: Transcribe and diarize with AssemblyAI
            logger.info("Step 2: Transcribing with AssemblyAI...")
            transcript = await self.transcribe_with_assemblyai(audio_path)
            
            # Step 3: Extract segments with speakers
            logger.info("Step 3: Extracting segments...")
            segments = self.extract_segments_with_speakers(transcript)
            
            # Step 4: Extract chapters
            logger.info("Step 4: Extracting chapters...")
            chapters = self.extract_chapters(transcript)
            
            # Step 5: Extract entities
            logger.info("Step 5: Extracting entities...")
            entities = self.extract_entities(transcript)
            
            # Step 6: Generate embeddings
            logger.info("Step 6: Generating embeddings...")
            segments_with_embeddings = await self.generate_embeddings(segments)
            
            # Step 7: Create full transcript
            full_transcript = " ".join([seg['text'] for seg in segments])
            
            # Step 8: Get processing metadata
            metadata = self.get_processing_metadata(transcript)
            
            # Step 9: Save to Supabase
            logger.info("Step 9: Saving to Supabase...")
            await self.save_to_supabase(
                episode_id, 
                segments_with_embeddings, 
                full_transcript, 
                chapters, 
                entities, 
                metadata
            )
            
            # Clean up temporary files
            try:
                os.remove(audio_path)
            except:
                pass
            
            logger.info(f"Successfully processed episode {episode_id}")
            
        except Exception as e:
            logger.error(f"Error processing podcast: {e}")
            # Update status to failed
            try:
                self.supabase.table('episodes').update({
                    'processing_status': 'failed',
                    'assemblyai_status': 'failed'
                }).eq('id', episode_id).execute()
            except:
                pass  # Don't fail on status update error
            raise

    async def process_podcast_index_audio(self, audio_url: str, episode_id: str):
        """Process Podcast Index audio using AssemblyAI"""
        try:
            # Update status to processing
            self.supabase.table('episodes').update({
                'processing_status': 'processing',
                'assemblyai_status': 'processing'
            }).eq('id', episode_id).execute()
            
            # Step 1: Download audio from direct URL
            logger.info("Step 1: Downloading Podcast Index audio...")
            logger.info(f"Calling download_audio with output_path: /tmp/{episode_id}")
            base_episode_id = os.path.splitext(episode_id)[0]
            audio_path = await self.download_audio(audio_url, f"/tmp/{base_episode_id}")
            
            # Step 2: Transcribe and diarize with AssemblyAI
            logger.info("Step 2: Transcribing with AssemblyAI...")
            transcript = await self.transcribe_with_assemblyai(audio_path)
            
            # Step 3: Extract segments with speakers
            logger.info("Step 3: Extracting segments...")
            segments = self.extract_segments_with_speakers(transcript)
            
            # Step 4: Extract chapters
            logger.info("Step 4: Extracting chapters...")
            chapters = self.extract_chapters(transcript)
            
            # Step 5: Extract entities
            logger.info("Step 5: Extracting entities...")
            entities = self.extract_entities(transcript)
            
            # Step 6: Generate embeddings
            logger.info("Step 6: Generating embeddings...")
            segments_with_embeddings = await self.generate_embeddings(segments)
            
            # Step 7: Create full transcript
            full_transcript = " ".join([seg['text'] for seg in segments])
            
            # Step 8: Get processing metadata
            metadata = self.get_processing_metadata(transcript)
            
            # Step 9: Save to Supabase
            logger.info("Step 9: Saving to Supabase...")
            await self.save_to_supabase(
                episode_id, 
                segments_with_embeddings, 
                full_transcript, 
                chapters, 
                entities, 
                metadata
            )
            
            # Clean up temporary files
            try:
                os.remove(audio_path)
            except:
                pass
            
            logger.info(f"Successfully processed Podcast Index episode {episode_id}")
            
        except Exception as e:
            logger.error(f"Error processing Podcast Index audio: {e}")
            # Update status to failed
            try:
                self.supabase.table('episodes').update({
                    'processing_status': 'failed',
                    'assemblyai_status': 'failed'
                }).eq('id', episode_id).execute()
            except:
                pass  # Don't fail on status update error
            raise

async def main():
    parser = argparse.ArgumentParser(description='Process podcast episode with AssemblyAI')
    parser.add_argument('--url', required=True, help='Podcast episode URL')
    parser.add_argument('--episode-id', required=True, help='Episode ID')
    
    args = parser.parse_args()
    
    processor = AssemblyAIPodcastProcessor()
    await processor.process(args.url, args.episode_id)

if __name__ == "__main__":
    asyncio.run(main()) 