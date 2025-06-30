import axios from 'axios';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

const openaiClient = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Generate text embedding using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openaiClient.post('/embeddings', {
      model: 'text-embedding-3-small',
      input: text,
    });
    
    return response.data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Generate chat completion using GPT-4
 */
export async function generateChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<string> {
  const {
    model = 'gpt-4o',
    maxTokens = 300,
    temperature = 0.7,
  } = options;

  try {
    const response = await openaiClient.post('/chat/completions', {
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw new Error('Failed to generate response');
  }
}

/**
 * Generate a response in a podcast host's style
 */
export async function generateHostResponse(
  question: string,
  context: string,
  hostName: string,
  hostStyle: string
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are ${hostName}. ${hostStyle}

Answer the user's question based on the provided context from the episode. Stay in character and maintain the host's speaking style. Keep responses concise but informative (2-3 sentences max for text-to-speech).`
    },
    {
      role: 'user',
      content: `Context from episode:\n${context}\n\nQuestion: ${question}`
    }
  ];

  return generateChatCompletion(messages, {
    maxTokens: 250,
    temperature: 0.8,
  });
}

/**
 * Generate multiple embeddings for batch processing
 */
export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openaiClient.post('/embeddings', {
      model: 'text-embedding-3-small',
      input: texts,
    });
    
    return response.data.data.map((item: any) => item.embedding);
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw new Error('Failed to generate batch embeddings');
  }
}

/**
 * Validate OpenAI API key
 */
export async function validateApiKey(): Promise<boolean> {
  try {
    await openaiClient.get('/models');
    return true;
  } catch (error) {
    return false;
  }
} 