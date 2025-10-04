import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { Card, CardContent } from '../components/ui/Card';
import { getAQIColor } from '../constants/aqi';

export default function ForecastDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { forecast } = route.params as any;

  if (!forecast || !forecast.forecasts || forecast.forecasts.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>No forecast data available</Text>
      </View>
    );
  }

  const forecasts = forecast.forecasts;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>24-Hour Forecast</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <Card variant="elevated" style={styles.summaryCard}>
          <CardContent style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>FORECAST SUMMARY</Text>
            <Text style={styles.summaryText}>
              Air quality will improve over the next 24 hours. Best conditions expected around 3 PM.
              Sensitive groups should avoid outdoor activities during morning hours.
            </Text>
          </CardContent>
        </Card>

        {/* Hourly Breakdown */}
        <Text style={styles.sectionTitle}>HOURLY BREAKDOWN</Text>
        {forecasts.map((forecast, index) => {
          const color = getAQIColor(forecast.category);

          return (
            <Card key={index} variant="elevated" style={styles.forecastCard}>
              <CardContent style={styles.forecastContent}>
                <View style={styles.forecastHeader}>
                  <Text style={styles.forecastTime}>
                    {new Date(forecast.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.forecastValue}>{forecast.aqi}</Text>
                </View>

                <View style={styles.forecastBar}>
                  <View
                    style={[
                      styles.forecastBarFill,
                      {
                        width: `${(forecast.aqi / 200) * 100}%`,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>
              </CardContent>
            </Card>
          );
        })}

        {/* Key Insights */}
        <Text style={styles.sectionTitle}>KEY INSIGHTS</Text>
        <Card variant="elevated" style={styles.card}>
          <CardContent style={styles.cardContent}>
            <View style={styles.insightRow}>
              <View style={[styles.insightDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.insightText}>Best air quality expected at 3:00 PM (AQI 45)</Text>
            </View>
            <View style={styles.insightRow}>
              <View style={[styles.insightDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.insightText}>Highest pollution at 8:00 AM (AQI 85)</Text>
            </View>
            <View style={styles.insightRow}>
              <View style={[styles.insightDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.insightText}>
                Wind patterns suggest gradual improvement throughout the day
              </Text>
            </View>
          </CardContent>
        </Card>

        <Text style={styles.footer}>
          Forecast updated every hour using NASA TEMPO data
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
    paddingTop: theme.spacing.xl,
  },
  summaryCard: {
    marginBottom: theme.spacing.xl,
  },
  summaryContent: {
    paddingVertical: theme.spacing.xl,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.md,
  },
  summaryText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.sizes.base * 1.6,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.md,
  },
  forecastCard: {
    marginBottom: theme.spacing.md,
  },
  forecastContent: {
    paddingVertical: theme.spacing.lg,
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  forecastTime: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.secondary,
  },
  forecastValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  forecastBar: {
    height: 6,
    backgroundColor: theme.colors.overlay.medium,
    borderRadius: 3,
    overflow: 'hidden',
  },
  forecastBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  cardContent: {
    paddingVertical: theme.spacing.xl,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.md,
    marginTop: 6,
  },
  insightText: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.sizes.sm * 1.5,
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
