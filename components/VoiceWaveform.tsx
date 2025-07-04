import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';

interface VoiceWaveformProps {
  hostName?: string;
  isActive?: boolean;
  intensity?: 'low' | 'medium' | 'high' | 'ultra';
  size?: number;
  audioLevel?: number; // 0-1 for real audio levels
  isPaused?: boolean;
}

const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  hostName = 'Chamath',
  isActive = false,
  intensity = 'medium',
  size = 140,
  audioLevel = 0.5,
  isPaused = false
}) => {
  const animationValues = useRef(
    Array.from({ length: 16 }, () => new Animated.Value(0.3))
  ).current;

  const containerSize = size;
  const center = containerSize / 2;
  const radius = (containerSize / 2) - 20;

  const getIntensityStyles = () => {
    const intensityMap = {
      low: { blur: 15, opacity: 0.08 },
      medium: { blur: 25, opacity: 0.12 },
      high: { blur: 35, opacity: 0.15 },
      ultra: { blur: 50, opacity: 0.18 }
    };
    return intensityMap[intensity];
  };

  const intensityStyle = getIntensityStyles();

  useEffect(() => {
    if (isActive && !isPaused) {
      // Create animated waveform effect with audio level influence
      const animations = animationValues.map((animValue, index) => {
        const baseIntensity = 0.4 + (audioLevel * 0.6);
        const randomVariation = 0.2 + (Math.random() * 0.3);
        
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: baseIntensity + randomVariation,
              duration: 120 + (index * 15),
              useNativeDriver: false,
            }),
            Animated.timing(animValue, {
              toValue: 0.2 + (audioLevel * 0.3),
              duration: 180 + (index * 10),
              useNativeDriver: false,
            }),
          ]),
          { iterations: -1 }
        );
      });

      Animated.stagger(30, animations).start();
    } else if (isPaused) {
      // Paused state - gentle pulsing
      const pausedAnimations = animationValues.map((animValue, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 0.4,
              duration: 800 + (index * 50),
              useNativeDriver: false,
            }),
            Animated.timing(animValue, {
              toValue: 0.2,
              duration: 800 + (index * 50),
              useNativeDriver: false,
            }),
          ]),
          { iterations: -1 }
        );
      });
      Animated.stagger(100, pausedAnimations).start();
    } else {
      // Return to idle state
      const idleAnimations = animationValues.map((animValue) =>
        Animated.timing(animValue, {
          toValue: 0.2,
          duration: 400,
          useNativeDriver: false,
        })
      );
      Animated.parallel(idleAnimations).start();
    }
  }, [isActive, isPaused, audioLevel]);

  const renderWaveformBars = () => {
    return animationValues.map((animValue, index) => {
      const angle = (index * 360) / animationValues.length;
      const angleInRadians = (angle * Math.PI) / 180;
      
      const barX = center + Math.cos(angleInRadians) * radius;
      const barY = center + Math.sin(angleInRadians) * radius;
      
      return (
        <Animated.View
          key={index}
          style={[
            styles.waveformBar,
            {
              position: 'absolute',
              left: barX - 2,
              top: barY - 10,
              height: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 28],
              }),
              transform: [
                {
                  rotate: `${angle + 90}deg`,
                },
              ],
              opacity: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 0.9],
              }),
            },
          ]}
        />
      );
    });
  };

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      {/* Glass Container */}
      <BlurView
        intensity={intensityStyle.blur}
        style={[
          styles.glassContainer,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
          }
        ]}
      >
        <View 
          style={[
            styles.innerContainer,
            {
              backgroundColor: `rgba(255, 255, 255, ${intensityStyle.opacity})`,
              width: containerSize,
              height: containerSize,
              borderRadius: containerSize / 2,
              borderWidth: 2,
              borderColor: `rgba(255, 255, 255, ${isActive ? 0.4 : 0.2})`,
            }
          ]}
        >
          {/* Waveform Bars */}
          <View style={styles.waveformContainer}>
            {renderWaveformBars()}
          </View>

          {/* Host Name in Center */}
          <View style={styles.centerContent}>
            <Text style={styles.hostName}>{hostName}</Text>
            <View style={[
              styles.statusIndicator,
              { 
                backgroundColor: isActive && !isPaused ? '#FFA500' : 
                                isPaused ? '#FFD700' : 'rgba(255, 255, 255, 0.4)' 
              }
            ]} />
            {isPaused && (
              <Text style={styles.pauseIndicator}>⏸</Text>
            )}
          </View>
        </View>
      </BlurView>

      {/* Glow Effect when Active */}
      {isActive && (
        <View
          style={[
            styles.glowEffect,
            {
              width: containerSize + 20,
              height: containerSize + 20,
              borderRadius: (containerSize + 20) / 2,
            }
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glassContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  waveformContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  waveformBar: {
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2,
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  pauseIndicator: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  glowEffect: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    zIndex: -1,
  },
});

export default VoiceWaveform; 