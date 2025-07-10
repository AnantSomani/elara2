#!/usr/bin/env python3
"""
Simple HTTP server to serve audio files for React Native
"""

import os
import sys
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading
import time

# Load environment
sys.path.append(str(Path(__file__).parent))

def load_env_file():
    env_file = Path(__file__).parent.parent / '.env.local'
    if env_file.exists():
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

class AudioHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Set the directory to serve from
        self.directory = str(Path(__file__).parent.parent / 'audio')
        super().__init__(*args, directory=self.directory, **kwargs)
    
    def end_headers(self):
        # Add CORS headers for React Native
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

def start_audio_server(port=3001):
    """Start HTTP server to serve audio files"""
    
    audio_dir = Path(__file__).parent.parent / 'audio'
    if not audio_dir.exists():
        print(f"❌ Audio directory not found: {audio_dir}")
        return None
    
    print(f"🎵 Starting audio server on port {port}")
    print(f"📁 Serving files from: {audio_dir}")
    
    # Change to audio directory
    os.chdir(audio_dir)
    
    server = HTTPServer(('localhost', port), AudioHandler)
    
    def run_server():
        print(f"🚀 Audio server running at http://localhost:{port}")
        server.serve_forever()
    
    # Start server in background thread
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    return server, port

def update_episode_with_server_url(port=3001):
    """Update episode to use HTTP server URL instead of file URL"""
    
    load_env_file()
    
    try:
        from supabase import create_client
        supabase = create_client(
            os.getenv('EXPO_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        )
        
        episode_id = 'e6d8ed84-c6a3-42b9-9e3b-b6859cddeaf3'
        server_url = f"http://localhost:{port}/{episode_id}.mp3"
        
        print(f"🔗 Updating episode to use server URL: {server_url}")
        
        result = supabase.table('episodes').update({
            'audio_url': server_url
        }).eq('id', episode_id).execute()
        
        print(f"✅ Episode updated with server URL!")
        return server_url
        
    except Exception as e:
        print(f"❌ Error updating episode: {e}")
        return None

def main():
    print("🎵 Local Audio Server for React Native")
    print("=" * 40)
    
    # Start the server
    server_info = start_audio_server(3001)
    if not server_info:
        return
    
    server, port = server_info
    
    # Update the database
    server_url = update_episode_with_server_url(port)
    if not server_url:
        return
    
    print(f"\n🎉 Audio server is ready!")
    print(f"🔗 Episode audio URL: {server_url}")
    print(f"📱 Your React Native app can now load the real YouTube audio!")
    print(f"\n💡 Keep this terminal open while testing the app")
    print(f"⏹️  Press Ctrl+C to stop the server")
    
    try:
        # Keep the main thread alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print(f"\n🛑 Stopping audio server...")
        server.shutdown()
        print(f"✅ Server stopped")

if __name__ == "__main__":
    main() 