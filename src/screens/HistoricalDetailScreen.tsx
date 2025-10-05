import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useLocation } from '../contexts/LocationContext';
import { airQualityAPI } from '../api/client';
import { Card, CardContent } from '../components/ui/Card';
import { getAQIColor } from '../constants/aqi';
import { AQIReading } from '../types/airQuality';

interface AISummary {
  brief: string;
  detailed?: string;
  recommendation?: string;
  insight?: string;
  trendAnalysis?: string;
  pattern?: string;
  [key: string]: string | string[] | undefined;
}

export default function HistoricalDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { location } = useLocation();
  const { readings: initialReadings, initialPeriod, aiSummary } = route.params as any;

  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>(initialPeriod || '7d');
  const [loading, setLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<{
    readings: AQIReading[];
    statistics?: any;
  } | null>(initialReadings ? { readings: initialReadings } : null);

  // Only fetch new data when period changes from initial
  useEffect(() => {
    // Don't fetch on initial load if we have initial readings and period matches
    if (selectedPeriod === initialPeriod && initialReadings) {
      return;
    }

    const fetchHistoricalData = async () => {
      if (!location.latitude || !location.longitude) return;

      setLoading(true);
      try {
        const response = await airQualityAPI.post<{
          success: boolean;
          data: {
            readings: any[];
            statistics: any;
          };
        }>('/api/historical', {
          latitude: location.latitude,
          longitude: location.longitude,
          period: selectedPeriod,
        });

        console.log('[HistoricalDetail] API Response:', response);

        if (response.success && response.data) {
          // Transform readings to ensure they have required fields
          const data = response.data;
          const readings = (data.readings || []).map((reading: any) => ({
            ...reading,
            timestamp: new Date(reading.timestamp),
            location: {
              latitude: location.latitude || 0,
              longitude: location.longitude || 0,
              city: location.city,
              country: location.country,
              displayName: location.city || 'Unknown',
              timezone: 'UTC',
            },
            source: 'aggregated' as const,
            confidence: 0.9,
          }));

          setHistoricalData({
            readings,
            statistics: data.statistics,
          });
        }
      } catch (error: any) {
        console.error('[HistoricalDetail] Error fetching historical data:', error);
        console.error('[HistoricalDetail] Error details:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [selectedPeriod, location.latitude, location.longitude, initialPeriod, initialReadings]);

  if (loading || !historicalData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.text.primary} />
      </View>
    );
  }

  const readings = historicalData.readings;

  if (!readings || readings.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>No historical data available</Text>
      </View>
    );
  }

  const aqiValues = readings.map(r => r?.aqi || 0).filter(aqi => aqi > 0);

  if (aqiValues.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>Invalid historical data</Text>
      </View>
    );
  }

  const avgAQI = historicalData.statistics?.average || Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length);
  const maxAQI = historicalData.statistics?.max || Math.max(...aqiValues);
  const minAQI = historicalData.statistics?.min || Math.min(...aqiValues);

  // Use statistics from API if available
  const trendPercent = historicalData.statistics?.trend?.percentage || 0;
  const isImproving = historicalData.statistics?.trend?.direction === 'improving';

  const maxHeight = 120;
  const maxChartValue = Math.max(...aqiValues);
  const normalizedData = aqiValues.map(aqi => (aqi / maxChartValue) * maxHeight);

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
        {/* AI Insights */}
        {aiSummary && (
          <Card variant="elevated" style={styles.aiCard}>
            <CardContent style={styles.aiContent}>
              <Text style={styles.aiLabel}>AI TREND ANALYSIS</Text>
              <Text style={styles.aiBrief}>{aiSummary.brief}</Text>
              {aiSummary.detailed && (
                <Text style={styles.aiDetailed}>{aiSummary.detailed}</Text>
              )}
              {aiSummary.trendAnalysis && (
                <View style={styles.analysisBox}>
                  <Text style={styles.analysisLabel}>TREND ANALYSIS</Text>
                  <Text style={styles.analysisText}>{aiSummary.trendAnalysis}</Text>
                </View>
              )}
              {aiSummary.pattern && (
                <View style={styles.patternBox}>
                  <Text style={styles.patternLabel}>PATTERN DETECTED</Text>
                  <Text style={styles.patternText}>{aiSummary.pattern}</Text>
                </View>
              )}
              {aiSummary.recommendation && (
                <View style={styles.recommendationBox}>
                  <Text style={styles.recommendationLabel}>RECOMMENDATION</Text>
                  <Text style={styles.recommendationText}>{aiSummary.recommendation}</Text>
                </View>
              )}
            </CardContent>
          </Card>
        )}

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
              <Text style={styles.statValueSmall}>{minAQI}-{maxAQI}</Text>
              <Text style={styles.statUnit}>AQI</Text>
            </CardContent>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={styles.statLabel}>TREND</Text>
              <Text style={[styles.statValueSmall, { color: isImproving ? '#10B981' : '#EF4444' }]} numberOfLines={1}>
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
  aiCard: {
    marginBottom: theme.spacing.xl,
  },
  aiContent: {
    paddingVertical: theme.spacing.xl,
  },
  aiLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.md,
  },
  aiBrief: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.base * 1.5,
    marginBottom: theme.spacing.md,
  },
  aiDetailed: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.sizes.sm * 1.6,
    marginBottom: theme.spacing.md,
  },
  analysisBox: {
    backgroundColor: theme.colors.overlay.light,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  analysisLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.sm,
  },
  analysisText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.sm * 1.5,
  },
  patternBox: {
    backgroundColor: theme.colors.overlay.light,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  patternLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.sm,
  },
  patternText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.sm * 1.5,
  },
  recommendationBox: {
    backgroundColor: theme.colors.overlay.medium,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.text.primary,
  },
  recommendationLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.sm,
  },
  recommendationText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.sm * 1.5,
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
  statValueSmall: {
    fontSize: 20,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
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
