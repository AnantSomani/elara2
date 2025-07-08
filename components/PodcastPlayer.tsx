import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAudioPlayer } from '../hooks';
import PlayableWaveform from './PlayableWaveform';

interface PodcastPlayerProps {
  title: string;
  audioUrl: string;
  hosts: string[];
}

export default function PodcastPlayer({ title, audioUrl, hosts }: PodcastPlayerProps) {
  const {
    isPlaying,
    isLoading,
    position,
    duration,
    loadAudio,
    togglePlayback,
  } = useAudioPlayer();

  useEffect(() => {
    if (audioUrl) {
      loadAudio(audioUrl).catch(error => {
        console.error('Error loading podcast audio:', error);
      });
    }
  }, [audioUrl]);

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (duration === 0) return 0;
    return position / duration;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hosts}>Hosts: {hosts.join(', ')}</Text>
      
      <View style={styles.playerContainer}>
        <PlayableWaveform
          isPlaying={isPlaying}
          isLoading={isLoading}
          onTogglePlayback={togglePlayback}
          size={48}
          barCount={15}
        />
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${getProgress() * 100}%` }]}
            />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  hosts: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
  },
}); 