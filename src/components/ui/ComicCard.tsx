/**
 * ComicCard Component
 * A completely rewritten card component with comic/cartoon styling
 * No native borders - only hand-drawn scribble borders
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { ScribbleBorder } from '../scribble/ScribbleBorder';

interface ComicCardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'flat';
  style?: ViewStyle;
  backgroundColor?: string;
}

export const ComicCard: React.FC<ComicCardProps> = ({
  children,
  variant = 'flat',
  style,
  backgroundColor,
}) => {
  const theme = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: backgroundColor || theme.colors.background.elevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    overflow: 'hidden',
    ...(variant === 'elevated' ? theme.shadows.lg : {}),
  };

  return (
    <View style={[styles.wrapper, style]}>
      {/* The actual card content */}
      <View style={cardStyle}>
        {children}
      </View>

      {/* Hand-drawn scribble border overlay */}
      <View style={styles.scribbleContainer} pointerEvents="none">
        <ScribbleBorder
          color={theme.colors.text.primary}
          strokeWidth={2.5}
          roughness={2.5}
          borderRadius={theme.borderRadius.lg}
        />
      </View>
    </View>
  );
};

interface ComicCardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ComicCardHeader: React.FC<ComicCardHeaderProps> = ({ children, style }) => {
  const theme = useTheme();
  return (
    <View style={[styles.header, { paddingBottom: theme.spacing.md }, style]}>
      {children}
    </View>
  );
};

interface ComicCardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ComicCardContent: React.FC<ComicCardContentProps> = ({ children, style }) => {
  const theme = useTheme();
  return (
    <View style={[styles.content, { paddingVertical: theme.spacing.md }, style]}>
      {children}
    </View>
  );
};

interface ComicCardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ComicCardFooter: React.FC<ComicCardFooterProps> = ({ children, style }) => {
  const theme = useTheme();
  return (
    <View style={[styles.footer, { paddingTop: theme.spacing.md }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  scribbleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    // No additional styles needed - padding comes from theme
  },
  content: {
    // No additional styles needed - padding comes from theme
  },
  footer: {
    // No additional styles needed - padding comes from theme
  },
});
