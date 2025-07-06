import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  View, 
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface GlassButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function GlassButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  style,
  textStyle,
}: GlassButtonProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          fontSize: 14,
        };
      case 'md':
        return {
          paddingHorizontal: 24,
          paddingVertical: 12,
          fontSize: 16,
        };
      case 'lg':
        return {
          paddingHorizontal: 32,
          paddingVertical: 16,
          fontSize: 20,
        };
      default:
        return {
          paddingHorizontal: 24,
          paddingVertical: 12,
          fontSize: 16,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const buttonStyle = [
    styles.baseButton,
    {
      paddingHorizontal: sizeStyles.paddingHorizontal,
      paddingVertical: sizeStyles.paddingVertical,
    },
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.baseText,
    {
      fontSize: (textStyle && textStyle.fontSize) ? textStyle.fontSize : sizeStyles.fontSize,
      color: disabled ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.95)',
    },
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={textStyles}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 60,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
}); 