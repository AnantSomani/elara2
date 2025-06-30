/**
 * GitHub Actions integration for triggering background processing
 */

const GITHUB_TOKEN = process.env.EXPO_PUBLIC_GITHUB_TOKEN;
const REPO_OWNER = 'AnantSomani';
const REPO_NAME = 'elara2';

interface GitHubWorkflowResponse {
  success: boolean;
  error?: string;
}

/**
 * Trigger podcast processing workflow via repository dispatch
 */
export async function triggerPodcastProcessing(
  podcastUrl: string, 
  episodeId: string
): Promise<GitHubWorkflowResponse> {
  try {
    if (!GITHUB_TOKEN) {
      throw new Error('GitHub token not configured');
    }

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
      const errorText = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
    }

    console.log('Successfully triggered podcast processing workflow');
    return { success: true };
    
  } catch (error) {
    console.error('Error triggering workflow:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Trigger manual workflow dispatch
 */
export async function triggerManualProcessing(
  podcastUrl: string, 
  episodeId: string
): Promise<GitHubWorkflowResponse> {
  try {
    if (!GITHUB_TOKEN) {
      throw new Error('GitHub token not configured');
    }

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
      const errorText = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
    }

    console.log('Successfully triggered manual processing workflow');
    return { success: true };
    
  } catch (error) {
    console.error('Error triggering manual workflow:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get workflow run status
 */
export async function getWorkflowStatus(runId: string) {
  try {
    if (!GITHUB_TOKEN) {
      throw new Error('GitHub token not configured');
    }

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${runId}`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      status: data.status,
      conclusion: data.conclusion,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
    
  } catch (error) {
    console.error('Error getting workflow status:', error);
    throw error;
  }
} 