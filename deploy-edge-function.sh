#!/bin/bash

echo "🚀 Deploying Supabase Edge Function: extract-audio"
echo "=============================================="

# Check if Supabase CLI is available
if ! command -v npx supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    exit 1
fi

echo "📦 Edge function files:"
echo "  - supabase/functions/extract-audio/index.ts"
echo ""

# Note: You'll need to link to your project first
echo "⚠️  Before running this script, you need to:"
echo "   1. Link to your Supabase project:"
echo "      npx supabase link --project-ref YOUR_PROJECT_REF"
echo ""
echo "   2. Set your environment variables:"
echo "      npx supabase secrets set SUPABASE_URL=your_supabase_url"
echo "      npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
echo ""
echo "   3. Then run the deployment:"
echo "      npx supabase functions deploy extract-audio"
echo ""
echo "🔗 Your Supabase project URL should look like:"
echo "   https://your-project-ref.supabase.co"
echo ""
echo "🔑 Get your service role key from:"
echo "   Project Settings > API > service_role (secret)" 