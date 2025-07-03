// MOCK useChat hook for frontend design/dev only
// To enable: set EXPO_PUBLIC_USE_MOCKS=true in your .env.local
// To disable: set EXPO_PUBLIC_USE_MOCKS=false

import { useState } from 'react';
import type { UseChatResult, ChatMessage } from './useChat';

export function useChat(episodeId: string): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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
      setMessages(prev => prev.map(msg =>
        msg.id === responseId
          ? {
              ...msg,
              content: `Mock answer to: "${question}"`,
              audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
              isLoading: false,
            }
          : msg
      ));
      setIsProcessing(false);
    }, 1000);
  };

  const clearMessages = () => setMessages([]);

  return {
    messages,
    isProcessing,
    sendMessage,
    clearMessages,
  };
} 