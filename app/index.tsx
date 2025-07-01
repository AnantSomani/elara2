import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { processPodcastLink, type ProcessResult } from '../lib/api';
import { type YouTubeVideoData } from '../lib/youtube';

export default function HomePage() {
  const [podcastLink, setPodcastLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<YouTubeVideoData | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleSubmit = async () => {
    if (!podcastLink.trim()) {
      Alert.alert('Error', 'Please enter a YouTube URL');
      return;
    }

    try {
      setIsLoading(true);
      // Process the YouTube URL and get video metadata + episode ID
      const result: ProcessResult = await processPodcastLink(podcastLink);
      
      // Show video preview and ask for confirmation
      setVideoData(result.videoData);
      setIsConfirming(true);
      
      // Auto-navigate after showing preview (or user can manually confirm)
      setTimeout(() => {
        router.push(`/${result.episodeId}`);
      }, 2000);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to process YouTube URL. Please try again.');
      console.error('Error processing podcast:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAndNavigate = () => {
    if (videoData) {
      // Extract episode ID from the most recent processing
      // For now, we'll handle this in a simpler way
      setIsConfirming(false);
      setVideoData(null);
      setPodcastLink('');
    }
  };

  const handleCancel = () => {
    setIsConfirming(false);
    setVideoData(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎧 ElaraV2</Text>
        <Text style={styles.subtitle}>
          AI-powered podcast assistant with host voice synthesis
        </Text>
        
        {!isConfirming && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>YouTube URL</Text>
              <TextInput
                style={styles.input}
                placeholder="Paste your YouTube video URL here..."
                value={podcastLink}
                onChangeText={setPodcastLink}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Processing...' : 'Start Conversation'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {isConfirming && videoData && (
          <View style={styles.videoPreview}>
            <Text style={styles.previewTitle}>Video Found!</Text>
            
            {videoData.thumbnailUrl && (
              <Image 
                source={{ uri: videoData.thumbnailUrl }} 
                style={styles.thumbnail}
                resizeMode="cover"
              />
            )}
            
            <Text style={styles.videoTitle}>{videoData.title}</Text>
            <Text style={styles.videoInfo}>
              {videoData.channelTitle} • {Math.floor(videoData.durationSeconds / 60)}:{(videoData.durationSeconds % 60).toString().padStart(2, '0')}
            </Text>
            
            <Text style={styles.statusText}>
              ✅ Processing started! Redirecting to conversation...
            </Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Features:</Text>
          <Text style={styles.feature}>• Ask questions about any podcast episode</Text>
          <Text style={styles.feature}>• Get responses in the host's actual voice</Text>
          <Text style={styles.feature}>• Voice or text input supported</Text>
          <Text style={styles.feature}>• Powered by advanced AI transcription</Text>
        </View>
      </View>
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
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 40,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    minHeight: 80,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresContainer: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  feature: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    lineHeight: 20,
  },
  videoPreview: {
    backgroundColor: '#f0f9ff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  thumbnail: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 22,
  },
  videoInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 