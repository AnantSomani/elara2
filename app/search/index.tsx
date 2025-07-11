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
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LiquidGlassButton } from '../../components/LiquidGlassButton';
import { searchPodcasts, type PodcastSearchResult } from '../../lib/podcastSearch';

export default function SearchResultsPage() {
  const { q } = useLocalSearchParams<{ q: string }>();
  const [searchQuery, setSearchQuery] = useState(q || '');
  const [results, setResults] = useState<PodcastSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (q) {
      performSearch(q);
    }
  }, [q]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      const searchResults = await searchPodcasts(query.trim());
      setResults(searchResults);

      if (searchResults.length === 0) {
        setError(`No podcasts found for "${query}"`);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search podcasts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.setParams({ q: searchQuery.trim() });
      performSearch(searchQuery.trim());
    }
  };

  const handlePodcastSelect = (podcast: PodcastSearchResult) => {
    router.push(`/podcast/${podcast.id}`);
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backIconButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Podcasts</Text>
          <View style={styles.backIconButton} />
        </View>

        {/* Search Input */}
        <LiquidGlassButton 
          borderRadius={28} 
          intensity="high" 
          style={styles.searchCard}
        >
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search podcasts..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              style={styles.searchInput}
              returnKeyType="search"
              autoFocus={!q}
            />
            <TouchableOpacity 
              onPress={handleSearch}
              style={styles.searchButton}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </LiquidGlassButton>

        {/* Results Section */}
        {hasSearched && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>
              {isLoading 
                ? 'Searching...' 
                : error
                ? 'No Results'
                : `Found ${results.length} podcast${results.length !== 1 ? 's' : ''}`
              }
            </Text>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#aeefff" />
                <Text style={styles.loadingText}>Searching podcasts...</Text>
              </View>
            ) : error ? (
              <LiquidGlassButton 
                borderRadius={28} 
                intensity="medium" 
                style={styles.errorCard}
              >
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.errorHint}>Try different keywords or check spelling</Text>
              </LiquidGlassButton>
            ) : (
              results.map((podcast) => (
                <LiquidGlassButton 
                  key={podcast.id} 
                  borderRadius={24} 
                  intensity="medium" 
                  style={styles.podcastCard}
                >
                  <TouchableOpacity 
                    onPress={() => handlePodcastSelect(podcast)}
                    style={styles.podcastButton}
                  >
                    <View style={styles.podcastContent}>
                      <View style={styles.podcastHeader}>
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
                          <Text style={styles.podcastTitle} numberOfLines={2}>
                            {podcast.title}
                          </Text>
                          <Text style={styles.podcastAuthor}>
                            by {podcast.author}
                          </Text>
                          {podcast.description && (
                            <Text style={styles.podcastDescription} numberOfLines={2}>
                              {podcast.description}
                            </Text>
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.podcastFooter}>
                        <Text style={styles.selectHint}>Tap to view episodes →</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </LiquidGlassButton>
              ))
            )}
          </View>
        )}

        {/* Initial State */}
        {!hasSearched && (
          <LiquidGlassButton 
            borderRadius={28} 
            intensity="medium" 
            style={styles.welcomeCard}
          >
            <Text style={styles.welcomeTitle}>🔍 Discover Podcasts</Text>
            <Text style={styles.welcomeText}>
              Search for your favorite podcasts by name, host, or topic. Try searching for popular shows like:
            </Text>
            <View style={styles.suggestionsContainer}>
              {['All-In Podcast', 'Joe Rogan Experience', 'Serial', 'This American Life'].map((suggestion) => (
                <TouchableOpacity 
                  key={suggestion}
                  onPress={() => {
                    setSearchQuery(suggestion);
                    performSearch(suggestion);
                  }}
                  style={styles.suggestionButton}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </LiquidGlassButton>
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
  searchCard: {
    marginBottom: 32,
  },
  searchContainer: {
    padding: 16,
    gap: 12,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(174, 239, 255, 0.3)',
  },
  searchButton: {
    backgroundColor: 'rgba(174, 239, 255, 0.6)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
  resultsSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 40,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  errorCard: {
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
  errorHint: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  podcastCard: {
    marginBottom: 12,
  },
  podcastButton: {
    padding: 16,
  },
  podcastContent: {
    gap: 16,
  },
  podcastHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  podcastImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  podcastImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podcastImageText: {
    fontSize: 32,
  },
  podcastMeta: {
    flex: 1,
    gap: 6,
  },
  podcastTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 24,
  },
  podcastAuthor: {
    fontSize: 14,
    color: 'rgba(174, 239, 255, 0.8)',
    fontWeight: '500',
  },
  podcastDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  podcastFooter: {
    alignItems: 'flex-end',
  },
  selectHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  welcomeCard: {
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  suggestionsContainer: {
    gap: 8,
    alignItems: 'center',
  },
  suggestionButton: {
    backgroundColor: 'rgba(174, 239, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(174, 239, 255, 0.3)',
  },
  suggestionText: {
    color: 'rgba(174, 239, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
}); 