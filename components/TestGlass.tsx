import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';

export interface SimpleViewProps {
  children?: React.ReactNode;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  intensity?: 'low' | 'medium' | 'high' | 'ultra';
  tint?: string;
  selected?: boolean;
  glowEffect?: boolean;
}

export default function SimpleView({
  children,
  borderRadius = 16,
  style,
  intensity = 'medium',
  tint = 'light',
  selected = false,
  glowEffect = false,
}: SimpleViewProps) {
  return <View style={[{ borderRadius }, style]}>{children}</View>;
} 