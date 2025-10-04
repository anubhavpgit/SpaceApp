import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { ForecastItem } from '../../types/airQuality';
import { getAQIColor } from '../../constants/aqi';
import { useTheme } from '../../hooks/useTheme';

interface ScrubbingTimelineProps {
  forecasts: ForecastItem[];
  onScrub?: (forecast: ForecastItem, index: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMELINE_WIDTH = SCREEN_WIDTH - 64;

export const ScrubbingTimeline: React.FC<ScrubbingTimelineProps> = ({
  forecasts,
  onScrub,
}) => {
  const theme = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const pan = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        const index = Math.round(
          (gestureState.moveX - 32) / (TIMELINE_WIDTH / forecasts.length)
        );
        const clampedIndex = Math.max(0, Math.min(forecasts.length - 1, index));

        if (clampedIndex !== selectedIndex) {
          setSelectedIndex(clampedIndex);
          onScrub?.(forecasts[clampedIndex], clampedIndex);
        }

        pan.setValue(gestureState.moveX - 32);
      },
      onPanResponderRelease: () => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const selectedForecast = forecasts[selectedIndex];
  const color = getAQIColor(selectedForecast.category);
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Current Selection Display */}
      <View style={styles.currentDisplay}>
        <Animated.View
          style={[
            styles.currentAQI,
            { backgroundColor: color, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.currentAQIValue}>{selectedForecast.aqi}</Text>
        </Animated.View>
        <View style={styles.currentInfo}>
          <Text style={styles.currentTime}>
            {new Date(selectedForecast.timestamp).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
          {selectedForecast.temperature && (
            <Text style={styles.currentTemp}>
              {Math.round(selectedForecast.temperature)}°C
            </Text>
          )}
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.timeline} {...panResponder.panHandlers}>
        {/* Background bars */}
        <View style={styles.barsContainer}>
          {forecasts.map((forecast, index) => {
            const height = (forecast.aqi / 500) * 100;
            const barColor = getAQIColor(forecast.category);
            const isSelected = index === selectedIndex;

            return (
              <View key={index} style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(height, 20),
                      backgroundColor: isSelected ? barColor : theme.colors.border.medium,
                      opacity: isSelected ? 1 : 0.4,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>

        {/* Time labels */}
        <View style={styles.labelsContainer}>
          {forecasts.map((forecast, index) => {
            if (index % 3 !== 0) return null;

            return (
              <Text key={index} style={styles.timeLabel}>
                {new Date(forecast.timestamp).toLocaleTimeString([], {
                  hour: 'numeric',
                })}
              </Text>
            );
          })}
        </View>

        {/* Scrubbing indicator - hidden, using bar highlight instead */}
      </View>

      {/* Instruction text */}
      <Text style={styles.instruction}>← Swipe to explore forecast →</Text>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.lg,
  },
  currentDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  currentAQI: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  currentAQIValue: {
    fontSize: 28,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.inverse,
  },
  currentInfo: {
    marginLeft: theme.spacing.lg,
  },
  currentTime: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  currentTemp: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.secondary,
  },
  timeline: {
    height: 140,
    marginHorizontal: theme.spacing.lg,
    position: 'relative',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    justifyContent: 'space-between',
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  bar: {
    width: '100%',
    borderRadius: 2,
    minHeight: 20,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  timeLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.tertiary,
  },
  indicator: {
    position: 'absolute',
    bottom: 30,
    width: 3,
    height: 120,
    borderRadius: 2,
  },
  instruction: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.muted,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    letterSpacing: 1,
  },
});
