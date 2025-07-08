import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import VoiceWaveform from './VoiceWaveform';

interface PlayableWaveformProps {
  isPlaying: boolean;
  isLoading?: boolean;
  onTogglePlayback: () => void;
  barCount?: number;
  size?: number;
  color?: string;
}

const PlayableWaveform: React.FC<PlayableWaveformProps> = ({
  isPlaying,
  isLoading = false,
  onTogglePlayback,
  barCount = 20,
  size = 60,
  color = 'rgba(80,120,255,0.92)',
}) => {
  // Debug prop changes
  useEffect(() => {
    console.log('🎵 PlayableWaveform received props:', { isPlaying, isLoading });
  }, [isPlaying, isLoading]);

  const handlePress = () => {
    console.log('🎵 PlayableWaveform: Button pressed!');
    console.log('🎵 Current state before toggle:', { isPlaying, isLoading });
    onTogglePlayback();
  };



  return (
    <TouchableOpacity
      style={[styles.container, isLoading && styles.disabled]}
      onPress={handlePress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <VoiceWaveform
        isActive={isPlaying}
        isPaused={!isPlaying && !isLoading}
        barCount={barCount}
        size={size}
        color={isLoading ? 'rgba(80,120,255,0.4)' : color}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default PlayableWaveform; 