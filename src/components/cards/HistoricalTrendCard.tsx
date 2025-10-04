import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, CardContent } from '../ui/Card';
import { AQIReading } from '../../types/airQuality';
import { getAQIColor } from '../../constants/aqi';
import { useTheme } from '../../hooks/useTheme';

interface HistoricalTrendCardProps {
  readings: AQIReading[];
  period: '24h' | '7d' | '30d';
}

export const HistoricalTrendCard: React.FC<HistoricalTrendCardProps> = ({
  readings,
  period,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  // Calculate statistics
  const aqiValues = readings.map(r => r.aqi);
  const avgAQI = Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length);
  const maxAQI = Math.max(...aqiValues);
  const minAQI = Math.min(...aqiValues);

  const maxHeight = 60;
  const normalizedData = aqiValues.map(aqi => (aqi / Math.max(...aqiValues)) * maxHeight);

  return (
    <Card variant="elevated" style={styles.card}>
      <CardContent style={styles.content}>
        <Text style={styles.label}>7-DAY TREND</Text>

        {/* Compact Chart */}
        <View style={styles.chartContainer}>
          {normalizedData.map((height, index) => {
            const reading = readings[index];
            const color = getAQIColor(reading.category);

            return (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: Math.max(height, 2),
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>

        {/* Compact Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{avgAQI}</Text>
            <Text style={styles.statLabel}>Avg</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{minAQI}-{maxAQI}</Text>
            <Text style={styles.statLabel}>Range</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  content: {
    paddingVertical: theme.spacing.xl,
  },
  label: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.lg,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    marginBottom: theme.spacing.lg,
    gap: 2,
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderRadius: 2,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
  },
});
