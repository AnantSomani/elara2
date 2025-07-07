import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, SafeAreaView, StatusBar, TextInput, KeyboardAvoidingView, Platform, Animated, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { BlurView } from 'expo-blur';
import VoiceWaveform from '../../components/VoiceWaveform';
import SimpleView from '../../components/TestGlass';
import { LiquidGlassContainer } from '../../components/LiquidGlassContainer';
import { LiquidGlassButton } from '../../components/LiquidGlassButton';
import { EpisodeDropdown } from '../../components/EpisodeDropdown';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const BOTTOM_SHEET_MIN_HEIGHT = 100;
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.7;

// Mock data for the episode
const MOCK_EPISODE = {
  id: 'episode-1',
  title: 'The Future of AI and Human Consciousness',
  channel: 'The Joe Rogan Experience',
  hosts: ['Joe Rogan', 'Lex Fridman'],
  duration: '3:24:15',
  description: 'A deep dive into artificial intelligence, consciousness, and the future of humanity with leading AI researcher Lex Fridman.',
  audioUrl: 'https://example.com/audio.mp3',
  thumbnail: '🎧',
  publishedDate: '2024-01-15',
  tags: ['AI', 'Consciousness', 'Technology', 'Philosophy', 'Ethics'],
  status: 'watching',
  progress: 0.35,
  watchedDuration: '1:12:25',
  lastWatched: '2 hours ago',
  conversationCount: 3,
};

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
  const { episode: episodeParam, view } = useLocalSearchParams<{ episode: string; view?: string }>();

  const [bottomSheetHeight] = useState(new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT));
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(MOCK_CHAT_MESSAGES);
  const [currentSpeaker, setCurrentSpeaker] = useState('Chamath');
  const textInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleBackPress = () => {
    router.back();
  };

  const handleHomePress = () => {
    router.replace('/');
  };

  const handlePlayPause = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    // Simulate audio loading
    setTimeout(() => {
      setIsPlaying(!isPlaying);
      setIsLoading(false);
      
      // Simulate audio progress updates
      if (!isPlaying) {
        const interval = setInterval(() => {
          setAudioPosition(prev => {
            const newPosition = prev + 1;
            if (newPosition >= audioDuration) {
              clearInterval(interval);
              setIsPlaying(false);
              return 0;
            }
            return newPosition;
          });
        }, 1000);
      }
    }, 500);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newQuestion = {
        id: `${Date.now()}`,
        type: 'question' as const,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };
      
      // Add the question immediately
      setMessages(prev => [...prev, newQuestion]);
      setNewMessage('');
      
      // Scroll to bottom after adding question
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Simulate AI response after a short delay
      setTimeout(() => {
        const selectedHost = MOCK_EPISODE.hosts[Math.floor(Math.random() * MOCK_EPISODE.hosts.length)];
        let responseContent = '';
        
        // Generate response based on the host's personality
        if (selectedHost === 'Joe Rogan') {
          responseContent = `That's a great question! You know, when I think about "${newQuestion.content}", it really makes me wonder about the bigger picture here. Like, have you ever considered how this connects to everything else we've been talking about? It's wild how these complex topics all seem to tie together. I mean, this stuff keeps me up at night thinking about it. What do you think, Lex?`;
        } else {
          responseContent = `That's a beautiful question about "${newQuestion.content}". When I think about this deeply, I believe there are multiple layers to consider here. The fundamental challenge is that we're dealing with systems of incredible complexity, and yet there's an elegant simplicity underneath it all. From an engineering perspective, we can approach this systematically, but we must also acknowledge the profound philosophical implications. It's fascinating how these questions push us to the boundaries of human understanding.`;
        }
        
        const response = {
          id: `${Date.now()}-response`,
          type: 'response' as const,
          content: responseContent,
          timestamp: new Date().toISOString(),
          audioUrl: 'https://example.com/response.mp3',
          hostVoice: selectedHost,
        };
        setMessages(prev => [...prev, response]);
        
        // Scroll to bottom after adding response
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 1500);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getProgressWidth = () => {
    return MOCK_EPISODE.progress;
  };

  // Function to get the current speaker based on the latest conversation
  const getCurrentSpeaker = () => {
    const lastResponse = messages.slice().reverse().find(msg => msg.type === 'response' && msg.hostVoice);
    if (lastResponse && 'hostVoice' in lastResponse) {
      return lastResponse.hostVoice || MOCK_EPISODE.hosts[0];
    }
    return MOCK_EPISODE.hosts[0]; // Default to first host
  };

  // Update current speaker when messages change
  React.useEffect(() => {
    setCurrentSpeaker(getCurrentSpeaker());
  }, [messages]);

  // Initialize audio duration from mock episode
  React.useEffect(() => {
    const durationInSeconds = 3 * 60 + 24; // 3:24:15 converted to seconds
    setAudioDuration(durationInSeconds);
  }, []);

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
          <VoiceWaveform 
            hostName={currentSpeaker}
            isActive={isWaveformActive}
            isPaused={isPlaying && !isWaveformActive}
            intensity="ultra"
            size={160}
            audioLevel={isWaveformActive ? 0.7 : 0.3}
          />
          {isLoading && (
            <Text style={styles.loadingText}>Loading audio...</Text>
          )}
        </View>

        {/* Episode Info Card */}
        <SimpleView intensity="high" borderRadius={20} style={styles.episodeCard}>
          <View style={styles.episodeHeader}>
            <Text style={styles.episodeThumbnail}>{MOCK_EPISODE.thumbnail}</Text>
            <View style={styles.episodeInfo}>
              <Text style={styles.episodeTitle}>{MOCK_EPISODE.title}</Text>
              <Text style={styles.episodeChannel}>{MOCK_EPISODE.channel}</Text>
              <Text style={styles.episodeHosts}>with {MOCK_EPISODE.hosts.join(', ')}</Text>
              <Text style={styles.episodeDuration}>{MOCK_EPISODE.duration}</Text>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {MOCK_EPISODE.watchedDuration} of {MOCK_EPISODE.duration}
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(MOCK_EPISODE.progress * 100)}% complete
              </Text>
            </View>
                         <View style={styles.progressBarContainer}>
               <View style={styles.progressBarBackground}>
                 <View style={[styles.progressBarFill, { width: `${getProgressWidth() * 100}%` }]} />
               </View>
             </View>
          </View>


        </SimpleView>

        {/* Episode Dropdown */}
        <EpisodeDropdown 
          episode={MOCK_EPISODE}
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
                 placeholder="Ask a question about this episode..."
                 placeholderTextColor="rgba(255, 255, 255, 0.6)"
                 value={newMessage}
                 onChangeText={setNewMessage}
                 onFocus={expandBottomSheet}
                 multiline={false}
                 returnKeyType="send"
                 onSubmitEditing={handleSendMessage}
                 autoCorrect={false}
                 autoCapitalize="none"
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
     backButton: {
     width: 44,
     height: 44,
     alignItems: 'center',
     justifyContent: 'center',
   },
   backButtonText: {
     fontSize: 24,
     color: 'rgba(255, 255, 255, 0.9)',
     fontWeight: '400',
     textAlign: 'center',
     lineHeight: 24,
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
}); 