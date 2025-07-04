import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { GlassButton } from '../components/GlassButton';
import SimpleView from '../components/TestGlass';

const { width } = Dimensions.get('window');

// Mock data for user's podcast episodes
const MOCK_EPISODES = [
  {
    id: 'ep1',
    title: 'All-In E149: Dario Amodei CEO of Anthropic',
    channel: 'All-In Podcast',
    duration: '1h 42m',
    watchedDuration: '45m',
    progress: 0.44, // 44% watched
    status: 'watching',
    thumbnail: '🎧',
    hosts: ['Chamath', 'Sacks', 'Friedberg', 'Jason'],
    conversationCount: 12,
    lastWatched: '2 hours ago',
  },
  {
    id: 'ep2',
    title: 'The Joe Rogan Experience #2086 - Marc Andreessen',
    channel: 'PowerfulJRE',
    duration: '2h 15m',
    watchedDuration: '2h 15m',
    progress: 1.0, // 100% completed
    status: 'completed',
    thumbnail: '🎙️',
    hosts: ['Joe Rogan'],
    conversationCount: 8,
    lastWatched: '1 day ago',
  },
  {
    id: 'ep3',
    title: 'Lex Fridman Podcast #402 - Sam Altman',
    channel: 'Lex Fridman Podcast',
    duration: '1h 28m',
    watchedDuration: '0m',
    progress: 0.0, // Not started
    status: 'new',
    thumbnail: '🧠',
    hosts: ['Lex Fridman'],
    conversationCount: 0,
    lastWatched: 'Added 3 days ago',
  },
  {
    id: 'ep4',
    title: 'Huberman Lab: How to Improve Your Sleep',
    channel: 'Andrew Huberman',
    duration: '1h 55m',
    watchedDuration: '1h 23m',
    progress: 0.72, // 72% watched
    status: 'watching',
    thumbnail: '🧬',
    hosts: ['Dr. Andrew Huberman'],
    conversationCount: 5,
    lastWatched: '5 days ago',
  },
];

