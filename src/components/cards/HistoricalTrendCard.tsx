import React from 'react';
import { View, Text, StyleSheet } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { AQIReading } from '../../types/airQuality';
import { getAQIColor } from '../../constants/aqi';
import { theme } from '../../constants/theme';

interface HistoricalTrendCardProps {
  readings: AQIReading[];
  period: '24h' | '7d' | '30d';
}

export const HistoricalTrendCard: React.FC<HistoricalTrendCardProps> = ({
  readings,
  period,
}) => {
  const periodLabel = {
    '24h': 'Last 24 Hours',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
  }[period];

  // Calculate statistics
  const aqiValues = readings.map(r => r.aqi);
  const avgAQI = Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length);
  const maxAQI = Math.max(...aqiValues);
  const minAQI = Math.min(...aqiValues);

  // Calculate trend
  const firstHalf = aqiValues.slice(0, Math.floor(aqiValues.length / 2));
  const secondHalf = aqiValues.slice(Math.floor(aqiValues.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const trend = secondAvg > firstAvg ? 'Worsening' : secondAvg < firstAvg ? 'Improving' : 'Stable';
  const trendIcon = trend === 'Worsening' ? '📈' : trend === 'Improving' ? '📉' : '➡️';

  const maxHeight = 80;
  const normalizedData = aqiValues.map(aqi => (aqi / Math.max(...aqiValues)) * maxHeight);

  return (
    <Card variant="elevated" style={styles.card}>
      <CardHeader>
        <Text style={styles.title}>Historical Trends</Text>
        <Text style={styles.period}>{periodLabel}</Text>
      </CardHeader>

      <CardContent>
        {/* Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chart}>
            {normalizedData.map((height, index) => {
              const reading = readings[index];
              const color = getAQIColor(reading.category);

              return (
                <View key={index} style={styles.barContainer}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: Math.max(height, 4),
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>

          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            <Text style={styles.yAxisLabel}>{maxAQI}</Text>
            <Text style={styles.yAxisLabel}>{Math.round(maxAQI / 2)}</Text>
            <Text style={styles.yAxisLabel}>0</Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>{avgAQI}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Range</Text>
            <Text style={styles.statValue}>{minAQI}-{maxAQI}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Trend</Text>
            <View style={styles.trendContainer}>
              <Text style={styles.trendIcon}>{trendIcon} </Text>
              <Text style={styles.statValue}>{trend}</Text>
            </View>
          </View>
        </View>
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  period: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.xs,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 120,
    marginBottom: theme.spacing.xl,
  },
  chart: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingRight: theme.spacing.md,
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 1,
  },
  chartBar: {
    width: '100%',
    borderRadius: 1,
  },
  yAxis: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 2,
  },
  yAxisLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.muted,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.primary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border.light,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 16,
  },
});
