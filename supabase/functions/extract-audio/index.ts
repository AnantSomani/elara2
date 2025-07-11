import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ExtractAudioRequest {
  youtubeUrl: string
  episodeId: string
}

serve(async (req: Request) => {
  // CORS headers for React Native
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { youtubeUrl, episodeId }: ExtractAudioRequest = await req.json()
    
    console.log(`🎵 Processing audio for episode: ${episodeId}`)
    console.log(`📹 YouTube URL: ${youtubeUrl}`)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 🔍 STEP 1: Check if episode already has a valid audio URL
    console.log('🔍 Checking existing audio URL...')
    const { data: episode, error: fetchError } = await supabase
      .from('episodes')
      .select('audio_url, processing_status')
      .eq('id', episodeId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch episode: ${fetchError.message}`)
    }

    // Check if we already have a valid audio URL
    const existingAudioUrl = episode?.audio_url
    const isMockAudio = !existingAudioUrl || 
                       existingAudioUrl.includes('SoundHelix') || 
                       existingAudioUrl.includes('mock') ||
                       existingAudioUrl.trim() === ''

    if (existingAudioUrl && !isMockAudio) {
      console.log('✅ Episode already has valid audio URL:', existingAudioUrl)
      return new Response(
        JSON.stringify({ 
          success: true, 
          episodeId,
          message: 'Episode already has valid audio URL - skipping extraction',
          audioUrl: existingAudioUrl,
          skipped: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log('📥 Audio URL needed - proceeding with extraction...')
    if (isMockAudio) {
      console.log('🔄 Replacing mock audio with real audio')
    }

    // 🔄 STEP 2: Update status to processing
    await supabase
      .from('episodes')
      .update({ processing_status: 'processing' })
      .eq('id', episodeId)

    // 🎵 STEP 3: Extract audio URL using yt-dlp
    const audioUrl = await extractAudioUrl(youtubeUrl)

    if (!audioUrl) {
      throw new Error('Failed to extract audio URL from YouTube')
    }

    console.log('✅ Audio URL extracted successfully')

    // 💾 STEP 4: Update episode with audio URL
    const { error } = await supabase
      .from('episodes')
      .update({ 
        audio_url: audioUrl,
        processing_status: 'completed'
      })
      .eq('id', episodeId)

    if (error) {
      throw error
    }

    console.log(`✅ Database updated for episode: ${episodeId}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        episodeId,
        message: 'Audio URL extracted and saved successfully',
        audioUrl: audioUrl,
        skipped: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Audio extraction failed:', error)

    // Try to update episode status to failed if we have the request data
    try {
      const body = await req.clone().json()
      if (body.episodeId) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        await supabase
          .from('episodes')
          .update({ 
            processing_status: 'failed'
          })
          .eq('id', body.episodeId)
      }
    } catch (updateError) {
      console.error('Failed to update error status:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function extractAudioUrl(youtubeUrl: string): Promise<string | null> {
  try {
    console.log('🔍 Extracting audio URL with yt-dlp...')

    const cmd = new Deno.Command("yt-dlp", {
      args: [
        "--no-download",
        "--get-url", 
        "--format", "bestaudio[ext=m4a]/bestaudio/best",
        "--quiet",
        youtubeUrl
      ],
      stdout: "piped",
      stderr: "piped"
    })

    const output = await cmd.output()

    if (output.code !== 0) {
      const errorMsg = new TextDecoder().decode(output.stderr)
      console.error(`yt-dlp failed with exit code ${output.code}: ${errorMsg}`)
      return null
    }

    const audioUrl = new TextDecoder().decode(output.stdout).trim()
    
    if (!audioUrl) {
      console.error('No audio URL returned from yt-dlp')
      return null
    }

    console.log('✅ yt-dlp extraction successful')
    return audioUrl

  } catch (error) {
    console.error('❌ yt-dlp execution failed:', error)
    return null
  }
} 