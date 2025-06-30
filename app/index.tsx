import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { processPodcastLink } from '../lib/api';

export default function HomePage() {
  const [podcastLink, setPodcastLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!podcastLink.trim()) {
      Alert.alert('Error', 'Please enter a podcast link');
      return;
    }

    try {
      setIsLoading(true);
      // Process the podcast link and get episode ID
      const episodeId = await processPodcastLink(podcastLink);
      
      // Navigate to the episode page
      router.push(`/${episodeId}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to process podcast link. Please try again.');
      console.error('Error processing podcast:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎧 ElaraV2</Text>
        <Text style={styles.subtitle}>
          AI-powered podcast assistant with host voice synthesis
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Podcast Link</Text>
          <TextInput
            style={styles.input}
            placeholder="Paste your podcast episode link here..."
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
}); 