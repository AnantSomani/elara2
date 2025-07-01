const YOUTUBE_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || '';

export interface YouTubeVideoData {
  id: string;
  title: string;
  description: string;
  duration: string; // ISO 8601 format (PT4M13S)
  durationSeconds: number;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
}

/**
 * Extract video ID from YouTube URL
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validate if URL is a valid YouTube video URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}

/**
 * Convert ISO 8601 duration to seconds
 * e.g., "PT4M13S" -> 253 seconds
 */
function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Fetch video metadata from YouTube API
 */
export async function getVideoMetadata(videoId: string): Promise<YouTubeVideoData> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,contentDetails`;

  try {
    console.log('🔍 Fetching YouTube metadata for video:', videoId);
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`YouTube API error: ${data.error?.message || 'Unknown error'}`);
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found or is private');
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;

    const durationSeconds = parseISO8601Duration(contentDetails.duration);
    
    // Validate duration (should be reasonable for a podcast)
    if (durationSeconds < 60) {
      throw new Error('Video is too short (less than 1 minute)');
    }
    
    if (durationSeconds > 14400) { // 4 hours
      throw new Error('Video is too long (over 4 hours). Please use shorter content.');
    }

    return {
      id: videoId,
      title: snippet.title,
      description: snippet.description || '',
      duration: contentDetails.duration,
      durationSeconds,
      thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
      channelTitle: snippet.channelTitle,
      publishedAt: snippet.publishedAt,
    };
  } catch (error) {
    console.error('❌ YouTube API error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch video information');
  }
}

/**
 * Process YouTube URL and return video metadata
 */
export async function processYouTubeUrl(url: string): Promise<YouTubeVideoData> {
  // Step 1: Validate URL format
  if (!isValidYouTubeUrl(url)) {
    throw new Error('Please enter a valid YouTube URL');
  }

  // Step 2: Extract video ID
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Could not extract video ID from URL');
  }

  // Step 3: Fetch metadata
  const metadata = await getVideoMetadata(videoId);
  
  console.log('✅ YouTube video processed:', {
    title: metadata.title,
    duration: `${Math.floor(metadata.durationSeconds / 60)}:${(metadata.durationSeconds % 60).toString().padStart(2, '0')}`,
    channel: metadata.channelTitle,
  });

  return metadata;
} 