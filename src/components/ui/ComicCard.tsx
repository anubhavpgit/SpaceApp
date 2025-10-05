/**
 * ComicCard Component
 * A completely rewritten card component with comic/cartoon styling
 * No native borders - only hand-drawn scribble borders
 * Uses MaskedView to clip content precisely to scribble border shape
 */
import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { useTheme } from '../../hooks/useTheme';
import { ScribbleBorder } from '../scribble/ScribbleBorder';
import { ScribbleMask } from '../scribble/ScribbleMask';

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

  // Generate a deterministic seed based on component position/time
  // This ensures mask and border use the same scribble path
  const scribbleSeed = useMemo(() => Math.floor(Math.random() * 10000), []);

  const cardStyle: ViewStyle = {
    backgroundColor: backgroundColor || theme.colors.background.elevated,
    borderRadius: theme.borderRadius.lg,
    ...(variant === 'elevated' ? theme.shadows.lg : {}),
  };

  const innerContentStyle: ViewStyle = {
    padding: theme.spacing.lg,
  };

  return (
    <View style={[styles.wrapper, style]}>
      {/* MaskedView clips content to scribble shape */}
      <MaskedView
        style={styles.maskedContainer}
        maskElement={
          <ScribbleMask
            roughness={2.5}
            borderRadius={theme.borderRadius.lg}
            seed={scribbleSeed}
          />
        }
      >
        {/* The actual card content - will be clipped to mask */}
        <View style={cardStyle}>
          <View style={innerContentStyle}>
            {children}
          </View>
        </View>
      </MaskedView>

      {/* Hand-drawn scribble border overlay - uses same seed for perfect alignment */}
      <View style={styles.scribbleContainer} pointerEvents="none">
        <ScribbleBorder
          color={theme.colors.text.primary}
          strokeWidth={2.5}
          roughness={2.5}
          borderRadius={theme.borderRadius.lg}
          seed={scribbleSeed}
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
  },
  maskedContainer: {
    flex: 1,
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
