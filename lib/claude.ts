import axios from 'axios';

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '';

const claudeClient = axios.create({
  baseURL: 'https://api.anthropic.com/v1',
  headers: {
    'Authorization': `Bearer ${CLAUDE_API_KEY}`,
    'Content-Type': 'application/json',
    'x-api-key': CLAUDE_API_KEY,
    'anthropic-version': '2023-06-01',
  },
});

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Generate a completion using Claude
 */
export async function generateCompletion(
  messages: ClaudeMessage[],
  options: ClaudeOptions = {}
): Promise<string> {
  const {
    model = 'claude-3-haiku-20240307',
    maxTokens = 150,
    temperature = 0.3,
  } = options;

  try {
    const response = await claudeClient.post('/messages', {
      model,
      max_tokens: maxTokens,
      temperature,
      messages,
    });
    
    return response.data.content[0].text;
  } catch (error) {
    console.error('Error generating Claude completion:', error);
    throw new Error('Failed to generate Claude response');
  }
}

/**
 * Rewrite a question to be more specific and searchable
 */
export async function rewriteQuestion(
  question: string,
  episodeTitle: string,
  hosts: string[] = []
): Promise<string> {
  const hostContext = hosts.length > 0 ? ` with hosts ${hosts.join(', ')}` : '';
  
  const messages: ClaudeMessage[] = [
    {
      role: 'user',
      content: `Rewrite this question to be more specific and searchable for a podcast episode titled "${episodeTitle}"${hostContext}. 

Guidelines:
- Make it more specific and targeted
- Include relevant keywords that might appear in the transcript
- Maintain the original intent
- Keep it concise
- Focus on the main topic or concept being asked about

Original question: ${question}

Rewritten question:`
    }
  ];

  try {
    const rewritten = await generateCompletion(messages, {
      maxTokens: 100,
      temperature: 0.3,
    });
    
    // Fallback to original if rewrite failed or is empty
    return rewritten.trim() || question;
  } catch (error) {
    console.error('Error rewriting question:', error);
    return question; // Fallback to original question
  }
}

/**
 * Extract key topics from a question
 */
export async function extractTopics(question: string): Promise<string[]> {
  const messages: ClaudeMessage[] = [
    {
      role: 'user',
      content: `Extract the main topics or keywords from this question that would be useful for searching a podcast transcript. Return as a comma-separated list.

Question: ${question}

Topics:`
    }
  ];

  try {
    const response = await generateCompletion(messages, {
      maxTokens: 50,
      temperature: 0.1,
    });
    
    return response
      .split(',')
      .map(topic => topic.trim())
      .filter(topic => topic.length > 0);
  } catch (error) {
    console.error('Error extracting topics:', error);
    return [];
  }
}

/**
 * Summarize episode context for better RAG
 */
export async function summarizeContext(
  segments: string[],
  question: string
): Promise<string> {
  const context = segments.join('\n\n');
  
  const messages: ClaudeMessage[] = [
    {
      role: 'user',
      content: `Summarize the following podcast segments in relation to this question: "${question}"

Focus on the most relevant information that would help answer the question.

Segments:
${context}

Summary:`
    }
  ];

  try {
    return await generateCompletion(messages, {
      maxTokens: 200,
      temperature: 0.3,
    });
  } catch (error) {
    console.error('Error summarizing context:', error);
    return context; // Fallback to original context
  }
}

/**
 * Validate Claude API key
 */
export async function validateApiKey(): Promise<boolean> {
  try {
    const messages: ClaudeMessage[] = [
      { role: 'user', content: 'Hello' }
    ];
    
    await generateCompletion(messages, { maxTokens: 10 });
    return true;
  } catch (error) {
    return false;
  }
} 