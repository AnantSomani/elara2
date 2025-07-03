import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LiquidGlassContainerProps {
  children: React.ReactNode;
  borderRadius?: number;
  style?: ViewStyle;
  intensity?: 'low' | 'medium' | 'high';
  iridescent?: boolean;
}

export function LiquidGlassContainer({
  children,
  borderRadius = 16,
  style,
  intensity = 'medium',
  iridescent = false,
}: LiquidGlassContainerProps) {
  const getIntensityStyles = () => {
    switch (intensity) {
      case 'low':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderColor: 'rgba(255, 255, 255, 0.15)',
        };
      case 'medium':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderColor: 'rgba(255, 255, 255, 0.25)',
        };
      case 'high':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.22)',
          borderColor: 'rgba(255, 255, 255, 0.35)',
        };
      default:
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderColor: 'rgba(255, 255, 255, 0.25)',
        };
    }
  };

  const intensityStyles = getIntensityStyles();

  if (iridescent) {
    return (
      <View style={[styles.container, { borderRadius: borderRadius + 1 }, style]}>
        {/* Iridescent border */}
        <LinearGradient
          colors={[
            'rgba(139, 92, 246, 0.6)', // Purple
            'rgba(236, 72, 153, 0.6)', // Pink
            'rgba(59, 130, 246, 0.6)', // Blue
            'rgba(34, 197, 94, 0.6)',  // Green
            'rgba(139, 92, 246, 0.6)', // Purple (loop)
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.iridescentBorder,
            { borderRadius: borderRadius + 1 },
          ]}
        />
        
        {/* Content container */}
        <View
          style={[
            styles.content,
            {
              backgroundColor: intensityStyles.backgroundColor,
              borderRadius,
              shadowColor: 'rgba(255, 255, 255, 0.3)',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 12,
            },
          ]}
        >
          {children}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.defaultContainer,
        {
          backgroundColor: intensityStyles.backgroundColor,
          borderColor: intensityStyles.borderColor,
          borderRadius,
          shadowColor: 'rgba(255, 255, 255, 0.2)',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 15,
          elevation: 8,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  iridescentBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 1,
  },
  content: {
    flex: 1,
    margin: 1,
    overflow: 'hidden',
  },
  defaultContainer: {
    borderWidth: 1,
    overflow: 'hidden',
  },
}); 