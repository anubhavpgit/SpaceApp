import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../ui/Text';
import { Card, CardContent } from '../ui/Card';
import { AQIReading } from '../../types/airQuality';
import { getAQIColor } from '../../constants/aqi';
import { useTheme } from '../../hooks/useTheme';

interface AISummary {
  brief: string;
  detailed?: string;
  recommendation?: string;
  insight?: string;
  [key: string]: string | string[] | undefined;
}

interface HistoricalTrendCardProps {
  readings: AQIReading[];
  period: '24h' | '7d' | '30d';
  aiSummary?: AISummary;
}

export const HistoricalTrendCard: React.FC<HistoricalTrendCardProps> = ({
  readings,
  aiSummary,
}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(theme);

  // Validate readings data
  if (!readings || !Array.isArray(readings) || readings.length === 0) {
    return null; // Don't render if no data
  }

  // Calculate statistics
  const aqiValues = readings.map(r => r.aqi);
  const avgAQI = Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length);
  const maxAQI = Math.max(...aqiValues);
  const minAQI = Math.min(...aqiValues);

  const maxHeight = 60;
  const normalizedData = aqiValues.map(aqi => (aqi / Math.max(...aqiValues)) * maxHeight);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('HistoricalDetail' as never, {
        readings,
        initialPeriod: '7d',
        aiSummary,
      } as never)}
    >
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
              <Text style={styles.statLabel}>Avg</Text>
              <Text style={styles.statValue}>{avgAQI}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Range</Text>
              <Text style={styles.statValue}>{minAQI}-{maxAQI}</Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  content: {
    paddingVertical: theme.spacing.xl,
  },
  aiSection: {
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  aiLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.sm,
  },
  aiBrief: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.sm * 1.5,
    marginBottom: theme.spacing.sm,
  },
  aiTrend: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.sizes.sm * 1.5,
    marginBottom: theme.spacing.sm,
  },
  recommendationBox: {
    backgroundColor: theme.colors.overlay.light,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  recommendationText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.sm * 1.4,
  },
  label: {
    fontSize: 8,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.secondary,
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
    gap: theme.spacing.xs,
    flex: 1,
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
});
