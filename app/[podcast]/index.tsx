import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LiquidGlassButton } from '../../components/LiquidGlassButton';
import { getPodcastById, getPodcastEpisodes, type PodcastSearchResult } from '../../lib/podcastSearch';
import { type PodcastEpisode } from '../../lib/podcastIndex';

export default function PodcastDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [podcast, setPodcast] = useState<PodcastSearchResult | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPodcastData();
    }
  }, [id]);

  const loadPodcastData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load podcast metadata
      const podcastData = await getPodcastById(id!);
      if (!podcastData) {
        throw new Error('Podcast not found');
      }
      setPodcast(podcastData);

      // Load episodes
      setIsLoadingEpisodes(true);
      const episodeData = await getPodcastEpisodes(id!, 50);
      setEpisodes(episodeData);

    } catch (err) {
      console.error('Error loading podcast data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load podcast');
    } finally {
      setIsLoading(false);
      setIsLoadingEpisodes(false);
    }
  };

  const handleEpisodeSelect = (episode: PodcastEpisode) => {
    // Navigate to episode player with episode data
    router.push({
      pathname: '/[episode]',
      params: {
        episodeId: episode.id.toString(),
        podcastId: id,
        podcastTitle: podcast?.title || '',
        episodeTitle: episode.title,
        audioUrl: episode.enclosureUrl,
        episodeData: JSON.stringify(episode),
      },
    });
  };

  const handleBackPress = () => {
    router.back();
  };

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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#aeefff" />
          <Text style={styles.loadingText}>Loading podcast...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !podcast) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Podcast not found'}</Text>
          <LiquidGlassButton 
            borderRadius={28} 
            intensity="high" 
            style={styles.backButton}
          >
            <TouchableOpacity onPress={handleBackPress} style={styles.buttonInner}>
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </LiquidGlassButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backIconButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Podcast</Text>
          <View style={styles.backIconButton} />
        </View>

        {/* Podcast Info */}
        <LiquidGlassButton 
          borderRadius={28} 
          intensity="high" 
          style={styles.podcastCard}
        >
          <View style={styles.podcastInfo}>
            {podcast.imageUrl ? (
              <Image 
                source={{ uri: podcast.imageUrl }} 
                style={styles.podcastImage}
                defaultSource={require('../../assets/icon.png')}
              />
            ) : (
              <View style={styles.podcastImagePlaceholder}>
                <Text style={styles.podcastImageText}>🎙️</Text>
              </View>
            )}
            
            <View style={styles.podcastMeta}>
              <Text style={styles.podcastTitle}>{podcast.title}</Text>
              <Text style={styles.podcastAuthor}>by {podcast.author}</Text>
              {podcast.description && (
                <Text style={styles.podcastDescription} numberOfLines={3}>
                  {podcast.description}
                </Text>
              )}
            </View>
          </View>
        </LiquidGlassButton>

        {/* Episodes Section */}
        <View style={styles.episodesSection}>
          <Text style={styles.sectionTitle}>
            Recent Episodes {episodes.length > 0 ? `(${episodes.length})` : ''}
          </Text>
          
          {isLoadingEpisodes ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#aeefff" />
              <Text style={styles.loadingText}>Loading episodes...</Text>
            </View>
          ) : episodes.length === 0 ? (
            <LiquidGlassButton 
              borderRadius={28} 
              intensity="medium" 
              style={styles.emptyCard}
            >
              <Text style={styles.emptyText}>No episodes available</Text>
            </LiquidGlassButton>
          ) : (
            episodes.map((episode, index) => (
                             <LiquidGlassButton 
                 key={episode.id} 
                 borderRadius={24} 
                 intensity="medium" 
                 style={
                   index === episodes.length - 1 
                     ? [styles.episodeCard, styles.lastEpisodeCard]
                     : styles.episodeCard
                 }
               >
                <TouchableOpacity 
                  onPress={() => handleEpisodeSelect(episode)}
                  style={styles.episodeButton}
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
                        {episode.description.replace(/<[^>]*>/g, '').trim()}
                      </Text>
                    )}
                    
                    <View style={styles.episodeFooter}>
                      {episode.duration > 0 && (
                        <Text style={styles.episodeDuration}>
                          {formatDuration(episode.duration)}
                        </Text>
                      )}
                      <Text style={styles.playHint}>Tap to play →</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </LiquidGlassButton>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  backIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#aeefff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 40,
  },
  errorText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
  backButton: {
    minHeight: 50,
    paddingHorizontal: 32,
  },
  buttonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  buttonText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 16,
    fontWeight: '600',
  },
  podcastCard: {
    marginBottom: 32,
    padding: 20,
  },
  podcastInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  podcastImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  podcastImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podcastImageText: {
    fontSize: 40,
  },
  podcastMeta: {
    flex: 1,
    gap: 8,
  },
  podcastTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 24,
  },
  podcastAuthor: {
    fontSize: 16,
    color: 'rgba(174, 239, 255, 0.8)',
    fontWeight: '500',
  },
  podcastDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  episodesSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 8,
  },
  episodeCard: {
    marginBottom: 12,
  },
  lastEpisodeCard: {
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
  episodeDuration: {
    fontSize: 12,
    color: 'rgba(174, 239, 255, 0.6)',
    fontWeight: '500',
  },
  playHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
}); 