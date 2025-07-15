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

  const handleEpisodeSelect = async (episode: PodcastEpisode) => {
    try {
      // Fetch all episodes for this podcast
      const allEpisodes = await getPodcastEpisodes(episode.feedId.toString(), 100);
      // Find the episode by GUID or ID
      const latestEpisode = allEpisodes.find(e => e.id === episode.id || e.guid === episode.guid);

      if (!latestEpisode) {
        Alert.alert('Error', 'Episode not found in Podcast Index');
        return;
      }

      // Navigate to episode player with the latest episode data
      router.push({
        pathname: `/episode/${latestEpisode.id}`,
        params: {
          episodeData: JSON.stringify(latestEpisode),
        },
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch episode data');
      console.error(err);
    }
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
            episodes.slice(0, 3).map((episode, index) => (
              <TouchableOpacity key={episode.id} onPress={() => handleEpisodeSelect(episode)} activeOpacity={0.8}>
                <LiquidGlassButton
                  borderRadius={24}
                  intensity="medium"
                  style={styles.episodeCard}
                >
                  <View style={styles.episodeRow}>
                    <View style={styles.episodeInfo}>
                      <Text style={styles.episodeTitle} numberOfLines={2}>{episode.title}</Text>
                      <Text style={styles.episodeDate}>{formatDate(episode.datePublished)}</Text>
                      {episode.description && (
                        <Text style={styles.episodeDescription} numberOfLines={2}>
                          {episode.description.replace(/<[^>]*>/g, '').trim()}
                        </Text>
                      )}
                    </View>
                    <View style={styles.episodeAction}>
                      <Text style={styles.episodePlayIcon}>▶</Text>
                    </View>
                  </View>
                </LiquidGlassButton>
              </TouchableOpacity>
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
    marginBottom: 48, // Increased margin to push episodes further down
    padding: 28, // Increased padding for more space around podcast info
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
    marginBottom: 32,
    paddingVertical: 20,
    paddingHorizontal: 0,
    minHeight: 110,
    justifyContent: 'center',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  episodeDate: {
    fontSize: 14,
    color: '#aeefff',
    marginBottom: 6,
  },
  episodeDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
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
  episodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  episodeInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 12,
  },
  episodePlayIcon: {
    fontSize: 32,
    color: '#aeefff',
  },
  episodeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
}); 