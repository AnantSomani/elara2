/**
 * Utility to trigger GitHub Actions workflow for podcast processing
 * Call this from your app when a new podcast is submitted
 */

const GITHUB_TOKEN = process.env.EXPO_PUBLIC_GITHUB_TOKEN;
const REPO_OWNER = 'AnantSomani';
const REPO_NAME = 'elara2';

export async function triggerPodcastProcessing(podcastUrl, episodeId) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'process-podcast',
          client_payload: {
            podcast_url: podcastUrl,
            episode_id: episodeId,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    console.log('Successfully triggered podcast processing workflow');
    return true;
  } catch (error) {
    console.error('Error triggering workflow:', error);
    throw error;
  }
}

// Alternative: Manual workflow dispatch
export async function triggerManualProcessing(podcastUrl, episodeId) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/podcast-processing.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            podcast_url: podcastUrl,
            episode_id: episodeId,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    console.log('Successfully triggered manual processing workflow');
    return true;
  } catch (error) {
    console.error('Error triggering manual workflow:', error);
    throw error;
  }
} 