import { useState } from 'react';
import { sendQuestion, type QuestionResponse } from '../lib/api';

export interface ChatMessage {
  id: string;
  type: 'question' | 'response';
  content: string;
  audioUrl?: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface UseChatResult {
  messages: ChatMessage[];
  isProcessing: boolean;
  sendMessage: (question: string) => Promise<void>;
  clearMessages: () => void;
}

/**
 * Custom hook for managing chat state and interactions
 */
export function useChat(episodeId: string): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

      // Update with actual response
      const responseMessage: ChatMessage = {
        id: responseId,
        type: 'response',
        content: response.answer,
        audioUrl: response.audioUrl,
        timestamp: new Date(),
        isLoading: false,
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
  };

  return {
    messages,
    isProcessing,
    sendMessage,
    clearMessages,
  };
} 