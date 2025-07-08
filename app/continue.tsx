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
import { LiquidGlassContainer } from '../components/LiquidGlassContainer';
import SimpleView from '../components/TestGlass';

const { width } = Dimensions.get('window');

// Mock data for user's podcast episodes
const MOCK_EPISODES = [
  {
    id: 'ep1',
    title: 'All-In E149: Dario Amodei CEO of Anthropic',
    channel: 'All-In Podcast',
    description: 'The besties dive deep into AI safety, scaling laws, and constitutional AI with Anthropic\'s CEO. Discussion covers the future of AI development, safety protocols, and the race to AGI.',
    duration: '1h 42m',
    watchedDuration: '45m',
    progress: 0.44, // 44% watched
    status: 'watching',
    thumbnail: '🎧',
    hosts: ['Chamath', 'Sacks', 'Friedberg', 'Jason'],
    conversationCount: 12,
    lastWatched: '2 hours ago',
    releaseDate: 'December 15, 2024',
  },
  {
    id: 'ep2',
    title: 'The Joe Rogan Experience #2086 - Marc Andreessen',
    channel: 'PowerfulJRE',
    description: 'Marc Andreessen discusses the future of technology, AI regulation, political censorship, and the intersection of Silicon Valley with government policy. A wide-ranging conversation about innovation and freedom.',
    duration: '2h 15m',
    watchedDuration: '2h 15m',
    progress: 1.0, // 100% completed
    status: 'completed',
    thumbnail: '🎙️',
    hosts: ['Joe Rogan'],
    conversationCount: 8,
    lastWatched: '1 day ago',
    releaseDate: 'December 10, 2024',
  },
  {
    id: 'ep4',
    title: 'Huberman Lab: How to Improve Your Sleep',
    channel: 'Andrew Huberman',
    description: 'Dr. Huberman breaks down the science of sleep optimization, covering sleep hygiene, circadian rhythms, supplements, and evidence-based protocols for better rest and recovery.',
    duration: '1h 55m',
    watchedDuration: '1h 23m',
    progress: 0.72, // 72% watched
    status: 'watching',
    thumbnail: '🧬',
    hosts: ['Dr. Andrew Huberman'],
    conversationCount: 5,
    lastWatched: '5 days ago',
    releaseDate: 'December 8, 2024',
  },
];

