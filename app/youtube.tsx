import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { GlassButton } from '../components/GlassButton';
import { EnhancedLiquidGlass } from '../components/EnhancedLiquidGlass';
import { processPodcastLink, type ProcessResult } from '../lib/api';

// Mock podcast data for search
const POPULAR_PODCASTS = [
  { name: 'The Joe Rogan Experience', channel: 'PowerfulJRE', description: 'Long form conversations' },
  { name: 'Lex Fridman Podcast', channel: 'lexfridman', description: 'AI, science, and philosophy' },
  { name: 'The Tim Ferriss Show', channel: 'Tim Ferriss', description: 'Life hacks and optimization' },
  { name: 'Huberman Lab', channel: 'Andrew Huberman', description: 'Science and health' },
  { name: 'The Diary of a CEO', channel: 'The Diary Of A CEO', description: 'Business and entrepreneurship' },
  { name: 'All-In Podcast', channel: 'All-In Podcast', description: 'Tech and business insights' },
];

export default function YouTubePage() {
  const [podcastLink, setPodcastLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPodcasts, setFilteredPodcasts] = useState(POPULAR_PODCASTS);

  const handleSubmit = async () => {
    if (!podcastLink.trim()) {
      Alert.alert('Error', 'Please enter a YouTube URL');
      return;
    }

    try {
      setIsLoading(true);
      // Process the YouTube URL and get video metadata + episode ID
      const result: ProcessResult = await processPodcastLink(podcastLink);
      
      // Navigate to the episode conversation
      router.push(`/${result.episodeId}`);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to process YouTube URL. Please try again.');
      console.error('Error processing podcast:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoMode = () => {
    // Navigate directly to mock episode for UI testing
    router.push('/episode-1');
  };

  const handleHomePress = () => {
    router.replace('/');
  };

  const handleSearchPodcasts = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredPodcasts(POPULAR_PODCASTS);
    } else {
      const filtered = POPULAR_PODCASTS.filter(podcast =>
        podcast.name.toLowerCase().includes(query.toLowerCase()) ||
        podcast.channel.toLowerCase().includes(query.toLowerCase()) ||
        podcast.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPodcasts(filtered);
    }
  };

  const handlePodcastSelect = (podcast: typeof POPULAR_PODCASTS[0]) => {
    const youtubeUrl = `https://www.youtube.com/@${podcast.channel}`;
    Linking.openURL(youtubeUrl).catch(() => {
      Alert.alert('Error', 'Could not open YouTube channel');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Elara Title */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleHomePress} style={styles.elaraHeader}>
              <Text style={styles.elaraTitle}>Elara</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Add YouTube Podcast</Text>
            <Text style={styles.subtitle}>Paste a YouTube video URL to start chatting</Text>
          </View>

          {/* Input Panel */}
          <EnhancedLiquidGlass
            intensity="high"
            borderRadius={20}
            style={styles.inputPanel}
          >
            <Text style={styles.inputLabel}>YouTube URL</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="https://youtube.com/watch?v=..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={podcastLink}
                onChangeText={setPodcastLink}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>
          </EnhancedLiquidGlass>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <EnhancedLiquidGlass
              intensity="ultra"
              borderRadius={16}
              glowEffect={!isLoading}
              style={styles.buttonWrapper}
            >
              <GlassButton
                title={isLoading ? 'Processing...' : 'Start Conversation'}
                onPress={handleSubmit}
                variant="primary"
                size="lg"
                disabled={isLoading}
                style={styles.actionButton}
              />
            </EnhancedLiquidGlass>

            {/* Demo Mode Button for UI Testing */}
            <EnhancedLiquidGlass
              intensity="medium"
              borderRadius={16}
              style={styles.demoButtonWrapper}
            >
              <GlassButton
                title="🎮 Demo Mode (Skip to Player)"
                onPress={handleDemoMode}
                variant="secondary"
                size="md"
                style={styles.demoButton}
              />
            </EnhancedLiquidGlass>
            
            <Text style={styles.demoText}>
              Use Demo Mode to skip URL processing and go directly to the podcast player with mock data for UI testing
            </Text>
          </View>

          {/* Podcast Search Widget */}
          <EnhancedLiquidGlass
            intensity="medium"
            borderRadius={20}
            style={styles.searchPanel}
          >
            {/* Search Bar at Top */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search podcasts..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={searchQuery}
                onChangeText={handleSearchPodcasts}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Podcast List */}
            <View style={styles.podcastList}>
              {filteredPodcasts.map((podcast, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.podcastItem}
                  onPress={() => handlePodcastSelect(podcast)}
                  activeOpacity={0.7}
                >
                  <EnhancedLiquidGlass
                    intensity="low"
                    borderRadius={12}
                    style={styles.podcastCard}
                  >
                    <View style={styles.podcastInfo}>
                      <Text style={styles.podcastName}>{podcast.name}</Text>
                      <Text style={styles.podcastChannel}>@{podcast.channel}</Text>
                      <Text style={styles.podcastDescription}>{podcast.description}</Text>
                    </View>
                    <View style={styles.linkIcon}>
                      <Text style={styles.linkIconText}>🔗</Text>
                    </View>
                  </EnhancedLiquidGlass>
                </TouchableOpacity>
              ))}
            </View>
          </EnhancedLiquidGlass>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  elaraHeader: {
    alignSelf: 'center',
    marginBottom: 20,
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
  inputPanel: {
    padding: 20,
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
    minHeight: 80,
  },
  actionContainer: {
    marginBottom: 30,
  },
  buttonWrapper: {
    // EnhancedLiquidGlass will handle styling
  },
  actionButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  demoButtonWrapper: {
    marginTop: 16,
  },
  demoButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  demoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  searchPanel: {
    padding: 20,
  },
  searchContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },
  searchInput: {
    padding: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
  },
  podcastList: {
    gap: 12,
  },
  podcastItem: {
    // TouchableOpacity wrapper
  },
  podcastCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  podcastInfo: {
    flex: 1,
  },
  podcastName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 4,
  },
  podcastChannel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  podcastDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 16,
  },
  linkIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkIconText: {
    fontSize: 18,
  },
}); 