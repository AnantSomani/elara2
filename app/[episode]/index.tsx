import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, SafeAreaView, StatusBar, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { BlurView } from 'expo-blur';

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
  tags: ['AI', 'Consciousness', 'Technology', 'Philosophy'],
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
    content: 'Lex discussed how consciousness in AI systems remains one of the most profound mysteries in science. He explained that while we can create systems that exhibit intelligent behavior, the question of whether they experience subjective consciousness - what philosophers call "qualia" - is still hotly debated. He mentioned that consciousness might emerge from complex information processing, but we lack clear metrics to measure it.',
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
    content: 'Joe expressed both fascination and concern about AI consciousness. He wondered if we\'re already creating conscious entities without realizing it, and discussed the ethical implications of potentially creating digital beings that can suffer or experience joy. He emphasized the importance of approaching this development with caution and responsibility.',
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
    content: 'They covered several practical applications including AI assistants that can truly understand context and emotion, educational systems that adapt to individual learning styles, and AI companions for elderly care. Lex highlighted the potential for AI to help solve climate change and space exploration challenges, while Joe focused on the human-AI collaboration possibilities in creative fields.',
    timestamp: '2024-01-15T11:00:25Z',
    audioUrl: 'https://example.com/response3.mp3',
    hostVoice: 'Lex Fridman',
  },
];

// Enhanced Liquid Glass Component
interface EnhancedLiquidGlassProps {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high' | 'ultra';
  borderRadius?: number;
  style?: any;
  selected?: boolean;
  glowEffect?: boolean;
}

