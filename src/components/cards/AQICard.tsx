import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { ScribbleText } from '../scribble/ScribbleText';
import { AQIReading } from '../../types/airQuality';
import { getAQIColor, getAQILabel, AQI_LABELS } from '../../constants/aqi';
import { theme } from '../../constants/theme';

interface AQICardProps {
  data: AQIReading;
}

export const AQICard: React.FC<AQICardProps> = ({ data }) => {
  const color = getAQIColor(data.category);
  const label = getAQILabel(data.category);

  return (
    <Card variant="elevated" style={styles.card}>
      <CardHeader>
        <ScribbleText size="xs" weight="bold" color={theme.colors.text.muted} style={styles.title}>
          AIR QUALITY INDEX
        </ScribbleText>
        <ScribbleText size="xxl" weight="regular" style={styles.location}>
          {data.location.city}
        </ScribbleText>
      </CardHeader>

      <CardContent style={styles.content}>
        <View style={styles.aqiContainer}>
          <View style={[styles.aqiIndicator, { backgroundColor: color }]}>
            <ScribbleText size="xxxl" weight="bold" color={theme.colors.text.inverse} style={styles.aqiValue}>
              {data.aqi}
            </ScribbleText>
          </View>
          <View style={styles.aqiInfo}>
            <ScribbleText size="lg" weight="regular" color={color} style={styles.aqiLabel}>
              {label}
            </ScribbleText>
            <ScribbleText size="sm" weight="regular" color={theme.colors.text.muted}>
              Updated {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </ScribbleText>
          </View>
        </View>

        {data.dominantPollutant && (
          <View style={styles.dominantPollutant}>
            <ScribbleText size="sm" color={theme.colors.text.tertiary}>
              Dominant Pollutant
            </ScribbleText>
            <ScribbleText size="base" weight="bold" color={theme.colors.text.primary}>
              {data.dominantPollutant.toUpperCase()}
            </ScribbleText>
          </View>
        )}
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    // marginBottom handled by Card wrapper
  },
  title: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: theme.spacing.sm,
  },
  location: {
    letterSpacing: -0.3,
  },
  content: {
    paddingTop: theme.spacing.xl,
  },
  aqiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  aqiIndicator: {
    width: 95,
    height: 95,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.xl,
    ...theme.shadows.md,
  },
  aqiValue: {
    letterSpacing: -0.5,
  },
  aqiInfo: {
    flex: 1,
  },
  aqiLabel: {
    marginBottom: theme.spacing.xs,
  },
  dominantPollutant: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    borderTopWidth: 2,
    borderTopColor: theme.colors.border.light,
  },
});
