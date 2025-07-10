#!/bin/bash
"""
Phase 1 Setup Script - Direct Processing
"""

echo "🚀 Setting up Phase 1: Direct Processing..."
echo ""

# Check Python version
echo "🐍 Checking Python version..."
python3 --version || {
    echo "❌ Python 3 is required"
    exit 1
}

# Check if we're in the scripts directory
if [ ! -f "direct_processor.py" ]; then
    echo "❌ Please run this script from the scripts/ directory"
    echo "   cd scripts && ./setup_phase1.sh"
    exit 1
fi

# Install/upgrade dependencies
echo ""
echo "📦 Installing/updating dependencies..."
pip3 install -r requirements.txt || {
    echo "❌ Failed to install dependencies"
    exit 1
}

# Test environment and connections
echo ""
echo "🧪 Running environment tests..."
python3 test_direct_processing.py || {
    echo "❌ Environment tests failed"
    echo ""
    echo "🔧 Make sure your .env.local file in the project root has:"
    echo "  ASSEMBLYAI_API_KEY=your_key"
    echo "  OPENAI_API_KEY=your_key"
    echo "  EXPO_PUBLIC_SUPABASE_URL=your_url"
    echo "  SUPABASE_SERVICE_ROLE_KEY=your_key"
    exit 1
}

# Create directories
echo ""
echo "📁 Setting up directories..."
mkdir -p cache
mkdir -p logs

echo ""
echo "✅ Phase 1 setup complete!"
echo ""
echo "🎯 Quick Test Commands:"
echo ""
echo "1. Check already processed episodes:"
echo "   python3 direct_processor.py --cache-stats"
echo ""
echo "2. Test with your existing episode (already in database):"
echo "   python3 direct_processor.py --url 'https://www.youtube.com/watch?v=u1Rp1J3HwrE' --check-only"
echo ""
echo "3. Start the API server:"
echo "   python3 processing_api.py"
echo "   # Then visit: http://localhost:8000/docs"
echo ""
echo "4. Process a real episode (uses API quotas):"
echo "   python3 direct_processor.py --url 'https://www.youtube.com/watch?v=SHORT_VIDEO_ID'"
echo ""
echo "🔗 Next: Update your frontend to use bypass mode by setting:"
echo "   EXPO_PUBLIC_PROCESSING_MODE=bypass in .env.local" 