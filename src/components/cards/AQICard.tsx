import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, CardHeader, CardContent } from '../ui/Card';
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
        <Text style={styles.title}>Air Quality Index</Text>
        <Text style={styles.location}>{data.location.city}</Text>
      </CardHeader>

      <CardContent style={styles.content}>
        <View style={styles.aqiContainer}>
          <View style={[styles.aqiIndicator, { backgroundColor: color }]}>
            <Text style={styles.aqiValue}>{data.aqi}</Text>
          </View>
          <View style={styles.aqiInfo}>
            <Text style={[styles.aqiLabel, { color }]}>{label}</Text>
            <Text style={styles.timestamp}>
              Updated {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        {data.dominantPollutant && (
          <View style={styles.dominantPollutant}>
            <Text style={styles.dominantLabel}>Dominant Pollutant</Text>
            <Text style={styles.dominantValue}>{data.dominantPollutant.toUpperCase()}</Text>
          </View>
        )}
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  location: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
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
    width: 90,
    height: 90,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.xl,
    ...theme.shadows.md,
  },
  aqiValue: {
    fontSize: 40,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.inverse,
    letterSpacing: -1,
  },
  aqiInfo: {
    flex: 1,
  },
  aqiLabel: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.regular,
    marginBottom: theme.spacing.xs,
  },
  timestamp: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.muted,
  },
  dominantPollutant: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  dominantLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
  },
  dominantValue: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
  },
});