export default function ContinuePage() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'watching' | 'completed'>('all');
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<string>>(new Set());

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

  const toggleEpisodeExpansion = (episodeId: string) => {
    setExpandedEpisodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(episodeId)) {
        newSet.delete(episodeId);
      } else {
        newSet.add(episodeId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'watching':
        return '#FFA500'; // Orange
      case 'completed':
        return '#10B981'; // Green
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
      default:
        return status;
    }
  };

  const getFilteredEpisodes = () => {
    // Filter out "new" episodes since this page is only for started/completed podcasts
    const startedEpisodes = MOCK_EPISODES.filter(ep => ep.status !== 'new');
    if (selectedFilter === 'all') return startedEpisodes;
    return startedEpisodes.filter(ep => ep.status === selectedFilter);
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
          <TouchableOpacity onPress={() => router.replace('/') }>
            <Text style={styles.elaraLogoGlow}>elara</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <LiquidGlassContainer
          intensity="medium"
          borderRadius={20}
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
                activeOpacity={0.7}
              >
                {selectedFilter === filter && (
                  <LiquidGlassContainer
                    intensity="high"
                    borderRadius={16}
                    style={styles.activeFilterTabGlass}
                  >
                    <View />
                  </LiquidGlassContainer>
                )}
                <Text style={[
                  styles.filterTabText,
                  selectedFilter === filter && styles.activeFilterTabText,
                ]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LiquidGlassContainer>

        {/* Episodes List */}
        <View style={styles.episodesList}>
          {getFilteredEpisodes().map((episode) => (
            <LiquidGlassContainer
              key={episode.id}
              intensity="high"
              borderRadius={24}
              style={styles.episodeCard}
            >
              <View style={styles.episodeContent}>
                {/* Collapsed Header - Always Visible */}
                <TouchableOpacity 
                  style={styles.episodeHeader}
                  onPress={() => toggleEpisodeExpansion(episode.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.progressIndicatorContainer}>
                    {/* Background circle */}
                    <View style={styles.progressIndicatorBackground} />
                    
                    {/* Progress circle overlay */}
                    {episode.progress > 0 && (
                      <View 
                        style={[
                          styles.progressIndicatorProgress,
                          {
                            borderColor: episode.progress === 1.0 ? '#10B981' : '#3B82F6',
                            transform: [{ rotate: '0deg' }],
                          }
                        ]}
                      >
                        <View 
                          style={[
                            styles.progressMask,
                            {
                              transform: [{ rotate: `${episode.progress * 360}deg` }],
                            }
                          ]}
                        />
                      </View>
                    )}
                    
                    {/* Content */}
                    <View style={styles.progressContent}>
                      {episode.progress === 1.0 ? (
                        <Text style={styles.checkmarkIcon}>✓</Text>
                      ) : (
                        <Text style={styles.percentageText}>{formatProgress(episode.progress)}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.episodeInfo}>
                    <Text style={styles.episodeTitle} numberOfLines={2}>
                      {episode.title}
                    </Text>
                    <Text style={styles.episodeChannel}>{episode.channel}</Text>
                  </View>
                </TouchableOpacity>

                {/* Expanded Content - Only when expanded */}
                {expandedEpisodes.has(episode.id) && (
                  <View style={styles.expandedContent}>
                    <Text style={styles.episodeDescription}>{episode.description}</Text>
                    <Text style={styles.releaseDate}>{episode.releaseDate}</Text>

                    {/* Progress Bar */}
                    {episode.progress > 0 && (
                      <View style={styles.progressSection}>
                        <View style={styles.progressTimeInfo}>
                          <Text style={styles.progressText}>{episode.watchedDuration}</Text>
                          <Text style={styles.progressText}>{episode.duration}</Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                          <View style={styles.progressBarBackground}>
                            <View 
                              style={[
                                styles.progressBarFill, 
                                { width: `${episode.progress * 100}%` }
                              ]} 
                            />
                            <View 
                              style={[
                                styles.progressDot, 
                                { left: `${episode.progress * 100}%` }
                              ]}
                            >
                              <Text style={styles.progressPercentage}>{formatProgress(episode.progress)}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Episode Actions */}
                    <View style={styles.episodeActions}>
                      {episode.conversationCount > 0 && (
                        <LiquidGlassContainer
                          intensity="medium"
                          borderRadius={16}
                          style={styles.fullWidthButtonContainer}
                        >
                          <GlassButton
                            title="View Chat"
                            onPress={() => handleViewConversation(episode)}
                            variant="secondary"
                            size="md"
                            style={styles.fullWidthButton}
                          />
                        </LiquidGlassContainer>
                      )}
                      
                      <LiquidGlassContainer
                        intensity="high"
                        borderRadius={16}
                        style={styles.fullWidthButtonContainer}
                      >
                        <GlassButton
                          title={episode.status === 'completed' ? 'Listen Again' : 'Continue'}
                          onPress={() => handleEpisodePress(episode.id)}
                          variant="primary"
                          size="md"
                          style={styles.fullWidthButton}
                        />
                      </LiquidGlassContainer>
                    </View>
                  </View>
                )}
              </View>
            </LiquidGlassContainer>
          ))}
        </View>

        {getFilteredEpisodes().length === 0 && (
          <LiquidGlassContainer
            intensity="medium"
            borderRadius={24}
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
              <LiquidGlassContainer
                intensity="high"
                borderRadius={16}
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
              </LiquidGlassContainer>
            </View>
          </LiquidGlassContainer>
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
  elaraLogoGlow: {
    fontSize: 48,
    fontFamily: 'Snell Roundhand',
    color: '#aeefff',
    textAlign: 'center',
    fontWeight: '400',
    textShadowColor: '#aeefff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
    shadowColor: '#aeefff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
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
    position: 'relative',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterTab: {
    // Additional styling handled by SimpleView selected prop
  },
  activeFilterTabGlass: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    zIndex: 1,
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
  dropdownArrow: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  dropdownArrowText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  expandedContent: {
    gap: 16,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressIndicator: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  progressIndicatorContainer: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  progressIndicatorBackground: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'absolute',
  },
  progressIndicatorProgress: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#3B82F6',
    overflow: 'hidden',
  },
  progressMask: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    top: 0,
    left: 0,
  },
  progressContent: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  checkmarkIcon: {
    fontSize: 24,
    color: '#10B981',
    fontWeight: 'bold',
  },
  percentageText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '700',
    textAlign: 'center',
  },
  pieChartContainer: {
    width: 56,
    height: 56,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartBackground: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pieChartMask: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  pieChartProgress: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#3B82F6',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transformOrigin: 'center',
  },
  pieChartCenter: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  episodeInfo: {
    flex: 1,
    marginLeft: 12,
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
  progressTimeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  episodeDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
    marginBottom: 0,
  },
  releaseDate: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'left',
    marginBottom: 5,
    marginTop: -2,
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
  progressDot: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    backgroundColor: 'white',
    borderRadius: 6,
    marginLeft: -6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  progressPercentage: {
    position: 'absolute',
    top: -24,
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    textAlign: 'center',
    minWidth: 32,
  },
  episodeActions: {
    flexDirection: 'column',
    gap: 12,
  },
  fullWidthButtonContainer: {
    width: '100%',
  },
  fullWidthButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
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