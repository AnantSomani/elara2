import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface EnhancedLiquidGlassProps {
  children: React.ReactNode;
  borderRadius?: number;
  style?: ViewStyle;
  intensity?: 'low' | 'medium' | 'high' | 'ultra';
  tint?: 'light' | 'dark' | 'default';
  selected?: boolean;
  glowEffect?: boolean;
}

export function EnhancedLiquidGlass({
  children,
  borderRadius = 16,
  style,
  intensity = 'medium',
  tint = 'light',
  selected = false,
  glowEffect = false,
}: EnhancedLiquidGlassProps) {
  const getIntensityConfig = () => {
    switch (intensity) {
      case 'low':
        return {
          blurIntensity: 15,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          shadowOpacity: 0.1,
        };
      case 'medium':
        return {
          blurIntensity: 25,
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          shadowOpacity: 0.15,
        };
      case 'high':
        return {
          blurIntensity: 35,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderColor: 'rgba(255, 255, 255, 0.25)',
          shadowOpacity: 0.2,
        };
      case 'ultra':
        return {
          blurIntensity: 50,
          backgroundColor: 'rgba(255, 255, 255, 0.18)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          shadowOpacity: 0.25,
        };
      default:
        return {
          blurIntensity: 25,
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          shadowOpacity: 0.15,
        };
    }
  };

  const config = getIntensityConfig();

  // Enhanced styling for selected state
  const selectedStyle = selected ? {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(255, 255, 255, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  } : {};

  // Glow effect styling
  const glowStyle = glowEffect ? {
    shadowColor: 'rgba(255, 255, 255, 0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  } : {};

  return (
    <BlurView
      intensity={config.blurIntensity}
      tint={tint}
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          borderRadius,
          shadowColor: 'rgba(255, 255, 255, 0.2)',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: config.shadowOpacity,
          shadowRadius: 15,
          elevation: 8,
        },
        selectedStyle,
        glowStyle,
        style,
      ]}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
  },
}); 