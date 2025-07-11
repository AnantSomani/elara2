import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LiquidGlassButton } from './LiquidGlassButton';
import { type PodcastEpisode } from '../lib/podcastIndex';

export interface EpisodeListProps {
  episodes: PodcastEpisode[];
  onEpisodeSelect: (episode: PodcastEpisode) => void;
  isLoading?: boolean;
  showEmptyState?: boolean;
  emptyStateText?: string;
  maxEpisodes?: number;
}

export function EpisodeList({
  episodes,
  onEpisodeSelect,
  isLoading = false,
  showEmptyState = true,
  emptyStateText = 'No episodes available',
  maxEpisodes,
}: EpisodeListProps) {
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const cleanDescription = (description: string): string => {
    return description.replace(/<[^>]*>/g, '').trim();
  };

  const displayEpisodes = maxEpisodes ? episodes.slice(0, maxEpisodes) : episodes;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#aeefff" />
        <Text style={styles.loadingText}>Loading episodes...</Text>
      </View>
    );
  }

  if (episodes.length === 0 && showEmptyState) {
    return (
      <LiquidGlassButton 
        borderRadius={28} 
        intensity="medium" 
        style={styles.emptyCard}
      >
        <Text style={styles.emptyText}>{emptyStateText}</Text>
      </LiquidGlassButton>
    );
  }

  return (
    <View style={styles.container}>
      {displayEpisodes.map((episode, index) => (
        <LiquidGlassButton 
          key={`episode-${episode.id}`} 
          borderRadius={24} 
          intensity="medium" 
          style={styles.episodeCard}
        >
          <TouchableOpacity 
            onPress={() => onEpisodeSelect(episode)}
            style={styles.episodeButton}
            activeOpacity={0.7}
          >
            <View style={styles.episodeContent}>
              <View style={styles.episodeHeader}>
                <Text style={styles.episodeTitle} numberOfLines={2}>
                  {episode.title}
                </Text>
                <Text style={styles.episodeDate}>
                  {formatDate(episode.datePublished)}
                </Text>
              </View>
              
              {episode.description && (
                <Text style={styles.episodeDescription} numberOfLines={2}>
                  {cleanDescription(episode.description)}
                </Text>
              )}
              
              <View style={styles.episodeFooter}>
                <View style={styles.episodeMetadata}>
                  {episode.duration > 0 && (
                    <Text style={styles.episodeDuration}>
                      {formatDuration(episode.duration)}
                    </Text>
                  )}
                  {episode.episode && (
                    <Text style={styles.episodeNumber}>
                      Episode {episode.episode}
                    </Text>
                  )}
                </View>
                <Text style={styles.playHint}>Tap to play →</Text>
              </View>
            </View>
          </TouchableOpacity>
        </LiquidGlassButton>
      ))}
      
      {maxEpisodes && episodes.length > maxEpisodes && (
        <LiquidGlassButton 
          borderRadius={20} 
          intensity="low" 
          style={styles.showMoreCard}
        >
          <Text style={styles.showMoreText}>
            {episodes.length - maxEpisodes} more episodes available
          </Text>
        </LiquidGlassButton>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 32,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    textAlign: 'center',
  },
  episodeCard: {
    marginBottom: 0,
  },
  episodeButton: {
    padding: 16,
  },
  episodeContent: {
    gap: 12,
  },
  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  episodeTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 22,
  },
  episodeDate: {
    fontSize: 14,
    color: 'rgba(174, 239, 255, 0.7)',
    minWidth: 80,
    textAlign: 'right',
    fontWeight: '500',
  },
  episodeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  episodeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  episodeMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  episodeDuration: {
    fontSize: 12,
    color: 'rgba(174, 239, 255, 0.6)',
    fontWeight: '500',
  },
  episodeNumber: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  playHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  showMoreCard: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  showMoreText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontStyle: 'italic',
  },
}); 