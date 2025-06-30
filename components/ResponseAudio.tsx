import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAudioPlayer } from '../hooks';

interface ResponseAudioProps {
  audioUrl: string;
  hostName?: string;
}

export default function ResponseAudio({ audioUrl, hostName }: ResponseAudioProps) {
  const {
    isPlaying,
    isLoading,
    loadAudio,
    togglePlayback,
  } = useAudioPlayer();

  useEffect(() => {
    // Auto-play the response when it arrives
    if (audioUrl) {
      loadAudio(audioUrl)
        .then(() => {
          // Auto-play after loading
          togglePlayback();
        })
        .catch(error => {
          console.error('Error loading response audio:', error);
        });
    }
  }, [audioUrl]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          🎙️ {hostName ? `${hostName} responds` : 'Host Response'}
        </Text>
        <Text style={styles.subtitle}>Powered by ElevenLabs voice synthesis</Text>
      </View>
      
      <View style={styles.playerContainer}>
        <TouchableOpacity
          style={[styles.playButton, isLoading && styles.playButtonDisabled]}
          onPress={togglePlayback}
          disabled={isLoading}
        >
          <Text style={styles.playButtonText}>
            {isLoading ? '⏳' : isPlaying ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {isLoading ? 'Loading...' : isPlaying ? 'Playing response...' : 'Tap to replay'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065f46',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#047857',
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  playButtonText: {
    fontSize: 16,
    color: 'white',
  },
  statusContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    color: '#047857',
    fontWeight: '500',
  },
}); 