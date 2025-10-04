import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useDashboardData } from '../hooks/useDashboardData';
import { Card, CardContent } from '../components/ui/Card';
import { getAQIColor } from '../constants/aqi';

export default function HistoricalDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { data, loading } = useDashboardData();

  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  if (loading || !data) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.text.primary} />
      </View>
    );
  }

  // For now, use the available data
  // TODO: Fetch data for selected period from API
  const allReadings = data.historicalReadings;

  if (!allReadings || allReadings.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>No historical data available</Text>
      </View>
    );
  }

  // Use all available readings (API now returns daily data)
  // The API should be updated to return 7, 30, or 90 days based on request
  const readings = allReadings;

  if (readings.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>No data available for selected period</Text>
      </View>
    );
  }

  const aqiValues = readings.map(r => r.aqi);
  const avgAQI = Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length);
  const maxAQI = Math.max(...aqiValues);
  const minAQI = Math.min(...aqiValues);

  // Calculate trend
  const firstHalf = aqiValues.slice(0, Math.floor(aqiValues.length / 2));
  const secondHalf = aqiValues.slice(Math.floor(aqiValues.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const trendPercent = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
  const isImproving = trendPercent < 0;

  const maxHeight = 120;
  const normalizedData = aqiValues.map(aqi => (aqi / Math.max(...aqiValues)) * maxHeight);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historical Trends</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['7d', '30d', '90d'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Stats */}
        <View style={styles.statsGrid}>
          <Card variant="elevated" style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={styles.statLabel}>AVERAGE</Text>
              <Text style={styles.statValue}>{avgAQI}</Text>
              <Text style={styles.statUnit}>AQI</Text>
            </CardContent>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={styles.statLabel}>RANGE</Text>
              <Text style={styles.statValue}>{minAQI}-{maxAQI}</Text>
              <Text style={styles.statUnit}>AQI</Text>
            </CardContent>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={styles.statLabel}>TREND</Text>
              <Text style={[styles.statValue, { color: isImproving ? '#10B981' : '#EF4444' }]}>
                {isImproving ? '↓' : '↑'} {Math.abs(trendPercent ?? 0).toFixed(1)}%
              </Text>
              <Text style={styles.statUnit}>{isImproving ? 'Improving' : 'Worsening'}</Text>
            </CardContent>
          </Card>
        </View>

        {/* Large Chart */}
        <Card variant="elevated" style={styles.chartCard}>
          <CardContent style={styles.chartContent}>
            <Text style={styles.cardLabel}>AQI OVER TIME</Text>

            <View style={styles.chartContainer}>
              <View style={styles.yAxis}>
                <Text style={styles.yAxisLabel}>{maxAQI}</Text>
                <Text style={styles.yAxisLabel}>{Math.round(maxAQI / 2)}</Text>
                <Text style={styles.yAxisLabel}>0</Text>
              </View>

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
                            height: Math.max(height, 2),
                            backgroundColor: color,
                          },
                        ]}
                      />
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.xAxis}>
              <Text style={styles.xAxisLabel}>{selectedPeriod === '7d' ? '7d ago' : selectedPeriod === '30d' ? '30d ago' : '90d ago'}</Text>
              <Text style={styles.xAxisLabel}>Today</Text>
            </View>
          </CardContent>
        </Card>

        {/* Daily Breakdown */}
        <Text style={styles.sectionTitle}>
          {selectedPeriod === '7d' ? '7-DAY' : selectedPeriod === '30d' ? '30-DAY' : '90-DAY'} BREAKDOWN
        </Text>
        <Card variant="elevated" style={styles.card}>
          <CardContent style={styles.cardContent}>
            {readings.map((reading, index) => {
              const color = getAQIColor(reading.category);
              const date = new Date(reading.timestamp);
              const isToday = index === readings.length - 1;

              return (
                <View key={index} style={[styles.dayRow, index === readings.length - 1 && styles.dayRowLast]}>
                  <View style={styles.dayHeader}>
                    <View style={styles.dayInfo}>
                      <Text style={[styles.dayDate, isToday && styles.todayText]}>
                        {isToday ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                      <Text style={styles.dayCategory}>{reading.category.replace('-', ' ')}</Text>
                    </View>
                    <Text style={[styles.dayValue, { color }]}>{reading.aqi}</Text>
                  </View>

                  <View style={styles.dayBar}>
                    <View
                      style={[
                        styles.dayBarFill,
                        {
                          width: `${(reading.aqi / 200) * 100}%`,
                          backgroundColor: color,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </CardContent>
        </Card>

        {/* Analysis */}
        <Text style={styles.sectionTitle}>ANALYSIS</Text>
        <Card variant="elevated" style={styles.card}>
          <CardContent style={styles.cardContent}>
            <Text style={styles.analysisTitle}>
              {selectedPeriod === '7d' ? '7-Day' : selectedPeriod === '30d' ? '30-Day' : '90-Day'} Summary
            </Text>
            <Text style={styles.analysisText}>
              Air quality has {isImproving ? 'improved' : 'worsened'} by{' '}
              {Math.abs(trendPercent ?? 0).toFixed(1)}% over the past {selectedPeriod === '7d' ? 'week' : selectedPeriod === '30d' ? 'month' : '3 months'}. The average AQI was {avgAQI},
              with values ranging from {minAQI} to {maxAQI}. The best air quality was recorded on{' '}
              {new Date(readings[aqiValues.indexOf(minAQI)].timestamp).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}.
            </Text>
          </CardContent>
        </Card>

        <Text style={styles.footer}>
          Historical data from NASA TEMPO and ground sensors
        </Text>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 32,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.primary,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  periodButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.elevated,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: theme.colors.text.primary,
    borderColor: theme.colors.text.primary,
  },
  periodButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  periodButtonTextActive: {
    color: theme.colors.text.inverse,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    letterSpacing: -1,
    marginBottom: 2,
  },
  statUnit: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
  },
  chartCard: {
    marginBottom: theme.spacing.xl,
  },
  chartContent: {
    paddingVertical: theme.spacing.xl,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.xl,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 140,
    marginBottom: theme.spacing.md,
  },
  yAxis: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: theme.spacing.md,
    paddingVertical: 2,
  },
  yAxisLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.muted,
  },
  chart: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
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
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 40,
  },
  xAxisLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.muted,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.md,
  },
  dayRow: {
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  dayRowLast: {
    borderBottomWidth: 0,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  dayInfo: {
    flex: 1,
  },
  dayDate: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  todayText: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weights.bold,
  },
  dayCategory: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
    textTransform: 'capitalize',
  },
  dayValue: {
    fontSize: 28,
    fontWeight: theme.typography.weights.bold,
  },
  dayBar: {
    height: 6,
    backgroundColor: theme.colors.overlay.medium,
    borderRadius: 3,
    overflow: 'hidden',
  },
  dayBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  cardContent: {
    paddingVertical: theme.spacing.xl,
  },
  analysisTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  analysisText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.sizes.sm * 1.6,
  },
  footer: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.muted,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
});
