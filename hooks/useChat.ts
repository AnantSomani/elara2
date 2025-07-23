import { useState } from 'react';
import { sendQuestion, type QuestionResponse } from '../lib/api';
import type { SupermemorySearchResult } from '../lib/supermemory';

export interface ChatMessage {
  id: string;
  type: 'question' | 'response';
  content: string;
  audioUrl?: string;
  timestamp: Date;
  isLoading?: boolean;
  // Enhanced fields for memory context
  memoryResults?: SupermemorySearchResult[];
  usedMemorySearch?: boolean;
  relevantSegments?: any[]; // Keep for backward compatibility
}

export interface UseChatResult {
  messages: ChatMessage[];
  isProcessing: boolean;
  sendMessage: (question: string) => Promise<void>;
  clearMessages: () => void;
  // Enhanced stats
  memorySearchStats: {
    totalSearches: number;
    memorySearches: number;
    fallbackSearches: number;
    averageMemoryResults: number;
  };
}

/**
 * Custom hook for managing chat state and interactions
 * Enhanced with Supermemory integration and memory search tracking
 */
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

    try {
      setIsProcessing(true);

      // Add question to chat
      const questionMessage: ChatMessage = {
        id: questionId,
        type: 'question',
        content: question,
        timestamp: new Date(),
      };

      // Add loading response
      const loadingMessage: ChatMessage = {
        id: responseId,
        type: 'response',
        content: 'Thinking...',
        timestamp: new Date(),
        isLoading: true,
      };

      setMessages(prev => [...prev, questionMessage, loadingMessage]);

      // Send question to API
      const response = await sendQuestion(episodeId, question);

      // Update memory search stats
      setMemorySearchStats(prev => {
        const newTotal = prev.totalSearches + 1;
        const newMemorySearches = prev.memorySearches + (response.usedMemorySearch ? 1 : 0);
        const newFallbackSearches = prev.fallbackSearches + (response.usedMemorySearch ? 0 : 1);
        const newAverage = response.memoryResults?.length || 0;
        
        return {
          totalSearches: newTotal,
          memorySearches: newMemorySearches,
          fallbackSearches: newFallbackSearches,
          averageMemoryResults: newAverage,
        };
      });

      // Update with actual response
      const responseMessage: ChatMessage = {
        id: responseId,
        type: 'response',
        content: response.answer,
        audioUrl: response.audioUrl,
        timestamp: new Date(),
        isLoading: false,
        // Enhanced memory context
        memoryResults: response.memoryResults,
        usedMemorySearch: response.usedMemorySearch,
        relevantSegments: response.relevantSegments,
      };

      setMessages(prev => 
        prev.map(msg => 
          msg.id === responseId ? responseMessage : msg
        )
      );

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update with error message
      const errorMessage: ChatMessage = {
        id: responseId,
        type: 'response',
        content: 'Sorry, I encountered an error processing your question. Please try again.',
        timestamp: new Date(),
        isLoading: false,
      };

      setMessages(prev => 
        prev.map(msg => 
          msg.id === responseId ? errorMessage : msg
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    // Reset stats when clearing messages
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