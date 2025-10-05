/**
 * ScribbleText Component
 * Text component with comic/handwritten font styling
 */
import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ScribbleTextProps {
  children: React.ReactNode;
  variant?: 'comic' | 'handwritten';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | 'xxl' | 'xxxl';
  weight?: 'light' | 'regular' | 'bold';
  color?: string;
  style?: TextStyle;
}

export const ScribbleText: React.FC<ScribbleTextProps> = ({
  children,
  variant = 'comic',
  size = 'base',
  weight = 'regular',
  color,
  style,
}) => {
  const theme = useTheme();

  const fontFamily = variant === 'handwritten'
    ? theme.typography.families.handwritten
    : weight === 'bold'
      ? theme.typography.families.comicBold
      : theme.typography.families.comic;

  const textStyle: TextStyle = {
    fontFamily,
    fontSize: theme.typography.sizes[size],
    lineHeight: theme.typography.sizes[size] * theme.typography.lineHeights.normal,
    color: color || theme.colors.text.primary,
    letterSpacing: 0.3, // Slightly wider for comic effect
  };

  return <Text style={[textStyle, style]}>{children}</Text>;
};

interface ScribbleHeadingProps extends Omit<ScribbleTextProps, 'size'> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export const ScribbleHeading: React.FC<ScribbleHeadingProps> = ({
  level,
  children,
  ...props
}) => {
  const sizeMap = {
    1: 'xxxl' as const,
    2: 'xxl' as const,
    3: 'xl' as const,
    4: 'lg' as const,
    5: 'base' as const,
    6: 'sm' as const,
  };

  return (
    <ScribbleText
      size={sizeMap[level]}
      weight="bold"
      {...props}
    >
      {children}
    </ScribbleText>
  );
};
