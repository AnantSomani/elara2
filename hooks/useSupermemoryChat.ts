// Enhanced chat hook with Supermemory integration
// Supports Infinite Chat and session memory

import { useState, useEffect, useCallback } from 'react';
import { sendQuestionWithSupermemory, type SupermemoryQuestionResponse, type SupermemorySearchOptions } from '../lib/api.supermemory';
import { supermemoryClient } from '../lib/supermemory';

export interface SupermemoryChatMessage {
  id: string;
  type: 'question' | 'response';
  content: string;
  audioUrl?: string;
  timestamp: Date;
  isLoading?: boolean;
  memoryCount?: number;
  searchTime?: number;
  contextSummary?: string;
}

export interface SupermemoryChatOptions {
  enableInfiniteChat?: boolean;
  speaker?: string;
  scope?: 'episode' | 'podcast' | 'global';
  maxMemories?: number;
}

export interface UseSupermemoryChatResult {
  messages: SupermemoryChatMessage[];
  isProcessing: boolean;
  sessionId: string;
  isInfiniteChatEnabled: boolean;
  sendMessage: (question: string, options?: SupermemorySearchOptions) => Promise<void>;
  clearMessages: () => void;
  toggleInfiniteChat: () => void;
  setSpeaker: (speaker: string) => void;
  setScope: (scope: 'episode' | 'podcast' | 'global') => void;
  getSessionStats: () => { messageCount: number; totalMemories: number; averageSearchTime: number };
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Enhanced chat hook with Supermemory integration
 */
export function useSupermemoryChat(
  episodeId: string, 
  options: SupermemoryChatOptions = {}
): UseSupermemoryChatResult {
  const [messages, setMessages] = useState<SupermemoryChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const [isInfiniteChatEnabled, setIsInfiniteChatEnabled] = useState(options.enableInfiniteChat || false);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | undefined>(options.speaker);
  const [currentScope, setCurrentScope] = useState<'episode' | 'podcast' | 'global'>(options.scope || 'episode');

  // Enable Infinite Chat when session starts
  useEffect(() => {
    if (isInfiniteChatEnabled) {
      console.log('🔄 Enabling Infinite Chat for session:', sessionId);
      supermemoryClient.enableInfiniteChat(sessionId).catch(error => {
        console.warn('⚠️ Could not enable Infinite Chat:', error);
      });
    }
  }, [isInfiniteChatEnabled, sessionId]);

  const sendMessage = useCallback(async (
    question: string, 
    messageOptions?: SupermemorySearchOptions
  ) => {
    const questionId = Date.now().toString();
    const responseId = (Date.now() + 1).toString();

    try {
      setIsProcessing(true);

      // Add question to chat
      const questionMessage: SupermemoryChatMessage = {
        id: questionId,
        type: 'question',
        content: question,
        timestamp: new Date(),
      };

      // Add loading response
      const loadingMessage: SupermemoryChatMessage = {
        id: responseId,
        type: 'response',
        content: 'Thinking...',
        timestamp: new Date(),
        isLoading: true,
      };

      setMessages(prev => [...prev, questionMessage, loadingMessage]);

      // Prepare search options
      const searchOptions: SupermemorySearchOptions = {
        speaker: messageOptions?.speaker || currentSpeaker,
        scope: messageOptions?.scope || currentScope,
        enableInfiniteChat: isInfiniteChatEnabled,
        sessionId: isInfiniteChatEnabled ? sessionId : undefined,
        maxMemories: messageOptions?.maxMemories || options.maxMemories || 10,
      };

      // Send question with Supermemory
      const response = await sendQuestionWithSupermemory(episodeId, question, searchOptions);

      // Update with actual response
      const responseMessage: SupermemoryChatMessage = {
        id: responseId,
        type: 'response',
        content: response.answer,
        audioUrl: response.audioUrl,
        timestamp: new Date(),
        isLoading: false,
        memoryCount: response.memoryCount,
        searchTime: response.searchTime,
        contextSummary: response.contextSummary,
      };

      setMessages(prev => 
        prev.map(msg => 
          msg.id === responseId ? responseMessage : msg
        )
      );

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update with error message
      const errorMessage: SupermemoryChatMessage = {
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
  }, [episodeId, sessionId, isInfiniteChatEnabled, currentSpeaker, currentScope, options.maxMemories]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const toggleInfiniteChat = useCallback(() => {
    const newState = !isInfiniteChatEnabled;
    setIsInfiniteChatEnabled(newState);
    
    if (newState) {
      console.log('🔄 Enabling Infinite Chat...');
      supermemoryClient.enableInfiniteChat(sessionId).catch(error => {
        console.warn('⚠️ Could not enable Infinite Chat:', error);
      });
    } else {
      console.log('⏹️ Disabling Infinite Chat...');
    }
  }, [isInfiniteChatEnabled, sessionId]);

  const setSpeaker = useCallback((speaker: string) => {
    setCurrentSpeaker(speaker);
  }, []);

  const setScope = useCallback((scope: 'episode' | 'podcast' | 'global') => {
    setCurrentScope(scope);
  }, []);

  const getSessionStats = useCallback(() => {
    const responseMessages = messages.filter(msg => msg.type === 'response' && !msg.isLoading);
    const totalMemories = responseMessages.reduce((sum, msg) => sum + (msg.memoryCount || 0), 0);
    const totalSearchTime = responseMessages.reduce((sum, msg) => sum + (msg.searchTime || 0), 0);
    const averageSearchTime = responseMessages.length > 0 ? totalSearchTime / responseMessages.length : 0;

    return {
      messageCount: responseMessages.length,
      totalMemories,
      averageSearchTime: Math.round(averageSearchTime),
    };
  }, [messages]);

  return {
    messages,
    isProcessing,
    sessionId,
    isInfiniteChatEnabled,
    sendMessage,
    clearMessages,
    toggleInfiniteChat,
    setSpeaker,
    setScope,
    getSessionStats,
  };
}

/**
 * Hook for managing chat preferences
 */
export function useChatPreferences() {
  const [preferences, setPreferences] = useState({
    enableInfiniteChat: false,
    defaultSpeaker: '',
    defaultScope: 'episode' as const,
    maxMemories: 10,
  });

  const updatePreference = useCallback((key: keyof typeof preferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences({
      enableInfiniteChat: false,
      defaultSpeaker: '',
      defaultScope: 'episode',
      maxMemories: 10,
    });
  }, []);

  return {
    preferences,
    updatePreference,
    resetPreferences,
  };
} 