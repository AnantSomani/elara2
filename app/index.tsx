import React from 'react';
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
import VoiceWaveform from '../components/VoiceWaveform';

const { width, height } = Dimensions.get('window');

export default function HomePage() {
  const [isVoiceActive, setIsVoiceActive] = React.useState(false);

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
          <View 
            style={[
              { borderRadius: 80, padding: 20 }, 
              styles.voiceButton
            ]}
          >
            <TouchableOpacity
              onPress={handleVoiceToggle}
              style={styles.voiceButtonInner}
              activeOpacity={0.8}
            >
              <VoiceWaveform 
                isActive={isVoiceActive} 
                height={60} 
                width={120}
                color="rgba(255, 255, 255, 0.9)"
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.voiceHint}>
            {isVoiceActive ? 'Listening...' : 'Tap to speak'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <View 
            style={[
              { borderRadius: 20, marginBottom: 16 }, 
              styles.actionButton
            ]}
          >
            <GlassButton
              title="Continue Podcasts"
              onPress={handleContinuePodcasts}
              variant="primary"
              size="lg"
            />
          </View>

          <View 
            style={[
              { borderRadius: 20, marginBottom: 16 }, 
              styles.actionButton
            ]}
          >
            <GlassButton
              title="Add from YouTube"
              onPress={handleYouTubeMode}
              variant="secondary"
              size="lg"
            />
          </View>
        </View>

        {/* Chat with Friends Panel */}
        <View 
          style={[
            { borderRadius: 24, padding: 20 }, 
            styles.chatPanelContainer
          ]}
        >
          <View style={styles.chatPanel}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Chat with Friends</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
              <View 
                style={[
                  { borderRadius: 25, padding: 8 }, 
                  styles.notificationButton
                ]}
              >
                <TouchableOpacity 
                  onPress={handleChatWithFriends}
                  style={styles.notificationButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.notificationEmoji}>💬</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
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
  voiceButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonInner: {
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
  actionButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  chatPanelContainer: {
    // TestGlass will handle styling
  },
  chatPanel: {
    padding: 24,
    minHeight: 120,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  badge: {
    position: 'relative',
    marginRight: 16,
  },
  notificationButton: {
    padding: 0,
  },
  notificationEmoji: {
    fontSize: 24,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
}); 