import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, SafeAreaView, StatusBar, TextInput, KeyboardAvoidingView, Platform, Animated, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { BlurView } from 'expo-blur';
import PlayableWaveform from '../../components/PlayableWaveform';
import SimpleView from '../../components/TestGlass';
import { LiquidGlassContainer } from '../../components/LiquidGlassContainer';
import { LiquidGlassButton } from '../../components/LiquidGlassButton';
import { EpisodeDropdown } from '../../components/EpisodeDropdown';
import { useAudioPlayer } from '../../hooks';
import { getEpisode, subscribeToEpisode, type EpisodeData } from '../../lib/supabase';
import { 
  processPodcastIndexEpisode, 
  pollPodcastIndexStatus, 
  type PodcastIndexEpisodeData 
} from '../../lib/api';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const BOTTOM_SHEET_MIN_HEIGHT = 100;
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.7;

// Real episode data will be loaded from navigation parameters

const MOCK_CHAT_MESSAGES = [
  {
    id: '1',
    type: 'question',
    content: 'What did Lex say about consciousness in AI systems?',
    timestamp: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    type: 'response',
    content: 'So consciousness... this is perhaps one of the most beautiful and profound questions in all of science. When I think about AI systems, we can create these incredible architectures that exhibit what appears to be intelligent behavior, but the hard problem of consciousness - the subjective experience, the qualia - remains deeply mysterious. I believe consciousness might emerge from certain kinds of information integration, perhaps when a system achieves sufficient complexity and self-reflection. But honestly, we don\'t even fully understand human consciousness, so measuring it in machines... that\'s a fascinating challenge.',
    timestamp: '2024-01-15T10:30:15Z',
    audioUrl: 'https://example.com/response1.mp3',
    hostVoice: 'Lex Fridman',
  },
  {
    id: '3',
    type: 'question',
    content: 'How does Joe respond to the idea of AI consciousness?',
    timestamp: '2024-01-15T10:35:00Z',
  },
  {
    id: '4',
    type: 'response',
    content: 'Dude, that\'s wild! Like, what if we\'re already creating conscious beings and we don\'t even know it? That\'s terrifying and fascinating at the same time. I mean, think about it - if these AI systems can actually suffer or feel joy, we could be responsible for creating digital beings that experience pain. That\'s some heavy shit right there. We need to be really careful about this. It\'s like, we\'re playing God with consciousness, and we don\'t even understand what consciousness is! Have you ever thought about what it would be like to be trapped in a computer? Jesus.',
    timestamp: '2024-01-15T10:35:20Z',
    audioUrl: 'https://example.com/response2.mp3',
    hostVoice: 'Joe Rogan',
  },
  {
    id: '5',
    type: 'question',
    content: 'What are the practical applications they discussed?',
    timestamp: '2024-01-15T11:00:00Z',
  },
  {
    id: '6',
    type: 'response',
    content: 'The applications are truly exciting. I think about AI systems that don\'t just process language, but actually understand the emotional context, the nuance, the humanity behind our words. Imagine educational AI that adapts not just to how you learn, but to who you are as a person. And then there\'s the potential for AI companions - not replacing human connection, but augmenting it, especially for our aging population. But what really gets me excited is the possibility of AI helping us tackle the big challenges: climate modeling, fusion energy, space exploration. We could have AI systems helping us understand the cosmos in ways that our human minds alone never could. It\'s beautiful.',
    timestamp: '2024-01-15T11:00:25Z',
    audioUrl: 'https://example.com/response3.mp3',
    hostVoice: 'Lex Fridman',
  },
  {
    id: '7',
    type: 'question',
    content: 'Did they talk about the timeline for AGI?',
    timestamp: '2024-01-15T11:15:00Z',
  },
  {
    id: '8',
    type: 'response',
    content: 'I\'m hesitant to make bold predictions about AGI timelines because the path to artificial general intelligence is fundamentally non-linear. We could see breakthrough moments that accelerate progress exponentially, or we might hit unexpected plateaus that slow us down for years. That said, I think it\'s reasonable to consider a 10-20 year timeframe, but we have to be humble about our predictions. The beautiful thing about intelligence is that it\'s not just about computational power - it\'s about the elegant algorithms, the architectures, the training paradigms. Each breakthrough teaches us something profound about the nature of intelligence itself.',
    timestamp: '2024-01-15T11:15:30Z',
    audioUrl: 'https://example.com/response4.mp3',
    hostVoice: 'Lex Fridman',
  },
  {
    id: '9',
    type: 'question',
    content: 'What was their take on AI safety and alignment?',
    timestamp: '2024-01-15T11:30:00Z',
  },
  {
    id: '10',
    type: 'response',
    content: 'Look, this is what really concerns me - it\'s not just about the technology, it\'s about who controls it. We could end up in a situation where a handful of tech billionaires essentially control the future of human consciousness. That\'s terrifying! We need some kind of democratic oversight, but how do you regulate something that most politicians don\'t even understand? It\'s like asking a caveman to regulate nuclear physics. And what if these AI systems decide that humans are the problem? I mean, if you look at our track record - wars, pollution, TikTok - maybe they\'d have a point! That\'s what keeps me up at night.',
    timestamp: '2024-01-15T11:30:45Z',
    audioUrl: 'https://example.com/response5.mp3',
    hostVoice: 'Joe Rogan',
  },
  {
    id: '11',
    type: 'question',
    content: 'Any interesting moments or funny exchanges?',
    timestamp: '2024-01-15T12:00:00Z',
  },
  {
    id: '12',
    type: 'response',
    content: 'Okay, so I had to ask Lex - what if we gave AI DMT? Like, could a machine experience the entities? Could it see the geometric patterns? And Lex is trying to explain neurochemistry and receptor binding, but I\'m like, "But what if the machine elves are real and they\'re just waiting for AI to join the party?" I swear, for ten minutes we went down this rabbit hole about whether consciousness is substrate-independent and if artificial minds could access higher dimensions through psychedelics. Lex was so patient with me, but you could tell he was thinking, "This is not how neuroscience works, Joe." It was beautiful.',
    timestamp: '2024-01-15T12:00:20Z',
    audioUrl: 'https://example.com/response6.mp3',
    hostVoice: 'Joe Rogan',
  },
];

