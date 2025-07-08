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
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { GlassButton } from '../components/GlassButton';
import VoiceWaveform from '../components/VoiceWaveform';
import { LiquidGlassButton } from '../components/LiquidGlassButton';

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
            <Text style={styles.elaraLogoGlow}>elara</Text>
          </TouchableOpacity>
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
                size={120}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <LiquidGlassButton borderRadius={28} intensity="high" style={{ marginBottom: 40, minHeight: 80, justifyContent: 'center', alignItems: 'center' }}>
          <Pressable
            style={({ pressed }) => [
              {
                alignItems: 'center',
                justifyContent: 'center',
                padding: 12,
                minHeight: 80,
                width: '100%',
                backgroundColor: pressed ? 'rgba(30,30,30,0.5)' : 'transparent',
                borderRadius: 28,
              },
            ]}
            onPress={handleContinuePodcasts}
          >
            <Text style={[styles.chatTitle, { textAlign: 'center', marginBottom: 0, fontSize: 26 }]}>Continue Podcasts</Text>
          </Pressable>
        </LiquidGlassButton>
        <LiquidGlassButton borderRadius={28} intensity="high" style={{ marginBottom: 24, minHeight: 80, justifyContent: 'center', alignItems: 'center' }}>
          <Pressable
            style={({ pressed }) => [
              {
                alignItems: 'center',
                justifyContent: 'center',
                padding: 12,
                minHeight: 80,
                width: '100%',
                backgroundColor: pressed ? 'rgba(30,30,30,0.5)' : 'transparent',
                borderRadius: 28,
              },
            ]}
            onPress={handleYouTubeMode}
          >
            <Text style={[styles.chatTitle, { textAlign: 'center', marginBottom: 0, fontSize: 26 }]}>Add from YouTube</Text>
          </Pressable>
        </LiquidGlassButton>

        {/* Chat with Friends Panel */}
        <LiquidGlassButton borderRadius={28} intensity="high" style={{ padding: 12, marginTop: 16, minHeight: 80, justifyContent: 'center', alignItems: 'center' }}>
          <View style={[styles.chatPanel, { alignItems: 'center', justifyContent: 'center', padding: 0, minHeight: 80 }]}> 
            <Text style={[styles.chatTitle, { textAlign: 'center', marginBottom: 0, fontSize: 26 }]}>Chat with Friends</Text>
          </View>
        </LiquidGlassButton>
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
    alignItems: 'center',
    marginBottom: 20,
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