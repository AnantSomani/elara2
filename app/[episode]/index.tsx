import React from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import PodcastPlayer from '../../components/PodcastPlayer';
import ChatInput from '../../components/ChatInput';
import ResponseAudio from '../../components/ResponseAudio';
import { useEpisode, useChat } from '../../hooks';

export default function EpisodePage() {
  const { episode: episodeParam } = useLocalSearchParams<{ episode: string }>();
  
  const {
    episode,
    isLoading: episodeLoading,
    error: episodeError,
  } = useEpisode(episodeParam);

  const {
    messages,
    isProcessing,
    sendMessage,
  } = useChat(episodeParam || '');

  const handleSendMessage = async (question: string) => {
    await sendMessage(question);
  };

  if (episodeLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading episode...</Text>
      </View>
    );
  }

  if (episodeError || !episode) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {episodeError || 'Episode not found'}
        </Text>
      </View>
    );
  }

  // Get the latest response message with audio
  const latestResponse = messages
    .filter(msg => msg.type === 'response' && msg.audioUrl)
    .pop();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <PodcastPlayer
          title={episode.title}
          audioUrl={episode.audioUrl}
          hosts={episode.hosts}
        />
        
        {/* Show processing status */}
        {episode.processingStatus !== 'completed' && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              📊 Episode Status: {episode.processingStatus}
            </Text>
            {episode.processingStatus === 'processing' && (
              <Text style={styles.statusSubtext}>
                Transcription and analysis in progress...
              </Text>
            )}
          </View>
        )}

        {/* Chat Messages */}
        {messages.length > 0 && (
          <View style={styles.chatContainer}>
            <Text style={styles.chatTitle}>💬 Conversation</Text>
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.type === 'question' ? styles.questionMessage : styles.responseMessage,
                ]}
              >
                <Text style={styles.messageContent}>{message.content}</Text>
                {message.type === 'response' && message.audioUrl && (
                  <ResponseAudio 
                    audioUrl={message.audioUrl} 
                    hostName={episode.hosts[0]}
                  />
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      
      <ChatInput
        episodeId={episodeParam!}
        onSendMessage={handleSendMessage}
        isProcessing={isProcessing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100, // Space for chat input
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 12,
    color: '#a16207',
  },
  chatContainer: {
    marginTop: 16,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  messageContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },
  questionMessage: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  responseMessage: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  messageContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
}); 