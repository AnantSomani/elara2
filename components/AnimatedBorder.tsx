import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedBorderProps {
  children: React.ReactNode;
  borderRadius?: number;
  borderWidth?: number;
  style?: ViewStyle;
}

export function AnimatedBorder({ 
  children, 
  borderRadius = 16, 
  borderWidth = 2,
  style 
}: AnimatedBorderProps) {
  const rotationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotationValue, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [rotationValue]);

  const rotationInterpolate = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.borderContainer,
          {
            borderRadius: borderRadius + borderWidth,
            transform: [{ rotate: rotationInterpolate }],
          },
        ]}
      >
        <LinearGradient
          colors={['#8B5CF6', '#EC4899', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradientBorder,
            { borderRadius: borderRadius + borderWidth },
          ]}
        />
      </Animated.View>
      
      <View 
        style={[
          styles.content,
          { 
            borderRadius,
            margin: borderWidth,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  borderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientBorder: {
    flex: 1,
  },
  content: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    flex: 1,
    overflow: 'hidden',
  },
}); 