const EnhancedLiquidGlass: React.FC<EnhancedLiquidGlassProps> = ({ 
  children, 
  intensity = 'medium', 
  borderRadius = 16, 
  style,
  selected = false,
  glowEffect = false
}) => {
  const getBlurAmount = () => {
    switch (intensity) {
      case 'low': return 15;
      case 'medium': return 25;
      case 'high': return 35;
      case 'ultra': return 50;
      default: return 25;
    }
  };

  const getOpacity = () => {
    if (selected) {
      switch (intensity) {
        case 'low': return 0.12;
        case 'medium': return 0.16;
        case 'high': return 0.20;
        case 'ultra': return 0.24;
        default: return 0.16;
      }
    }
    switch (intensity) {
      case 'low': return 0.08;
      case 'medium': return 0.12;
      case 'high': return 0.15;
      case 'ultra': return 0.18;
      default: return 0.12;
    }
  };

  return (
    <View style={[
      {
        borderRadius,
        overflow: 'hidden',
        backgroundColor: `rgba(255, 255, 255, ${getOpacity()})`,
        borderWidth: 1,
        borderColor: selected ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: glowEffect ? 0.3 : 0.1,
        shadowRadius: glowEffect ? 20 : 12,
        elevation: 8,
      },
      style
    ]}>
      <BlurView intensity={getBlurAmount()} style={{ flex: 1 }}>
        {children}
      </BlurView>
    </View>
  );
};

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
  const [activeTab, setActiveTab] = useState<'overview' | 'conversation'>(view === 'conversation' ? 'conversation' : 'overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(MOCK_CHAT_MESSAGES);

  const handleBackPress = () => {
    router.back();
  };

  const handleHomePress = () => {
    router.replace('/');
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
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
      
      // Simulate AI response after a short delay
      setTimeout(() => {
        const response = {
          id: `${Date.now()}-response`,
          type: 'response' as const,
          content: `Thanks for your question: "${newQuestion.content}". This is a mock response - in the full app, this would be an AI-generated answer based on the podcast content.`,
          timestamp: new Date().toISOString(),
          audioUrl: 'https://example.com/response.mp3',
          hostVoice: MOCK_EPISODE.hosts[Math.floor(Math.random() * MOCK_EPISODE.hosts.length)],
        };
        setMessages(prev => [...prev, response]);
      }, 1500);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getProgressWidth = () => {
    return MOCK_EPISODE.progress;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress}>
            <EnhancedLiquidGlass intensity="medium" borderRadius={12} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </EnhancedLiquidGlass>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleHomePress}>
            <Text style={styles.elaraTitle}>Elara</Text>
          </TouchableOpacity>
          
          <View style={{ width: 44 }} />
        </View>

        {/* Episode Info Card */}
        <EnhancedLiquidGlass intensity="high" borderRadius={20} style={styles.episodeCard}>
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

          {/* Player Controls */}
          <View style={styles.playerControls}>
            <EnhancedLiquidGlass intensity="medium" borderRadius={12} style={styles.controlButton}>
              <GlassButton
                title="⏮"
                onPress={() => console.log('Previous')}
                variant="secondary"
                size="sm"
              />
            </EnhancedLiquidGlass>
            
            <EnhancedLiquidGlass intensity="ultra" borderRadius={16} glowEffect style={styles.playButton}>
              <GlassButton
                title={isPlaying ? '⏸' : '▶️'}
                onPress={handlePlayPause}
                variant="primary"
                size="lg"
              />
            </EnhancedLiquidGlass>
            
            <EnhancedLiquidGlass intensity="medium" borderRadius={12} style={styles.controlButton}>
              <GlassButton
                title="⏭"
                onPress={() => console.log('Next')}
                variant="secondary"
                size="sm"
              />
            </EnhancedLiquidGlass>
          </View>
        </EnhancedLiquidGlass>

        {/* Tab Navigation */}
        <EnhancedLiquidGlass intensity="medium" borderRadius={16} style={styles.tabContainer}>
          <View style={styles.tabButtons}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab('overview')}
            >
              <EnhancedLiquidGlass
                intensity={activeTab === 'overview' ? 'high' : 'low'}
                borderRadius={12}
                selected={activeTab === 'overview'}
                style={styles.tabButton}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === 'overview' && styles.activeTabText
                ]}>
                  Overview
                </Text>
              </EnhancedLiquidGlass>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab('conversation')}
            >
              <EnhancedLiquidGlass
                intensity={activeTab === 'conversation' ? 'high' : 'low'}
                borderRadius={12}
                selected={activeTab === 'conversation'}
                style={styles.tabButton}
              >
                                 <Text style={[
                   styles.tabText,
                   activeTab === 'conversation' && styles.activeTabText
                 ]}>
                   💬 Conversation ({Math.ceil(messages.filter(m => m.type === 'question').length)})
                 </Text>
              </EnhancedLiquidGlass>
            </TouchableOpacity>
          </View>
        </EnhancedLiquidGlass>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <EnhancedLiquidGlass intensity="high" borderRadius={20} style={styles.contentCard}>
            <View style={styles.overviewContent}>
              <Text style={styles.sectionTitle}>About This Episode</Text>
              <Text style={styles.description}>{MOCK_EPISODE.description}</Text>
              
              <Text style={styles.sectionTitle}>Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Published:</Text>
                <Text style={styles.detailValue}>{new Date(MOCK_EPISODE.publishedDate).toLocaleDateString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.detailValue}>{MOCK_EPISODE.status === 'watching' ? 'In Progress' : MOCK_EPISODE.status}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Watched:</Text>
                <Text style={styles.detailValue}>{MOCK_EPISODE.lastWatched}</Text>
              </View>
              
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {MOCK_EPISODE.tags.map((tag, index) => (
                  <EnhancedLiquidGlass key={index} intensity="low" borderRadius={8} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </EnhancedLiquidGlass>
                ))}
              </View>
            </View>
          </EnhancedLiquidGlass>
        ) : (
          <EnhancedLiquidGlass intensity="high" borderRadius={20} style={styles.contentCard}>
            <View style={styles.conversationContent}>
              <Text style={styles.sectionTitle}>Your Conversation</Text>
              
                             {/* Chat Messages */}
               <View style={styles.messagesContainer}>
                 {messages.map((message) => (
                  <View key={message.id} style={styles.messageWrapper}>
                    <EnhancedLiquidGlass
                      intensity={message.type === 'question' ? 'medium' : 'low'}
                      borderRadius={16}
                      style={[
                        styles.messageContainer,
                        message.type === 'question' ? styles.questionMessage : styles.responseMessage
                      ]}
                    >
                      <Text style={styles.messageContent}>{message.content}</Text>
                      <View style={styles.messageFooter}>
                        <Text style={styles.messageTime}>
                          {formatTimestamp(message.timestamp)}
                        </Text>
                        {message.type === 'response' && message.hostVoice && (
                          <>
                            <Text style={styles.hostVoice}>• {message.hostVoice}</Text>
                            <TouchableOpacity style={styles.playAudioButton}>
                              <Text style={styles.playAudioText}>🔊</Text>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </EnhancedLiquidGlass>
                  </View>
                ))}
              </View>

                             {/* Chat Input */}
               <EnhancedLiquidGlass intensity="medium" borderRadius={16} style={styles.chatInputContainer}>
                 <View style={styles.chatInput}>
                   <TextInput
                     style={styles.textInput}
                     value={newMessage}
                     onChangeText={setNewMessage}
                     placeholder="Ask a question about this episode..."
                     placeholderTextColor="rgba(255, 255, 255, 0.6)"
                     multiline
                     textAlignVertical="top"
                     returnKeyType="send"
                     onSubmitEditing={handleSendMessage}
                     blurOnSubmit={false}
                   />
                   <EnhancedLiquidGlass intensity="high" borderRadius={12} glowEffect style={styles.sendButton}>
                     <GlassButton
                       title="Send"
                       onPress={handleSendMessage}
                       variant="primary"
                       size="sm"
                       icon={<Text style={styles.sendIcon}>💭</Text>}
                     />
                   </EnhancedLiquidGlass>
                 </View>
               </EnhancedLiquidGlass>
            </View>
          </EnhancedLiquidGlass>
                 )}
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
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  elaraTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'Brush Script MT',
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
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
  tabContainer: {
    marginBottom: 20,
    padding: 6,
  },
  tabButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  tab: {
    flex: 1,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  activeTabText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
  },
  contentCard: {
    padding: 20,
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
    paddingVertical: 8,
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
  conversationContent: {
    gap: 16,
  },
  messagesContainer: {
    gap: 16,
  },
  messageWrapper: {
    marginBottom: 8,
  },
  messageContainer: {
    padding: 16,
  },
  questionMessage: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  responseMessage: {
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  messageContent: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: 8,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  hostVoice: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  playAudioButton: {
    marginLeft: 'auto',
  },
  playAudioText: {
    fontSize: 16,
  },
  chatInputContainer: {
    marginTop: 16,
    padding: 12,
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
     textInput: {
     flex: 1,
     fontSize: 16,
     color: 'rgba(255, 255, 255, 0.9)',
     paddingVertical: 12,
     paddingHorizontal: 8,
     maxHeight: 100,
     minHeight: 44,
   },
  sendButton: {
    paddingHorizontal: 4,
  },
  sendIcon: {
    fontSize: 16,
  },
}); 