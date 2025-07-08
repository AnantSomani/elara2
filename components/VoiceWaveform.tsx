import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

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
  // Debug prop changes
  useEffect(() => {
    console.log('🌊 VoiceWaveform received props:', { isActive, isPaused, barCount });
  }, [isActive, isPaused]);
  // Create a play button triangle pattern for static/paused state
  const getStaticWaveformPattern = (barCount: number) => {
    const pattern = [];
    
    for (let i = 0; i < barCount; i++) {
      let height;
      
      // ████ PLAY BUTTON PATTERN BREAKDOWN ████
      
      if (i < 5) {
        // 📍 BARS 0-4: Small base bars (left side of play button)
        height = 0.1; // Small height
        
      } else if (i === 5) {
        // 📍 BAR 5: The peak bar (tip of play button triangle)
        height = 0.9; // Tall height - the triangle point
        
      } else if (i >= 6 && i <= 14) {
        // 📍 BARS 6-13: Gradual decline from peak (slope of play button)
        const declineSteps = 13 - 6 + 1; // 8 steps total
        const stepPosition = i - 6; // 0 to 7
        const declineProgress = stepPosition / (declineSteps - 1); // 0 to 1
        height = 0.9 - (declineProgress * 0.65); // From 90% down to 25%
        
      } else {
        // 📍 BARS 14+: Small base bars (right side, same as left)
        height = 0.1; // Small height, matching the left side
      }
      
      pattern.push(height);
    }
    
    return pattern;
  };

  // Regenerate pattern if barCount changes
  const staticPattern = useRef(getStaticWaveformPattern(barCount));
  if (staticPattern.current.length !== barCount) {
    staticPattern.current = getStaticWaveformPattern(barCount);
  }
  
  const animationValues = useRef(
    Array.from({ length: barCount }, (_, i) => new Animated.Value(staticPattern.current[i]))
  ).current;
  const animationRefs = useRef<(Animated.CompositeAnimation | null)[]>([]);

  useEffect(() => {
    // Helper to animate a single bar
    const animateBar = (val: Animated.Value, idx: number) => {
      if (isActive) {
        if (idx === 0) console.log('🔔 Starting IMMEDIATE oscillation from current positions');
        
        // 🔔 BELL CURVE TARGET HEIGHTS (for gradual migration)
        const center = (barCount - 1) / 2;
        const distance = Math.abs(idx - center);
        const normalized = distance / center;
        
        // Calculate bell curve target (where we eventually want to center)
        const bellCurveWeight = Math.max(1 - Math.pow(normalized, 1.5), 0.4);
        const bellCurveTarget = 0.4 + (bellCurveWeight * 0.3); // 40% to 70% range
        
        // ✨ PURE INDEPENDENT OSCILLATION: Completely disconnected from triangle pattern
        // Each bar gets its own oscillation range - no base height references
        
        if (idx === 0) console.log('🎯 Starting pure independent oscillation - NO base height references');
        
        // Create completely independent bell curve oscillation ranges
        const oscillationCenter = (barCount - 1) / 2;
        const oscillationDistance = Math.abs(idx - oscillationCenter);
        const oscillationNormalized = oscillationDistance / oscillationCenter;
        
        // Independent oscillation heights (completely ignore triangle pattern)
        const bellWeight = Math.max(1 - Math.pow(oscillationNormalized, 1.2), 0.3);
        const heightCenter = 0.35 + (bellWeight * 0.4); // 35% to 75% range
        const oscillationRange = 0.08; // 8% variation around center
        
        // Pure oscillation values - no triangle pattern involved
        const pureMax = heightCenter + oscillationRange;
        const pureMin = heightCenter - oscillationRange;
        
        // Random timing for chaos
        const randomDuration = 1500 + (Math.random() * 1000); // 1500-2500ms
        const randomDelay = Math.random() * 1500; // 0-1500ms start delay
        
        if (idx === 0 || idx === 5 || idx === 10) {
          console.log(`🔍 Bar ${idx}: PURE oscillation ${pureMin.toFixed(2)} to ${pureMax.toFixed(2)}, delay=${randomDelay}ms`);
        }
        
        // First: Immediately jump to a random point in the oscillation range
        const randomStartPoint = pureMin + (Math.random() * (pureMax - pureMin));
        val.setValue(randomStartPoint);
        
        // Then: Start pure oscillation with no pattern references
        const pureOscillation = Animated.sequence([
          Animated.timing(val, {
            toValue: pureMax,
            duration: randomDuration / 2,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.timing(val, {
            toValue: pureMin,
            duration: randomDuration / 2,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.sin),
          }),
        ]);
        
        // Start with random delay for organic feel
        setTimeout(() => {
          animationRefs.current[idx] = Animated.loop(pureOscillation);
          animationRefs.current[idx]?.start();
        }, randomDelay);
        
      } else if (isPaused) {
        if (idx === 0) console.log('🌊 Setting PAUSED static pattern for all bars');
        // Show static waveform pattern (no animation)
        animationRefs.current[idx]?.stop();
        Animated.timing(val, {
          toValue: staticPattern.current[idx],
          duration: 300,
          useNativeDriver: false,
        }).start();
      } else {
        if (idx === 0) console.log('🌊 Setting INACTIVE state for all bars');
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