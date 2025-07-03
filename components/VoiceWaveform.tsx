import React from 'react';
import { View } from 'react-native';

interface VoiceWaveformProps {
  isActive: boolean;
  height?: number;
  width?: number;
  color?: string;
}

export function VoiceWaveform({ 
  isActive, 
  height = 40, 
  width = 80, 
  color = '#4F46E5' 
}: VoiceWaveformProps) {
  const barHeights = [0.3, 0.6, 1, 0.8, 0.4]; // Static heights

  return (
    <View 
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width,
        height,
      }}
    >
      {barHeights.map((heightRatio, index) => (
        <View
          key={index}
          style={{
            width: 6,
            height: height * (isActive ? heightRatio : 0.3),
            backgroundColor: color,
            borderRadius: 3,
            opacity: 0.8,
          }}
        />
      ))}
    </View>
  );
} 