import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { getAQIColor, getAQILabel } from '../../constants/aqi';
import { AQICategory } from '../../types/airQuality';
import { theme } from '../../constants/theme';

interface AQIGaugeProps {
  aqi: number;
  category: AQICategory;
  onPress?: () => void;
}

export const AQIGauge: React.FC<AQIGaugeProps> = ({ aqi, category, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Continuous pulse for unhealthy levels
    if (category === 'unhealthy' || category === 'very-unhealthy' || category === 'hazardous') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Subtle rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 60000,
        useNativeDriver: true,
      })
    ).start();
  }, [category]);

  const color = getAQIColor(category);
  const label = getAQILabel(category);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const aqiPercentage = Math.min((aqi / 500) * 100, 100);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.gaugeContainer,
          {
            transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
          },
        ]}
      >
        {/* Outer ring with rotation */}
        <Animated.View
          style={[
            styles.outerRing,
            {
              borderColor: color,
              transform: [{ rotate: rotation }],
            },
          ]}
        >
          {/* Gradient effect lines */}
          <View style={[styles.ringLine, { backgroundColor: color, opacity: 0.3 }]} />
          <View style={[styles.ringLine, styles.ringLine2, { backgroundColor: color, opacity: 0.3 }]} />
          <View style={[styles.ringLine, styles.ringLine3, { backgroundColor: color, opacity: 0.3 }]} />
          <View style={[styles.ringLine, styles.ringLine4, { backgroundColor: color, opacity: 0.3 }]} />
        </Animated.View>

        {/* Middle ring */}
        <View
          style={[
            styles.middleRing,
            { borderColor: color },
          ]}
        />

        {/* Inner circle with AQI value */}
        <View style={[styles.innerCircle, { backgroundColor: color }]}>
          <Text style={styles.aqiValue}>{aqi}</Text>
          <Text style={styles.aqiLabel}>AQI</Text>
        </View>

        {/* Progress arc overlay */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${aqiPercentage}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
      </Animated.View>

      <Text style={[styles.categoryLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    opacity: 0.3,
  },
  ringLine: {
    position: 'absolute',
    width: 1,
    height: 70,
    top: 0,
    left: '50%',
    marginLeft: -0.5,
  },
  ringLine2: {
    transform: [{ rotate: '90deg' }],
  },
  ringLine3: {
    transform: [{ rotate: '180deg' }],
  },
  ringLine4: {
    transform: [{ rotate: '270deg' }],
  },
  middleRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderStyle: 'solid',
    opacity: 0.2,
  },
  innerCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.xl,
  },
  aqiValue: {
    fontSize: 52,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.inverse,
    letterSpacing: -3,
  },
  aqiLabel: {
    fontSize: 11,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.inverse,
    letterSpacing: 2,
    marginTop: -2,
    opacity: 0.9,
  },
  progressContainer: {
    position: 'absolute',
    bottom: -10,
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  categoryLabel: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.light,
    marginTop: theme.spacing.xxxl,
    letterSpacing: 0.5,
  },
});
