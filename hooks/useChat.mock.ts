// MOCK useChat hook for frontend design/dev only
// To enable: set EXPO_PUBLIC_USE_MOCKS=true in your .env.local
// To disable: set EXPO_PUBLIC_USE_MOCKS=false

import { useState } from 'react';
import type { UseChatResult, ChatMessage } from './useChat';

export function useChat(episodeId: string): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [memorySearchStats, setMemorySearchStats] = useState({
    totalSearches: 0,
    memorySearches: 0,
    fallbackSearches: 0,
    averageMemoryResults: 0,
  });

  const sendMessage = async (question: string) => {
    const questionId = Date.now().toString();
    const responseId = (Date.now() + 1).toString();
    setIsProcessing(true);
    
    setMessages(prev => [
      ...prev,
      {
        id: questionId,
        type: 'question',
        content: question,
        timestamp: new Date(),
      },
      {
        id: responseId,
        type: 'response',
        content: 'Thinking...',
        timestamp: new Date(),
        isLoading: true,
      },
    ]);

    // Simulate AI response delay
    setTimeout(() => {
      // Mock memory search results
      const mockMemoryResults = question.toLowerCase().includes('ai') || question.toLowerCase().includes('artificial') 
        ? [{
          chunks: [{ content: 'Mock memory about artificial intelligence and machine learning concepts.', isRelevant: true, score: 0.85 }],
          createdAt: new Date().toISOString(),
          documentId: 'mock-memory-1',
          metadata: { speaker_name: 'Host', episode_id: episodeId },
          score: 0.85,
          summary: 'AI and ML concepts discussion',
          title: 'Mock Memory',
          updatedAt: new Date().toISOString(),
        }]
        : [];

      const usedMemorySearch = mockMemoryResults.length > 0;

      // Update stats
      setMemorySearchStats(prev => ({
        totalSearches: prev.totalSearches + 1,
        memorySearches: prev.memorySearches + (usedMemorySearch ? 1 : 0),
        fallbackSearches: prev.fallbackSearches + (usedMemorySearch ? 0 : 1),
        averageMemoryResults: mockMemoryResults.length,
      }));

      setMessages(prev => prev.map(msg =>
        msg.id === responseId
          ? {
              ...msg,
              content: `Mock answer to: "${question}"${usedMemorySearch ? ' (with memory context)' : ''}`,
              audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
              isLoading: false,
              memoryResults: mockMemoryResults,
              usedMemorySearch,
            }
          : msg
      ));
      setIsProcessing(false);
    }, 1000);
  };

  const clearMessages = () => {
    setMessages([]);
    setMemorySearchStats({
      totalSearches: 0,
      memorySearches: 0,
      fallbackSearches: 0,
      averageMemoryResults: 0,
    });
  };

  return {
    messages,
    isProcessing,
    sendMessage,
    clearMessages,
    memorySearchStats,
  };
} 