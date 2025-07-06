import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface VoiceWaveformProps {
  isActive?: boolean;
  isPaused?: boolean;
  barCount?: number;
  size?: number;
  color?: string;
}

const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  isActive = false,
  isPaused = false,
  barCount = 20,
  size = 60,
  color = 'rgba(80,120,255,0.92)',
}) => {
  const animationValues = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.2))
  ).current;
  const animationRefs = useRef<(Animated.CompositeAnimation | null)[]>([]);

  useEffect(() => {
    // Helper to animate a single bar
    const animateBar = (val: Animated.Value, idx: number) => {
      if (isActive) {
        // Animate height with randomization, slower
        const max = 0.7 + Math.random() * 0.3;
        const min = 0.2 + Math.random() * 0.1;
        const upDuration = 500 + Math.random() * 300;
        const downDuration = 500 + Math.random() * 300;
        const sequence = Animated.sequence([
          Animated.timing(val, {
            toValue: max,
            duration: upDuration,
            useNativeDriver: false,
          }),
          Animated.timing(val, {
            toValue: min,
            duration: downDuration,
            useNativeDriver: false,
          }),
        ]);
        animationRefs.current[idx] = Animated.loop(sequence);
        animationRefs.current[idx]?.start();
      } else if (isPaused) {
        // Gentle pulse
        const pulseMax = 0.4 + Math.random() * 0.2;
        const pulseMin = 0.2 + Math.random() * 0.1;
        const pulseDuration = 900 + Math.random() * 300;
        const sequence = Animated.sequence([
          Animated.timing(val, {
            toValue: pulseMax,
            duration: pulseDuration,
            useNativeDriver: false,
          }),
          Animated.timing(val, {
            toValue: pulseMin,
            duration: pulseDuration,
            useNativeDriver: false,
          }),
        ]);
        animationRefs.current[idx] = Animated.loop(sequence);
        animationRefs.current[idx]?.start();
      } else {
        // Inactive: reset to minimal height
        animationRefs.current[idx]?.stop();
        Animated.timing(val, {
          toValue: 0.2,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    };

    animationValues.forEach((val, idx) => {
      animationRefs.current[idx]?.stop();
      animateBar(val, idx);
    });

    // Cleanup on unmount
    return () => {
      animationRefs.current.forEach((ref) => ref?.stop());
    };
  }, [isActive, isPaused, barCount]);

  // Calculate bar width and total waveform width
  const barWidth = size / (barCount * 1.2);
  const spacing = 3;
  const totalWidth = barCount * barWidth + (barCount - 1) * spacing;

  return (
    <View style={[styles.waveformRow, { height: size, width: totalWidth, alignSelf: 'center' }]}> 
      {animationValues.map((val, i) => {
        const animatedHeight = val.interpolate({
          inputRange: [0, 1],
          outputRange: [size * 0.15, size],
        });
        const animatedMarginTop = Animated.multiply(animatedHeight, -0.5);
        return (
          <Animated.View
            key={i}
            style={[
              styles.bar,
              {
                backgroundColor: color,
                width: barWidth,
                height: animatedHeight,
                position: 'absolute',
                left: i * (barWidth + spacing),
                top: '50%',
                marginTop: animatedMarginTop,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  waveformRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center', // center vertically
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    overflow: 'visible',
  },
  bar: {
    borderRadius: 2.5,
    backgroundColor: 'rgba(80,120,255,0.92)',
    marginRight: 0,
  },
});

export default VoiceWaveform; 