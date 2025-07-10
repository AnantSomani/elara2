#!/bin/bash

# Elara Frontend-Backend Environment Setup Script
# This script helps you create the .env.local file with all required variables

echo "🚀 Setting up Elara Frontend-Backend Environment"
echo "=================================================="
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Create .env.local file
cat > .env.local << 'EOF'
# =============================================================================
# ELARA FRONTEND-BACKEND CONFIGURATION
# =============================================================================
# Set EXPO_PUBLIC_USE_MOCKS=false to use real backend
# Set EXPO_PUBLIC_USE_MOCKS=true to use mock data for frontend development

# Frontend/Backend Switch
EXPO_PUBLIC_USE_MOCKS=false

# =============================================================================
# SUPABASE DATABASE (Required)
# =============================================================================
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# =============================================================================
# AI SERVICES (Required for backend functionality)
# =============================================================================
# OpenAI for embeddings and response generation
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Claude for question rewriting  
EXPO_PUBLIC_CLAUDE_API_KEY=your_claude_api_key_here

# ElevenLabs for speech synthesis
EXPO_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# =============================================================================
# YOUTUBE DATA API (Required for fetching video metadata)
# =============================================================================
EXPO_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here

# =============================================================================
# GITHUB ACTIONS (Required for backend processing)
# =============================================================================
# GitHub Personal Access Token for triggering workflows
# Required permissions: repo (or public_repo), actions:write
EXPO_PUBLIC_GITHUB_TOKEN=your_github_personal_access_token_here

EOF

echo "✅ Created .env.local file!"
echo ""
echo "📝 Next Steps:"
echo "1. Open .env.local and replace all 'your_*_here' values with actual API keys"
echo "2. Set up GitHub repository secrets for backend processing"
echo "3. Test the connection with a podcast URL"
echo ""
echo "🔗 Useful Links:"
echo "- Supabase Dashboard: https://app.supabase.com/"
echo "- OpenAI API Keys: https://platform.openai.com/api-keys"
echo "- Claude API Keys: https://console.anthropic.com/"
echo "- ElevenLabs API Keys: https://elevenlabs.io/app/settings/api-keys"
echo "- YouTube API Console: https://console.developers.google.com/"
echo "- GitHub Tokens: https://github.com/settings/tokens"
echo ""
echo "📖 For detailed setup instructions, see: FRONTEND_BACKEND_RECONNECTION.md" 