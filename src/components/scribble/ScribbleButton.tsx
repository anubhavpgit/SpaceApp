/**
 * ScribbleButton Component
 * A button with cartoon/comic styling and hand-drawn borders
 */
import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { ScribbleText } from './ScribbleText';
import { ScribbleBorder } from './ScribbleBorder';

interface ScribbleButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
}

export const ScribbleButton: React.FC<ScribbleButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
}) => {
  const theme = useTheme();
  const [pressed, setPressed] = useState(false);

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.overlay.medium;

    switch (variant) {
      case 'primary':
        return theme.colors.accent.primary;
      case 'secondary':
        return theme.colors.accent.secondary;
      case 'outline':
        return 'transparent';
      default:
        return theme.colors.accent.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.text.muted;

    switch (variant) {
      case 'outline':
        return theme.colors.accent.primary;
      default:
        return theme.colors.text.inverse;
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.colors.border.light;
    return variant === 'outline' ? theme.colors.accent.primary : theme.colors.text.primary;
  };

  const sizeStyles = {
    sm: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 'sm' as const },
    md: { paddingHorizontal: 24, paddingVertical: 12, fontSize: 'base' as const },
    lg: { paddingHorizontal: 32, paddingVertical: 16, fontSize: 'lg' as const },
  };

  const buttonStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    paddingHorizontal: sizeStyles[size].paddingHorizontal,
    paddingVertical: sizeStyles[size].paddingVertical,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
    transform: pressed ? [{ scale: 0.97 }] : [{ scale: 1 }],
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.button, buttonStyle, style]}
    >
      <ScribbleText
        variant="comic"
        size={sizeStyles[size].fontSize}
        weight="bold"
        color={getTextColor()}
        style={styles.text}
      >
        {children}
      </ScribbleText>

      {/* Scribble border */}
      <View style={styles.border} pointerEvents="none">
        <ScribbleBorder
          color={getBorderColor()}
          strokeWidth={2.5}
          roughness={2.5}
          borderRadius={theme.borderRadius.md}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    zIndex: 2,
    textAlign: 'center',
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
