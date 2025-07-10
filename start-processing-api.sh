#!/bin/bash

# Start the Python Processing API
# This enables real YouTube audio download and AssemblyAI processing

echo "🚀 Starting Python Processing API..."
echo ""

# Check if we're in the right directory
if [ ! -d "scripts" ]; then
    echo "❌ Error: Please run this script from the project root directory (where scripts/ folder exists)"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "podcast-env" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv podcast-env
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source podcast-env/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install -r scripts/requirements.txt

# Check for required environment variables
echo "🔍 Checking environment variables..."
if [ -z "$ASSEMBLYAI_API_KEY" ]; then
    echo "⚠️  Warning: ASSEMBLYAI_API_KEY not set"
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  Warning: OPENAI_API_KEY not set (needed for embeddings)"
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY not set (needed for database writes)"
fi

echo ""
echo "🎯 Starting FastAPI server on http://localhost:8000"
echo ""
echo "Available endpoints:"
echo "  • GET  / - API info"
echo "  • POST /process - Process YouTube URL"
echo "  • GET  /health - Health check"
echo "  • GET  /status/{episode_id} - Check processing status"
echo "  • GET  /docs - Interactive API documentation"
echo ""
echo "🔄 The API will download real audio from YouTube and transcribe with AssemblyAI"
echo "📊 Processing updates will appear in your Supabase database in real-time"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the API server
cd scripts
uvicorn processing_api:app --host 0.0.0.0 --port 8000 --reload 