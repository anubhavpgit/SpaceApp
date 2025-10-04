import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { AQICategory } from '../../types/airQuality';

const { width } = Dimensions.get('window');

interface SmokeOverlayProps {
  category: AQICategory;
  intensity?: number; // 0-1
}

export const SmokeOverlay: React.FC<SmokeOverlayProps> = ({
  category,
  intensity = 0.5,
}) => {
  const opacity1 = useRef(new Animated.Value(0.3)).current;
  const opacity2 = useRef(new Animated.Value(0.2)).current;
  const opacity3 = useRef(new Animated.Value(0.4)).current;

  const translateY1 = useRef(new Animated.Value(0)).current;
  const translateY2 = useRef(new Animated.Value(0)).current;
  const translateY3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const maxOpacity1 = 0.5 * intensity;
    const minOpacity1 = 0.2 * intensity;
    const maxOpacity2 = 0.4 * intensity;
    const minOpacity2 = 0.15 * intensity;
    const maxOpacity3 = 0.6 * intensity;
    const minOpacity3 = 0.25 * intensity;

    const animate = () => {
      Animated.parallel([
        // Layer 1
        Animated.loop(
          Animated.sequence([
            Animated.timing(opacity1, {
              toValue: maxOpacity1,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity1, {
              toValue: minOpacity1,
              duration: 3000,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.timing(translateY1, {
            toValue: -100,
            duration: 20000,
            useNativeDriver: true,
          })
        ),

        // Layer 2
        Animated.loop(
          Animated.sequence([
            Animated.timing(opacity2, {
              toValue: maxOpacity2,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity2, {
              toValue: minOpacity2,
              duration: 4000,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.timing(translateY2, {
            toValue: -150,
            duration: 25000,
            useNativeDriver: true,
          })
        ),

        // Layer 3
        Animated.loop(
          Animated.sequence([
            Animated.timing(opacity3, {
              toValue: maxOpacity3,
              duration: 3500,
              useNativeDriver: true,
            }),
            Animated.timing(opacity3, {
              toValue: minOpacity3,
              duration: 3500,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.timing(translateY3, {
            toValue: -120,
            duration: 22000,
            useNativeDriver: true,
          })
        ),
      ]).start();
    };

    animate();
  }, [intensity]);

  const getSmokeColor = () => {
    switch (category) {
      case 'good':
        return 'rgba(200, 200, 200, 0.1)';
      case 'moderate':
        return 'rgba(180, 180, 180, 0.15)';
      case 'unhealthy-sensitive':
        return 'rgba(150, 150, 150, 0.25)';
      case 'unhealthy':
        return 'rgba(120, 120, 120, 0.35)';
      case 'very-unhealthy':
        return 'rgba(80, 80, 80, 0.45)';
      case 'hazardous':
        return 'rgba(50, 50, 50, 0.6)';
      default:
        return 'rgba(150, 150, 150, 0.2)';
    }
  };

  const baseColor = getSmokeColor();

  if (category === 'good') {
    return null; // No smoke overlay for good air quality
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.smokeLayer,
          {
            opacity: opacity1,
            transform: [{ translateY: translateY1 }],
            backgroundColor: baseColor,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.smokeLayer,
          {
            opacity: opacity2,
            transform: [{ translateY: translateY2 }],
            backgroundColor: baseColor,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.smokeLayer,
          {
            opacity: opacity3,
            transform: [{ translateY: translateY3 }],
            backgroundColor: baseColor,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  smokeLayer: {
    position: 'absolute',
    width: width * 1.5,
    height: 300,
    borderRadius: 9999,
    left: -width * 0.25,
  },
});
