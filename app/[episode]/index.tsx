import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import PodcastPlayer from '../../components/PodcastPlayer';
import ChatInput from '../../components/ChatInput';
import ResponseAudio from '../../components/ResponseAudio';
import { getEpisodeData } from '../../lib/api';

interface EpisodeData {
  id: string;
  title: string;
  audioUrl: string;
  hosts: string[];
  transcript?: string;
}

export default function EpisodePage() {
  const { episode } = useLocalSearchParams<{ episode: string }>();
  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEpisodeData();
  }, [episode]);

  const loadEpisodeData = async () => {
    try {
      if (episode) {
        const data = await getEpisodeData(episode);
        setEpisodeData(data);
      }
    } catch (error) {
      console.error('Error loading episode data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewResponse = (responseAudioUrl: string) => {
    setCurrentResponse(responseAudioUrl);
  };

  if (isLoading || !episodeData) {
    return (
      <View style={styles.loadingContainer}>
        {/* Loading state - could add a spinner here */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <PodcastPlayer
          title={episodeData.title}
          audioUrl={episodeData.audioUrl}
          hosts={episodeData.hosts}
        />
        
        {currentResponse && (
          <ResponseAudio audioUrl={currentResponse} />
        )}
      </ScrollView>
      
      <ChatInput
        episodeId={episode!}
        onResponse={handleNewResponse}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100, // Space for chat input
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
}); 