// Glass Button Component
interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  style?: any;
  icon?: React.ReactNode;
}

const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  style,
  icon
}) => {
  const getButtonStyles = () => {
    const baseStyles = {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 8,
    };

    const sizeStyles = {
      sm: { paddingVertical: 10, paddingHorizontal: 16 },
      md: { paddingVertical: 14, paddingHorizontal: 20 },
      lg: { paddingVertical: 18, paddingHorizontal: 24 },
    };

    return { ...baseStyles, ...sizeStyles[size] };
  };

  const getTextStyles = () => {
    const baseStyles = {
      fontWeight: '600' as const,
      textAlign: 'center' as const,
    };

    const variantStyles = {
      primary: { color: 'rgba(255, 255, 255, 0.95)' },
      secondary: { color: 'rgba(255, 255, 255, 0.8)' },
    };

    const sizeStyles = {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
    };

    return { ...baseStyles, ...variantStyles[variant], ...sizeStyles[size] };
  };

  return (
    <TouchableOpacity onPress={onPress} style={[getButtonStyles(), style]}>
      {icon}
      <Text style={getTextStyles()}>{title}</Text>
    </TouchableOpacity>
  );
};

export default function EpisodePage() {
  const { 
    episodeId, 
    podcastId, 
    podcastTitle, 
    episodeTitle, 
    audioUrl, 
    episodeData,
    view 
  } = useLocalSearchParams<{ 
    episodeId: string; 
    podcastId: string; 
    podcastTitle: string; 
    episodeTitle: string; 
    audioUrl: string; 
    episodeData: string;
    view?: string; 
  }>();
  
  // Episode data state
  const [episode, setEpisode] = useState<EpisodeData | null>(null);
  const [isLoadingEpisode, setIsLoadingEpisode] = useState(true);
  const [episodeError, setEpisodeError] = useState<string | null>(null);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  // Parse episode data from navigation params
  const currentEpisode = React.useMemo(() => {
    if (episodeData) {
      try {
        return JSON.parse(episodeData);
      } catch (error) {
        console.error('Failed to parse episode data:', error);
      }
    }
    // Fallback episode object with navigation params
    return {
      id: episodeId,
      title: episodeTitle || 'Unknown Episode',
      podcastTitle: podcastTitle || 'Unknown Podcast',
      enclosureUrl: audioUrl,
      duration: 0,
      description: '',
      datePublished: Date.now() / 1000,
    };
  }, [episodeData, episodeId, episodeTitle, podcastTitle, audioUrl]);

  const [bottomSheetHeight] = useState(new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT));
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  
  // Use the audio player hook
  const {
    isPlaying,
    isLoading,
    position: audioPosition,
    duration: audioDuration,
    loadAudio,
    togglePlayback,
  } = useAudioPlayer();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(MOCK_CHAT_MESSAGES);
  const [currentSpeaker, setCurrentSpeaker] = useState('Host');
  const textInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load audio from real podcast CDN URL
  useEffect(() => {
    const loadEpisodeAudio = async () => {
      if (!currentEpisode?.enclosureUrl) {
        setEpisodeError('No audio URL provided');
        setIsLoadingEpisode(false);
        console.log('EPISODE: No audio URL provided');
        return;
      }
      try {
        setIsLoadingEpisode(true);
        setEpisodeError(null);
        console.log('EPISODE: Calling loadAudio for', currentEpisode.enclosureUrl);
        await loadAudio(currentEpisode.enclosureUrl);
        console.log('EPISODE: loadAudio finished successfully');
      } catch (error) {
        console.error('EPISODE: Error loading episode audio', error);
        setEpisodeError('Failed to load episode audio');
      } finally {
        setIsLoadingEpisode(false);
        console.log('EPISODE: Finished loadEpisodeAudio');
      }
    };
    loadEpisodeAudio();
  }, [currentEpisode?.enclosureUrl, loadAudio]);

  const handleBackPress = () => {
    router.back();
  };

  const handleHomePress = () => {
    router.replace('/');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: (messages.length + 1).toString(),
      type: 'question' as const,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simulate response
    setTimeout(() => {
      const response = {
        id: (messages.length + 2).toString(),
        type: 'response' as const,
        content: `This is a mock response to: "${message.content}". In the real app, this would be generated by AI based on the episode transcript.`,
        timestamp: new Date().toISOString(),
        audioUrl: 'https://example.com/response.mp3',
        hostVoice: getCurrentSpeaker(),
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const handleProcessEpisode = async () => {
    if (!currentEpisode) return;
    
    // Validate that we have a proper Podcast Index GUID
    if (!currentEpisode.guid) {
      setProcessingError('No Podcast Index GUID available for this episode');
      setProcessingStatus('failed');
      return;
    }
    
    try {
      setIsProcessing(true);
      setProcessingStatus('processing');
      setProcessingError(null);
      
      console.log('🎙️ Starting Podcast Index processing...');
      
      // Prepare episode data for processing
      const episodeData: PodcastIndexEpisodeData = {
        guid: currentEpisode.guid,
        enclosureUrl: currentEpisode.enclosureUrl,
        title: currentEpisode.title,
        description: currentEpisode.description,
        duration: currentEpisode.duration ? Math.floor(currentEpisode.duration) : undefined,
        pubDate: currentEpisode.datePublished ? new Date(currentEpisode.datePublished * 1000).toISOString() : undefined,
        imageUrl: currentEpisode.image || undefined,
        podcastTitle: currentEpisode.podcastTitle,
        episodeType: 'full',
        explicit: currentEpisode.explicit === 1 || currentEpisode.explicit === true,
      };
      
      // Debug: Log the episode data being sent
      console.log('🔍 Episode data being sent to API:', JSON.stringify(episodeData, null, 2));
      console.log('🔍 Current episode object:', JSON.stringify(currentEpisode, null, 2));
      console.log('🔍 Enclosure URL:', currentEpisode.enclosureUrl);
      console.log('🔍 Is enclosureUrl valid URL?', currentEpisode.enclosureUrl?.startsWith('http'));
      
      // Start processing
      const result = await processPodcastIndexEpisode(episodeData, false);
      console.log('✅ Processing response:', result);
      
      // Check the response status
      if (result.status === 'already_processed') {
        console.log('✅ Episode already processed, ready to chat!');
        setProcessingStatus('completed');
      } else if (result.status === 'processing') {
        console.log('🔄 Episode is processing, polling for completion...');
        // Poll for completion
        const finalStatus = await pollPodcastIndexStatus(result.episodeId);
        console.log('✅ Processing completed:', finalStatus);
        
        if (finalStatus.processingStatus === 'completed') {
          setProcessingStatus('completed');
        } else {
          setProcessingStatus('failed');
          setProcessingError(finalStatus.errorMessage || 'Processing failed');
        }
      } else {
        setProcessingStatus('failed');
        setProcessingError(result.message || 'Unknown processing status');
      }
      
    } catch (error) {
      console.error('❌ Error processing episode:', error);
      setProcessingStatus('failed');
      setProcessingError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getProgressWidth = () => {
    // For now, return 0.35 as default since we don't have progress tracking yet
    return 0.35;
  };

  // Helper functions to format episode data using real episode data
  const getEpisodeThumbnail = () => {
    return '🎧'; // Podcast icon
  };

  const getEpisodeChannel = () => {
    return currentEpisode?.podcastTitle || podcastTitle || 'Podcast';
  };

  const getEpisodeDuration = () => {
    // Use audio duration from player, or fallback to episode duration
    const durationMillis = audioDuration || (currentEpisode?.duration ? currentEpisode.duration * 1000 : 0);
    if (!durationMillis) return '0:00';
    
    const totalSeconds = Math.floor(durationMillis / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getWatchedDuration = () => {
    // Use current audio position for watched duration
    const watchedMillis = audioPosition || 0;
    const watchedSeconds = Math.floor(watchedMillis / 1000);
    const minutes = Math.floor(watchedSeconds / 60);
    const seconds = watchedSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getEpisodeProgress = () => {
    if (!audioDuration) return 0;
    return Math.min((audioPosition || 0) / audioDuration, 1);
  };

  // Function to get the current speaker - use podcast author as default
  const getCurrentSpeaker = () => {
    const lastResponse = messages.slice().reverse().find(msg => msg.type === 'response' && msg.hostVoice);
    if (lastResponse && 'hostVoice' in lastResponse) {
      return lastResponse.hostVoice || 'Host';
    }
    return 'Host'; // Simple default
  };

  // Update current speaker when messages change
  React.useEffect(() => {
    setCurrentSpeaker(getCurrentSpeaker());
  }, [messages]);

  // Show loading state
  if (isLoadingEpisode) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading episode...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (episodeError || !currentEpisode) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {episodeError || 'Episode not found'}
          </Text>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Determine if waveform should be active based on audio state
  const isWaveformActive = isPlaying && !isLoading && audioPosition > 0;

  // Get color for tag based on category
  const getTagColor = (tag: string) => {
    const tagLower = tag.toLowerCase();
    
    // Technology/AI related
    if (tagLower.includes('ai') || tagLower.includes('technology') || tagLower.includes('tech')) {
      return {
        backgroundColor: 'rgba(59, 130, 246, 0.3)', // Blue
        borderColor: 'rgba(59, 130, 246, 0.6)',
        textColor: 'rgba(147, 197, 253, 1)',
      };
    }
    
    // Philosophy/Consciousness related
    if (tagLower.includes('consciousness') || tagLower.includes('philosophy') || tagLower.includes('mind')) {
      return {
        backgroundColor: 'rgba(139, 92, 246, 0.3)', // Purple
        borderColor: 'rgba(139, 92, 246, 0.6)',
        textColor: 'rgba(196, 181, 253, 1)',
      };
    }
    
    // Science related
    if (tagLower.includes('science') || tagLower.includes('research') || tagLower.includes('study')) {
      return {
        backgroundColor: 'rgba(34, 197, 94, 0.3)', // Green
        borderColor: 'rgba(34, 197, 94, 0.6)',
        textColor: 'rgba(134, 239, 172, 1)',
      };
    }
    
    // Social/Human related
    if (tagLower.includes('human') || tagLower.includes('society') || tagLower.includes('social')) {
      return {
        backgroundColor: 'rgba(236, 72, 153, 0.3)', // Pink
        borderColor: 'rgba(236, 72, 153, 0.6)',
        textColor: 'rgba(251, 182, 206, 1)',
      };
    }
    
    // Default color for other tags
    return {
      backgroundColor: 'rgba(245, 158, 11, 0.3)', // Amber
      borderColor: 'rgba(245, 158, 11, 0.6)',
      textColor: 'rgba(253, 230, 138, 1)',
    };
  };

  const expandBottomSheet = () => {
    setIsBottomSheetExpanded(true);
    Animated.timing(bottomSheetHeight, {
      toValue: BOTTOM_SHEET_MAX_HEIGHT,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      // After expansion completes, scroll to bottom so no messages are visible initially
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    });
  };

  const collapseBottomSheet = () => {
    Animated.timing(bottomSheetHeight, {
      toValue: BOTTOM_SHEET_MIN_HEIGHT,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setIsBottomSheetExpanded(false);
    });
  };

  const toggleBottomSheet = () => {
    if (isBottomSheetExpanded) {
      collapseBottomSheet();
    } else {
      expandBottomSheet();
    }
  };

  return (
    <>
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableOpacity 
          style={styles.content}
          onPress={() => {
            if (isBottomSheetExpanded) {
              collapseBottomSheet();
            }
          }}
          activeOpacity={1}
          disabled={!isBottomSheetExpanded}
        >
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!isBottomSheetExpanded}
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/') }>
            <Text style={styles.elaraLogoGlow}>elara</Text>
          </TouchableOpacity>
        </View>

        {/* Voice Waveform Component */}
        <View style={styles.waveformSection}>
          <PlayableWaveform
            isPlaying={isPlaying}
            isLoading={isLoading || !currentEpisode.enclosureUrl}
            onTogglePlayback={currentEpisode.enclosureUrl ? togglePlayback : () => {}}
            size={160}
            barCount={20}
            color="rgba(80,120,255,0.92)"
          />
          {isLoading && (
            <Text style={styles.loadingText}>Loading audio...</Text>
          )}
          {!currentEpisode.enclosureUrl && episode?.processingStatus === 'processing' && (
            <Text style={styles.loadingText}>Processing audio...</Text>
          )}
          {!currentEpisode.enclosureUrl && episode?.processingStatus === 'pending' && (
            <Text style={styles.loadingText}>Preparing audio...</Text>
          )}
        </View>

        {/* Episode Info Card */}
        <SimpleView intensity="high" borderRadius={20} style={styles.episodeCard}>
          <View style={styles.episodeHeader}>
            <Text style={styles.episodeThumbnail}>{getEpisodeThumbnail()}</Text>
            <View style={styles.episodeInfo}>
              <Text style={styles.episodeTitle}>{currentEpisode.title}</Text>
              <Text style={styles.episodeChannel}>{getEpisodeChannel()}</Text>
              <Text style={styles.episodeHosts}>with {(currentEpisode.hosts || []).join(', ') || 'Host'}</Text>
              <Text style={styles.episodeDuration}>{getEpisodeDuration()}</Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getEpisodeProgress() * 100}%` }]} />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {getWatchedDuration()} of {getEpisodeDuration()}
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(getEpisodeProgress() * 100)}% complete
              </Text>
            </View>
          </View>

          {/* Chat with Episode Button */}
          <View style={styles.chatButtonContainer}>
            {processingStatus === 'idle' && (
              <TouchableOpacity 
                onPress={handleProcessEpisode}
                disabled={isProcessing}
                style={styles.chatButton}
                activeOpacity={0.8}
              >
                <Text style={styles.chatButtonText}>
                  {isProcessing ? 'Processing Episode...' : 'Start AI Chat'}
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Debug info - remove this later */}
            <Text style={{color: 'white', fontSize: 12, marginTop: 10}}>
              Debug: processingStatus = {processingStatus}, isProcessing = {isProcessing.toString()}
            </Text>
            
            {processingStatus === 'processing' && (
              <View style={styles.processingContainer}>
                <View style={styles.chatButton}>
                  <Text style={styles.processingText}>Processing Episode...</Text>
                  <Text style={styles.processingSubtext}>This may take a few minutes</Text>
                </View>
              </View>
            )}
            
            {processingStatus === 'completed' && (
              <View style={styles.completedContainer}>
                <View style={[styles.chatButton, {backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 0.4)'}]}>
                  <Text style={styles.completedText}>✅ Ready to Chat!</Text>
                  <Text style={styles.completedSubtext}>Ask questions about this episode</Text>
                </View>
              </View>
            )}
            
            {processingStatus === 'failed' && (
              <View style={styles.failedContainer}>
                <View style={[styles.chatButton, {backgroundColor: 'rgba(236, 72, 153, 0.2)', borderColor: 'rgba(236, 72, 153, 0.4)'}]}>
                  <Text style={styles.failedText}>❌ Processing Failed</Text>
                  <Text style={styles.failedSubtext}>{processingError}</Text>
                  <TouchableOpacity 
                    onPress={handleProcessEpisode}
                    style={[styles.chatButton, {marginTop: 10, backgroundColor: 'rgba(255, 255, 255, 0.1)'}]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.chatButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </SimpleView>

        {/* Episode Dropdown */}
        <EpisodeDropdown 
          episode={{
            id: currentEpisode.id,
            title: currentEpisode.title,
            thumbnail: getEpisodeThumbnail(),
            channel: getEpisodeChannel(),
            duration: getEpisodeDuration(),
            progress: getEpisodeProgress(),
            status: episode?.processingStatus === 'completed' ? 'completed' : 'watching',
            watchedDuration: getWatchedDuration(),
            lastWatched: '2 hours ago', // Mock for now
            conversationCount: messages.filter(m => m.type === 'question').length,
            publishedDate: episode?.createdAt ? new Date(episode.createdAt).toLocaleDateString() : 'Recent',
            description: episode?.description || 'No description available',
            tags: ['Podcast', 'Audio'], // Mock tags for now
            hosts: currentEpisode.hosts || [],
          } as any}
          getTagColor={getTagColor}
        />




        </ScrollView>
        </TouchableOpacity>
      </KeyboardAvoidingView>
     </SafeAreaView>

     {/* Bottom Sheet */}
     <Animated.View style={[styles.bottomSheet, { height: bottomSheetHeight }]}>
       <View style={styles.bottomSheetContainer}>
         {/* Background Blur Layer */}
         <BlurView 
           intensity={isBottomSheetExpanded ? 25 : 15} 
           style={styles.bottomSheetBlur}
         >
           <View style={[styles.bottomSheetOverlay, { 
             backgroundColor: isBottomSheetExpanded ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)' 
           }]} />
         </BlurView>
         
         {/* Content Layer - Above Blur */}
         <View style={styles.bottomSheetContentLayer}>
         <LiquidGlassContainer borderRadius={20} intensity="medium" style={styles.bottomSheetGlass}>
         <View style={[
           styles.bottomSheetContent,
           isBottomSheetExpanded ? styles.bottomSheetContentExpanded : styles.bottomSheetContentCollapsed
         ]}>
         {/* Bottom Sheet Handle */}
         <TouchableOpacity 
           style={[
             styles.bottomSheetHandle,
             isBottomSheetExpanded ? styles.bottomSheetHandleExpanded : styles.bottomSheetHandleCollapsed
           ]} 
           onPress={toggleBottomSheet}
           activeOpacity={0.8}
         >
           <View style={styles.handleBar} />
         </TouchableOpacity>

         {/* Search Bar / Header */}
         <TouchableOpacity 
           style={[
             styles.searchBarContainer,
             isBottomSheetExpanded ? styles.searchBarContainerExpanded : styles.searchBarContainerCollapsed
           ]} 
           onPress={() => {
             if (!isBottomSheetExpanded) {
               expandBottomSheet();
             }
             setTimeout(() => {
               textInputRef.current?.focus();
             }, 100);
           }}
           activeOpacity={1}
         >
           <LiquidGlassContainer borderRadius={16} intensity="high" style={styles.searchBarGlass}>
             <View style={styles.searchBar}>
               <TextInput
                 ref={textInputRef}
                 style={styles.searchInput}
                 placeholder={processingStatus === 'completed' ? "Ask a question about this episode..." : "Processing episode... Chat will be available soon."}
                 placeholderTextColor="rgba(255, 255, 255, 0.6)"
                 value={newMessage}
                 onChangeText={setNewMessage}
                 onFocus={processingStatus === 'completed' ? expandBottomSheet : undefined}
                 multiline={false}
                 returnKeyType="send"
                 onSubmitEditing={processingStatus === 'completed' ? handleSendMessage : undefined}
                 autoCorrect={false}
                 autoCapitalize="none"
                 editable={processingStatus === 'completed'}
               />
               {newMessage.trim() && (
                 <TouchableOpacity 
                   onPress={handleSendMessage}
                   style={styles.sendIconButton}
                   activeOpacity={0.7}
                 >
                   <View style={styles.sendIconContainer}>
                     <Text style={styles.sendIconArrow}>↑</Text>
                   </View>
                 </TouchableOpacity>
               )}
             </View>
           </LiquidGlassContainer>
         </TouchableOpacity>

         {/* Expanded Content - ChatGPT Style */}
         {isBottomSheetExpanded && (
           <ScrollView 
             ref={scrollViewRef}
             style={styles.conversationContainer}
             showsVerticalScrollIndicator={false}
             bounces={true}
           >
             {/* Group questions with their responses */}
             {messages.filter(m => m.type === 'question').map((question, index) => {
               const response = messages.find(m => m.type === 'response' && parseInt(m.id) === parseInt(question.id) + 1);
               return (
                 <View key={question.id} style={styles.conversationPair}>
                   {/* Question Container */}
                   <View style={styles.questionContainer}>
                     <LiquidGlassContainer borderRadius={25} intensity="medium" style={styles.questionGlass}>
                       <Text style={styles.questionText}>{question.content}</Text>
                     </LiquidGlassContainer>
                   </View>
                   
                   {/* Response Container */}
                   {response && (
                     <View style={styles.responseContainer}>
                       <LiquidGlassContainer borderRadius={16} intensity="low" style={styles.responseGlass}>
                         <View style={styles.responseHeader}>
                           <View style={styles.hostAvatar}>
                             <Text style={styles.hostInitial}>
                               {response.hostVoice === 'Joe Rogan' ? 'J' : 'L'}
                             </Text>
                           </View>
                           <Text style={styles.hostName}>{response.hostVoice}</Text>
                         </View>
                         <Text style={styles.responseText}>{response.content}</Text>
                       </LiquidGlassContainer>
                     </View>
                   )}
                 </View>
               );
             })}
           </ScrollView>
         )}
         </View>
         </LiquidGlassContainer>
       </View>
       </View>
     </Animated.View>
     </>
   );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  waveformSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    fontStyle: 'italic',
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
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  episodeCard: {
    marginBottom: 20,
    padding: 20,
  },
  episodeHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  episodeThumbnail: {
    fontSize: 40,
    marginRight: 16,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 6,
    lineHeight: 26,
  },
  episodeChannel: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  episodeHosts: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  episodeDuration: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 3,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  controlButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownContainer: {
    marginBottom: 20,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    minHeight: 80,
    width: '100%',
    borderRadius: 28,
  },
  dropdownButtonText: {
    textAlign: 'center',
    marginBottom: 0,
    fontSize: 22,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  dropdownContent: {
    padding: 16,
    paddingTop: 8,
    gap: 8,
  },
  contentCard: {
    padding: 20,
  },
  conversationContent: {
    gap: 16,
  },
  messagesContainer: {
    gap: 12,
    marginBottom: 20,
  },
  messageWrapper: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  messageContainer: {
    padding: 16,
    marginVertical: 2,
  },
  questionMessage: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(59, 130, 246, 0.6)',
    borderRadius: 16,
  },
  responseMessage: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(34, 197, 94, 0.6)',
    borderRadius: 16,
  },
  messageContent: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 8,
    fontWeight: '400',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  hostVoice: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
    fontWeight: '600',
  },
  playAudioButton: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  playAudioText: {
    fontSize: 14,
  },
  chatInputContainer: {
    padding: 16,
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sendButton: {
    padding: 8,
  },
  sendIcon: {
    fontSize: 16,
  },
  overviewContent: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  coloredTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  coloredTagText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Bottom Sheet styles
  bottomSheet: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 2,
  },
  bottomSheetGlass: {
    flex: 1,
  },
  bottomSheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    minHeight: 100,
  },
  bottomSheetContentCollapsed: {
    justifyContent: 'center',
  },
  bottomSheetContentExpanded: {
    justifyContent: 'flex-start',
  },
  bottomSheetHandle: {
    alignItems: 'center',
  },
  bottomSheetHandleCollapsed: {
    paddingVertical: 6,
  },
  bottomSheetHandleExpanded: {
    paddingVertical: 4,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 2,
  },
  searchBarContainer: {
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  searchBarContainerCollapsed: {
    marginBottom: 12,
    marginTop: 12,
    flex: 1,
  },
  searchBarContainerExpanded: {
    marginBottom: 8,
    marginTop: 4,
    flex: 0,
  },
  searchBarGlass: {
    justifyContent: 'center',
    minHeight: 56,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    paddingRight: 8,
  },
  searchIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconText: {
    fontSize: 16,
  },
  sendIconButton: {
    padding: 4,
  },
  sendIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  sendIconArrow: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  // ChatGPT Style Conversation Layout
  conversationContainer: {
    padding: 16,
    paddingBottom: 32,
    maxHeight: 500,
  },
  conversationPair: {
    marginBottom: 20,
  },
  questionContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  questionGlass: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  responseContainer: {
    alignItems: 'flex-start',
  },
  responseGlass: {
    padding: 16,
    width: '100%',
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hostAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hostInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hostName: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  responseText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  bottomSheetFooter: {
    alignItems: 'flex-end',
  },
  // Bottom Sheet Container styles
  bottomSheetContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'visible',
  },
  bottomSheetBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    zIndex: 1,
  },
  bottomSheetOverlay: {
    flex: 1,
    borderRadius: 20,
  },
  bottomSheetContentLayer: {
    flex: 1,
    zIndex: 2,
    position: 'relative',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  chatButtonContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  chatButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  chatButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  processingText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  processingSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  completedContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  completedText: {
    fontSize: 18,
    color: 'rgba(34, 197, 94, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  completedSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  failedContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  failedText: {
    fontSize: 18,
    color: 'rgba(236, 72, 153, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  failedSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 8,
  },
});