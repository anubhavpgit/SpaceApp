/**
 * Animated Data View Component
 * Provides subtle fade/slide animations when data updates
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';

interface AnimatedDataViewProps {
  children: React.ReactNode;
  data: any;
  style?: ViewStyle;
  animationType?: 'fade' | 'slide' | 'fade-slide';
  duration?: number;
}

/**
 * Wrapper component that animates content when data changes
 * Uses subtle transitions for a polished UX
 */
export const AnimatedDataView: React.FC<AnimatedDataViewProps> = ({
  children,
  data,
  style,
  animationType = 'fade',
  duration = 300,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const previousData = useRef(data);

  useEffect(() => {
    // Check if data actually changed
    if (JSON.stringify(previousData.current) === JSON.stringify(data)) {
      return;
    }

    console.log('[AnimatedDataView] Data changed, animating update');

    // Fade out
    const fadeOut = Animated.timing(fadeAnim, {
      toValue: 0.3,
      duration: duration / 2,
      useNativeDriver: true,
    });

    // Slide down slightly
    const slideDown = Animated.timing(slideAnim, {
      toValue: 5,
      duration: duration / 2,
      useNativeDriver: true,
    });

    // Fade in
    const fadeIn = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: duration / 2,
      useNativeDriver: true,
    });

    // Slide back up
    const slideUp = Animated.timing(slideAnim, {
      toValue: 0,
      duration: duration / 2,
      useNativeDriver: true,
    });

    // Execute animation based on type
    if (animationType === 'fade') {
      Animated.sequence([fadeOut, fadeIn]).start(() => {
        previousData.current = data;
      });
    } else if (animationType === 'slide') {
      Animated.sequence([slideDown, slideUp]).start(() => {
        previousData.current = data;
      });
    } else {
      // fade-slide: combine both animations
      Animated.parallel([fadeOut, slideDown]).start(() => {
        Animated.parallel([fadeIn, slideUp]).start(() => {
          previousData.current = data;
        });
      });
    }
  }, [data, fadeAnim, slideAnim, animationType, duration]);

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
