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
  Clipboard,
} from 'react-native';
import { router } from 'expo-router';
import { GlassButton } from '../components/GlassButton';
import SimpleView from '../components/TestGlass';
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

// Mock favorite channels
const FAVORITE_CHANNELS = [
  { name: 'Lex Fridman Podcast', channel: 'lexfridman', description: 'AI, science, and philosophy' },
  { name: 'The Joe Rogan Experience', channel: 'PowerfulJRE', description: 'Long form conversations' },
  { name: 'All-In Podcast', channel: 'All-In Podcast', description: 'Tech and business insights' },
];

// Mock new episodes from favorites
const NEW_EPISODES = [
  { title: 'AI Safety with Yoshua Bengio', channel: 'lexfridman', description: 'Latest on AI alignment', duration: '2:15:30' },
  { title: 'Markets, Politics & AI Revolution', channel: 'All-In Podcast', description: 'The besties discuss market trends', duration: '1:32:18' },
  { title: 'Elon Musk Returns', channel: 'PowerfulJRE', description: 'Tesla, SpaceX, and Twitter', duration: '3:02:15' },
  { title: 'The Future of Robotics', channel: 'lexfridman', description: 'Boston Dynamics CEO', duration: '1:58:45' },
];

export default function YouTubePage() {
  const [podcastLink, setPodcastLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPodcasts, setFilteredPodcasts] = useState(POPULAR_PODCASTS);
  const [activeTab, setActiveTab] = useState('favorites');

  const handleSubmit = async () => {
    console.log('🚀 FRONTEND: handleSubmit called with URL:', podcastLink);
    
    if (!podcastLink.trim()) {
      Alert.alert('Error', 'Please enter a YouTube URL');
      return;
    }

    try {
      console.log('🔄 FRONTEND: Starting processing...');
      setIsLoading(true);
      
      console.log('📞 FRONTEND: Calling processPodcastLink...');
      // Process the YouTube URL and get video metadata + episode ID
      const result: ProcessResult = await processPodcastLink(podcastLink);
      
      console.log('✅ FRONTEND: Processing successful, result:', result);
      
      // Navigate to the episode conversation
      console.log('🧭 FRONTEND: Navigating to episode:', result.episodeId);
      router.push(`/${result.episodeId}`);
      
    } catch (error) {
      console.error('❌ FRONTEND: Error caught in handleSubmit:', error);
      console.error('❌ FRONTEND: Error type:', typeof error);
      console.error('❌ FRONTEND: Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ FRONTEND: Full error object:', JSON.stringify(error, null, 2));
      
      Alert.alert('Error', `Failed to process YouTube URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      console.log('🏁 FRONTEND: Setting loading to false');
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

  const handlePaste = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      if (clipboardContent) {
        setPodcastLink(clipboardContent);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to paste from clipboard');
    }
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
            <TouchableOpacity onPress={() => router.replace('/') }>
              <Text style={styles.elaraLogoGlow}>elara</Text>
            </TouchableOpacity>
          </View>

          {/* Input Panel */}
          <SimpleView
            intensity="high"
            borderRadius={20}
            style={styles.inputPanel}
          >
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Add Youtube Link Here"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={podcastLink}
                onChangeText={setPodcastLink}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <TouchableOpacity 
                style={styles.pasteButton}
                onPress={handlePaste}
                activeOpacity={0.7}
              >
                <Text style={styles.pasteIcon}>⎘</Text>
              </TouchableOpacity>
            </View>
          </SimpleView>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <SimpleView
              intensity="ultra"
              borderRadius={16}
              glowEffect={!isLoading}
              style={styles.buttonWrapper}
            >
              <GlassButton
                title={isLoading ? 'Processing...' : 'Start Conversation'}
                onPress={isLoading ? () => {} : handleSubmit}
                variant="primary"
                size="lg"
                style={styles.actionButton}
              />
            </SimpleView>

            {/* Demo Mode Button for UI Testing */}
            <SimpleView
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
            </SimpleView>
            
            <Text style={styles.demoText}>
              Use Demo Mode to skip URL processing and go directly to the podcast player with mock data for UI testing
            </Text>
          </View>

          {/* Podcast Search Widget */}
          <SimpleView
            intensity="high"
            borderRadius={20}
            glowEffect={true}
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

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
                onPress={() => setActiveTab('favorites')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
                  Favorites
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'new' && styles.activeTab]}
                onPress={() => setActiveTab('new')}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === 'new' && styles.activeTabText]}>
                  New
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content based on active tab */}
            {activeTab === 'favorites' ? (
              <View style={styles.podcastList}>
                {FAVORITE_CHANNELS.map((podcast, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.podcastItem}
                    onPress={() => handlePodcastSelect(podcast)}
                    activeOpacity={0.7}
                  >
                    <SimpleView
                      intensity="medium"
                      borderRadius={12}
                      glowEffect={true}
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
                    </SimpleView>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.podcastList}>
                {NEW_EPISODES.map((episode, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.podcastItem}
                    onPress={() => {
                      // Handle episode selection
                      Alert.alert('Episode', `Play: ${episode.title}`);
                    }}
                    activeOpacity={0.7}
                  >
                    <SimpleView
                      intensity="medium"
                      borderRadius={12}
                      glowEffect={true}
                      style={styles.podcastCard}
                    >
                      <View style={styles.podcastInfo}>
                        <Text style={styles.podcastName}>{episode.title}</Text>
                        <Text style={styles.podcastChannel}>@{episode.channel}</Text>
                        <Text style={styles.podcastDescription}>{episode.description}</Text>
                      </View>
                      <View style={styles.episodeInfo}>
                        <Text style={styles.episodeDuration}>{episode.duration}</Text>
                        <Text style={styles.playIcon}>▶</Text>
                      </View>
                    </SimpleView>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </SimpleView>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
    minHeight: 50,
  },
  pasteButton: {
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 16,
    paddingLeft: 16,  
    justifyContent: 'center',
    alignItems: 'center',
  },
  pasteIcon: {
    fontSize: 44,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionContainer: {
    marginBottom: 30,
  },
  buttonWrapper: {
    // TestGlass will handle styling
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
  tabContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeTabText: {
    color: 'rgba(255, 255, 255, 0.95)',
  },
  podcastList: {
    gap: 16,
  },
  podcastItem: {
    // TouchableOpacity wrapper
  },
  podcastCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
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
  episodeInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  episodeDuration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  playIcon: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.7)',
  },
}); 