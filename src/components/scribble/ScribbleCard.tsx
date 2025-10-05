/**
 * ScribbleCard Component
 * A card with hand-drawn scribble borders and cartoon styling
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { ScribbleBorder } from './ScribbleBorder';

interface ScribbleCardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'flat' | 'outlined';
  color?: string;
  style?: ViewStyle;
  animate?: boolean;
}

export const ScribbleCard: React.FC<ScribbleCardProps> = ({
  children,
  variant = 'elevated',
  color,
  style,
  animate = false,
}) => {
  const theme = useTheme();
  const wobbleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animate) {
      // Subtle wobble animation for hand-drawn effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(wobbleAnim, {
            toValue: 1,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(wobbleAnim, {
            toValue: 0,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animate, wobbleAnim]);

  const rotation = wobbleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-0.5deg', '0.5deg'],
  });

  const borderColor = color || theme.colors.text.primary;
  const backgroundColor = theme.colors.background.elevated;

  const cardStyle: any = [
    styles.card,
    {
      backgroundColor,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.md,
    },
    variant === 'elevated' && {
      ...theme.shadows.lg,
    },
    animate && {
      transform: [{ rotate: rotation }],
    },
    style,
  ];

  const innerContentStyle: ViewStyle = {
    padding: 18,
    overflow: 'hidden', // Prevent any child overflow
    zIndex: 1,
  };

  return (
    <Animated.View style={cardStyle}>
      <View style={innerContentStyle}>
        {children}
      </View>
      {/* Scribble border overlay */}
      <View style={styles.borderContainer} pointerEvents="none">
        <ScribbleBorder
          color={borderColor}
          strokeWidth={2.5}
          roughness={2.5}
          borderRadius={16}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden', // Clip to rounded corners
    position: 'relative',
  },
  borderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    pointerEvents: 'none',
  },
});
