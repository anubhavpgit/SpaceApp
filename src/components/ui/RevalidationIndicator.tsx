/**
 * Revalidation Indicator Component
 * Subtle indicator when SWR is revalidating data in the background
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface RevalidationIndicatorProps {
  isValidating: boolean;
  lastUpdated?: Date | null;
  isPullRefreshing?: boolean;
}

/**
 * Displays a subtle indicator when data is being revalidated
 * Shows timestamp of last update when not validating
 */
export const RevalidationIndicator: React.FC<RevalidationIndicatorProps> = ({
  isValidating,
  lastUpdated,
  isPullRefreshing = false,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [showTimestamp, setShowTimestamp] = React.useState(true);

  useEffect(() => {
    // Only show spinner for background revalidation, not pull-to-refresh
    if (isValidating && !isPullRefreshing) {
      // Fade in and start rotation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ),
      ]).start();
    } else {
      // Fade out and stop rotation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      rotateAnim.setValue(0);
    }
  }, [isValidating, isPullRefreshing, fadeAnim, rotateAnim]);

  // Hide timestamp after 5 seconds
  useEffect(() => {
    if (!isValidating && lastUpdated) {
      setShowTimestamp(true);
      const timeout = setTimeout(() => {
        setShowTimestamp(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isValidating, lastUpdated]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const formatLastUpdated = (date: Date | null | undefined) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      {isValidating && !isPullRefreshing && (
        <Animated.View
          style={[
            styles.indicator,
            {
              opacity: fadeAnim,
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <View style={styles.spinner} />
        </Animated.View>
      )}
      {!isValidating && lastUpdated && showTimestamp && (
        <Text style={styles.timestamp}>
          Updated {formatLastUpdated(lastUpdated)}
        </Text>
      )}
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 0,
      marginBottom: theme.spacing.xs,
    },
    indicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    spinner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.colors.text.tertiary,
      borderTopColor: 'transparent',
    },
    timestamp: {
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.text.tertiary,
      fontWeight: theme.typography.weights.light,
    },
  });