export default function ContinuePage() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'watching' | 'completed'>('all');

  const handleHomePress = () => {
    router.replace('/');
  };

  const handleEpisodePress = (episodeId: string) => {
    router.push(`/${episodeId}`);
  };

  const handleViewConversation = (episode: any) => {
    // Navigate to episode with conversation focus
    router.push(`/${episode.id}?view=conversation`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'watching':
        return '#FFA500'; // Orange
      case 'completed':
        return '#10B981'; // Green
      case 'new':
        return '#3B82F6'; // Blue
      default:
        return 'rgba(255, 255, 255, 0.7)';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'watching':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'new':
        return 'Not Started';
      default:
        return status;
    }
  };

  const getFilteredEpisodes = () => {
    if (selectedFilter === 'all') return MOCK_EPISODES;
    return MOCK_EPISODES.filter(ep => ep.status === selectedFilter);
  };

  const formatProgress = (progress: number) => {
    return `${Math.round(progress * 100)}%`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleHomePress} style={styles.elaraHeader}>
            <Text style={styles.elaraTitle}>Elara</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Continue Podcasts</Text>
          <Text style={styles.subtitle}>Pick up where you left off or explore your conversations</Text>
        </View>

        {/* Filter Tabs */}
        <SimpleView
          intensity="medium"
          borderRadius={16}
          style={styles.filterContainer}
        >
          <View style={styles.filterTabs}>
            {['all', 'watching', 'completed'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterTab,
                  selectedFilter === filter && styles.activeFilterTab,
                ]}
                onPress={() => setSelectedFilter(filter as any)}
              >
                <SimpleView
                  intensity={selectedFilter === filter ? "high" : "low"}
                  borderRadius={12}
                  selected={selectedFilter === filter}
                  style={styles.filterTabGlass}
                >
                  <Text style={[
                    styles.filterTabText,
                    selectedFilter === filter && styles.activeFilterTabText,
                  ]}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </SimpleView>
              </TouchableOpacity>
            ))}
          </View>
        </SimpleView>

        {/* Episodes List */}
        <View style={styles.episodesList}>
          {getFilteredEpisodes().map((episode) => (
            <SimpleView
              key={episode.id}
              intensity="high"
              borderRadius={20}
              style={styles.episodeCard}
            >
              <View style={styles.episodeContent}>
                {/* Episode Header */}
                <View style={styles.episodeHeader}>
                  <Text style={styles.episodeThumbnail}>{episode.thumbnail}</Text>
                  <View style={styles.episodeInfo}>
                    <Text style={styles.episodeTitle} numberOfLines={2}>
                      {episode.title}
                    </Text>
                    <Text style={styles.episodeChannel}>{episode.channel}</Text>
                    <Text style={styles.episodeHosts}>
                      with {episode.hosts.join(', ')}
                    </Text>
                  </View>
                  <View style={styles.episodeStatus}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(episode.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(episode.status)}</Text>
                    </View>
                  </View>
                </View>

                {/* Progress Bar */}
                {episode.progress > 0 && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressInfo}>
                      <Text style={styles.progressText}>
                        {episode.watchedDuration} of {episode.duration} • {formatProgress(episode.progress)}
                      </Text>
                      <Text style={styles.lastWatchedText}>{episode.lastWatched}</Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBackground}>
                        <View 
                          style={[
                            styles.progressBarFill, 
                            { width: `${episode.progress * 100}%` }
                          ]} 
                        />
                      </View>
                    </View>
                  </View>
                )}

                {/* Episode Actions */}
                <View style={styles.episodeActions}>
                  <View style={styles.conversationInfo}>
                    <Text style={styles.conversationCount}>
                      💬 {episode.conversationCount} conversation{episode.conversationCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  
                  <View style={styles.actionButtons}>
                    {episode.conversationCount > 0 && (
                      <SimpleView
                        intensity="medium"
                        borderRadius={12}
                        style={styles.secondaryButtonContainer}
                      >
                        <GlassButton
                          title="View Chat"
                          onPress={() => handleViewConversation(episode)}
                          variant="secondary"
                          size="sm"
                          style={styles.secondaryButton}
                        />
                      </SimpleView>
                    )}
                    
                    <SimpleView
                      intensity="ultra"
                      borderRadius={12}
                      glowEffect={true}
                      style={styles.primaryButtonContainer}
                    >
                      <GlassButton
                        title={episode.status === 'completed' ? 'Listen Again' : 'Continue'}
                        onPress={() => handleEpisodePress(episode.id)}
                        variant="primary"
                        size="sm"
                        style={styles.primaryButton}
                        icon={
                          <View style={styles.buttonIcon}>
                            <Text style={styles.iconText}>
                              {episode.status === 'completed' ? '🔄' : '▶'}
                            </Text>
                          </View>
                        }
                      />
                    </SimpleView>
                  </View>
                </View>
              </View>
            </SimpleView>
          ))}
        </View>

        {getFilteredEpisodes().length === 0 && (
          <SimpleView
            intensity="medium"
            borderRadius={20}
            style={styles.emptyStateContainer}
          >
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🎧</Text>
              <Text style={styles.emptyStateTitle}>No episodes found</Text>
              <Text style={styles.emptyStateText}>
                {selectedFilter === 'all' 
                  ? 'Start by adding a podcast from YouTube'
                  : `No ${selectedFilter} episodes yet`
                }
              </Text>
              <SimpleView
                intensity="high"
                borderRadius={12}
                style={styles.emptyStateButtonContainer}
              >
                <GlassButton
                  title="Add Podcast"
                  onPress={() => router.push('/youtube')}
                  variant="primary"
                  size="md"
                  style={styles.emptyStateButton}
                  icon={
                    <View style={styles.buttonIcon}>
                      <Text style={styles.iconText}>📺</Text>
                    </View>
                  }
                />
              </SimpleView>
            </View>
          </SimpleView>
        )}
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  elaraHeader: {
    alignSelf: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  elaraTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'Brush Script MT',
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 24,
  },
  filterContainer: {
    marginBottom: 24,
    padding: 6,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 4,
  },
  filterTab: {
    flex: 1,
  },
  filterTabGlass: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activeFilterTab: {
    // Additional styling handled by SimpleView selected prop
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  activeFilterTabText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
  },
  episodesList: {
    gap: 20,
  },
  episodeCard: {
    padding: 20,
  },
  episodeContent: {
    gap: 16,
  },
  episodeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  episodeThumbnail: {
    fontSize: 40,
    textAlign: 'center',
    width: 50,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 22,
    marginBottom: 4,
  },
  episodeChannel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  episodeHosts: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  episodeStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  progressSection: {
    gap: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  lastWatchedText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  progressBarContainer: {
    // Progress bar styling
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  episodeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationCount: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButtonContainer: {
    // SimpleView will handle styling
  },
  primaryButtonContainer: {
    // SimpleView will handle styling
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: 16,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  emptyStateButtonContainer: {
    // SimpleView will handle styling
  },
  emptyStateButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
}); 