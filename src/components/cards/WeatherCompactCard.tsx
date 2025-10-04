import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, CardContent } from '../ui/Card';
import { WeatherData } from '../../types/airQuality';
import { useTheme } from '../../hooks/useTheme';

interface WeatherCompactCardProps {
  weather: WeatherData;
}

export const WeatherCompactCard: React.FC<WeatherCompactCardProps> = ({ weather }) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <Card variant="elevated" style={styles.card}>
      <CardContent style={styles.content}>
        <Text style={styles.label}>WEATHER</Text>
        <Text style={styles.temperature}>{Math.round(weather.temperature)}°</Text>
        <Text style={styles.conditions}>{weather.conditions}</Text>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Wind</Text>
            <Text style={styles.detailValue}>{Math.round(weather.windSpeed)} km/h</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Humidity</Text>
            <Text style={styles.detailValue}>{Math.round(weather.humidity)}%</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  card: {
    flex: 1,
  },
  content: {
    paddingVertical: theme.spacing.xl,
  },
  label: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.md,
  },
  temperature: {
    fontSize: 48,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    letterSpacing: -2,
    lineHeight: 52,
  },
  conditions: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  details: {
    marginTop: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
  },
  detailValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
});
