import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { GlassButton } from '../components/GlassButton';
import { VoiceWaveform } from '../components/VoiceWaveform';
import { EnhancedLiquidGlass } from '../components/EnhancedLiquidGlass';

const { width, height } = Dimensions.get('window');

export default function HomePage() {
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const handleVoiceToggle = () => {
    setIsVoiceActive(!isVoiceActive);
  };

  const handleHomePress = () => {
    // Navigate to homepage (refresh current page)
    router.replace('/');
  };

  const handleContinuePodcasts = () => {
    // Navigate to continue podcasts page
    router.push('/continue');
  };

  const handleYouTubeMode = () => {
    // Navigate to YouTube input mode
    router.push('/youtube');
  };

  const handleChatWithFriends = () => {
    // Navigate to chat feature (mock for now)
    console.log('Chat with friends pressed');
    // router.push('/chat'); // Will implement later
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
          <TouchableOpacity onPress={handleHomePress}>
            <Text style={styles.logoText}>Elara</Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>Your AI Podcast Companion</Text>
            </View>

        {/* Main Voice Interface */}
        <View style={styles.voiceContainer}>
          <EnhancedLiquidGlass 
            borderRadius={80} 
            intensity="ultra"
            tint="light"
            glowEffect={isVoiceActive}
            style={styles.voiceButtonContainer}
          >
            <TouchableOpacity 
              style={styles.voiceButton}
              onPress={handleVoiceToggle}
              activeOpacity={0.8}
            >
              <VoiceWaveform 
                isActive={isVoiceActive} 
                height={60} 
                width={120}
                color="rgba(255, 255, 255, 0.9)"
              />
            </TouchableOpacity>
          </EnhancedLiquidGlass>
          
          <Text style={styles.voiceHint}>
            {isVoiceActive ? 'Listening...' : 'Tap to speak'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <EnhancedLiquidGlass 
            borderRadius={20} 
            intensity="high"
            tint="light"
            style={styles.buttonContainer}
          >
            <GlassButton
              title="Continue Podcasts"
              onPress={handleContinuePodcasts}
              variant="primary"
              size="lg"
              style={styles.actionButton}
              icon={
                <View style={styles.buttonIcon}>
                  <Text style={styles.iconText}>▶</Text>
                </View>
              }
            />
          </EnhancedLiquidGlass>

          <EnhancedLiquidGlass 
            borderRadius={20} 
            intensity="high"
            tint="light"
            style={styles.buttonContainer}
          >
            <GlassButton
              title="Add from YouTube"
              onPress={handleYouTubeMode}
              variant="secondary"
              size="lg"
              style={styles.actionButton}
              icon={
                <View style={styles.buttonIcon}>
                  <Text style={styles.iconText}>📺</Text>
                </View>
              }
            />
          </EnhancedLiquidGlass>
        </View>

        {/* Chat with Friends Panel */}
        <EnhancedLiquidGlass 
          borderRadius={24} 
          intensity="ultra"
          tint="light"
          style={styles.chatPanelContainer}
        >
          <TouchableOpacity 
            style={styles.chatPanel}
            onPress={handleChatWithFriends}
            activeOpacity={0.8}
          >
            <Text style={styles.chatTitle}>Chat with Friends</Text>
            
            <View style={styles.chatContent}>
              <View style={styles.notificationWidget}>
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
                <EnhancedLiquidGlass 
                  borderRadius={25} 
                  intensity="medium"
                  tint="light"
                  style={styles.notificationIconContainer}
              >
                  <View style={styles.notificationIcon}>
                    <Text style={styles.notificationEmoji}>💬</Text>
            </View>
                </EnhancedLiquidGlass>
          </View>

              <View style={styles.chatInfo}>
                <Text style={styles.chatDescription}>
                  Share podcast moments and discuss with your community
                </Text>
                <View style={styles.onlineIndicator}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>5 friends online</Text>
        </View>
      </View>
    </View>
          </TouchableOpacity>
        </EnhancedLiquidGlass>
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
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'Brush Script MT',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '300',
    letterSpacing: 1,
  },
  voiceContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  voiceButtonContainer: {
    padding: 0,
  },
  voiceButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceHint: {
    marginTop: 20,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '300',
  },
  actionContainer: {
    marginBottom: 40,
    gap: 16,
  },
  buttonContainer: {
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  chatPanelContainer: {
    // EnhancedLiquidGlass will handle styling
  },
  chatPanel: {
    padding: 24,
    minHeight: 120,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationWidget: {
    position: 'relative',
    marginRight: 16,
  },
  notificationIconContainer: {
    padding: 0,
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationEmoji: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EC4899',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  chatInfo: {
    flex: 1,
  },
  chatDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 8,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  onlineText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
}); 