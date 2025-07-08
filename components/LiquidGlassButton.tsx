import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface LiquidGlassButtonProps {
  children: React.ReactNode;
  borderRadius?: number;
  style?: ViewStyle;
  intensity?: 'low' | 'medium' | 'high';
  iridescent?: boolean;
}

export function LiquidGlassButton({
  children,
  borderRadius = 16,
  style,
  intensity = 'medium',
  iridescent = false,
}: LiquidGlassButtonProps) {
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
        {/* Blur background */}
        <BlurView
          intensity={20}
          style={[
            styles.blurContainer,
            { borderRadius: borderRadius + 1 },
          ]}
        />
        
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
            styles.buttonContent,
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
          <View style={styles.contentWrapper}>
            {children}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderRadius }, style]}>
      {/* Blur background */}
      <BlurView
        intensity={20}
        style={[
          styles.blurContainer,
          { borderRadius },
        ]}
      />
      
      {/* Content overlay */}
      <View
        style={[
          styles.buttonOverlay,
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
        ]}
      >
        <View style={styles.contentWrapper}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    borderWidth: 1,
  },
  buttonContent: {
    flex: 1,
    margin: 1,
    overflow: 'hidden',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  iridescentBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 1,
  },
}); 