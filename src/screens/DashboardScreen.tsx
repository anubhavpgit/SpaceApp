import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLocation } from '../contexts/LocationContext';
import { useTheme } from '../hooks/useTheme';
import { ScrubbingTimeline } from '../components/ui/ScrubbingTimeline';
import { HealthAlertCard } from '../components/cards/HealthAlertCard';
import { HistoricalTrendCard } from '../components/cards/HistoricalTrendCard';
import { WeatherCompactCard } from '../components/cards/WeatherCompactCard';
import { AirQualityCompactCard } from '../components/cards/AirQualityCompactCard';
import { Card, CardContent } from '../components/ui/Card';
import {
  MOCK_CURRENT_AQI,
  MOCK_FORECAST,
  MOCK_HEALTH_ALERTS,
  MOCK_WEATHER,
  MOCK_HISTORICAL_DATA,
} from '../api/mock/airQualityData';
import { ForecastItem } from '../types/airQuality';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { location } = useLocation();
  const theme = useTheme();
  const [selectedForecast, setSelectedForecast] = useState<ForecastItem | null>(null);

  const handleForecastScrub = (forecast: ForecastItem) => {
    setSelectedForecast(forecast);
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.location}>{location.city}</Text>
            <Text style={styles.headerTitle}>{MOCK_CURRENT_AQI.aqi}</Text>
            <Text style={styles.category}>{MOCK_CURRENT_AQI.category.replace('-', ' ').toUpperCase()}</Text>
          </View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('Globe' as never)}
          >
            <Text style={styles.menuIcon}>•••</Text>
          </TouchableOpacity>
        </View>

        {/* Health Alerts - Compact */}
        {MOCK_HEALTH_ALERTS.map((alert) => (
          <HealthAlertCard key={alert.id} alert={alert} />
        ))}

        {/* 24-Hour Forecast */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ForecastDetail' as never)}
        >
          <Card variant="elevated" style={styles.forecastCard}>
            <CardContent style={styles.forecastContent}>
              <Text style={styles.cardLabel}>24-HOUR FORECAST</Text>
              <ScrubbingTimeline
                forecasts={MOCK_FORECAST.forecasts}
                onScrub={handleForecastScrub}
              />
            </CardContent>
          </Card>
        </TouchableOpacity>

        {/* Grid: Weather + Air Quality */}
        <View style={styles.grid}>
          <WeatherCompactCard weather={MOCK_WEATHER} />
          <AirQualityCompactCard pollutants={MOCK_CURRENT_AQI.pollutants} />
        </View>

        {/* Historical Trends */}
        <HistoricalTrendCard readings={MOCK_HISTORICAL_DATA} period="7d" />

        {/* Footer */}
        <Text style={styles.footerText}>
          NASA TEMPO • Last updated {new Date().toLocaleTimeString()}
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  location: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: 64,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    letterSpacing: -3,
    lineHeight: 68,
  },
  category: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    letterSpacing: 2,
  },
  forecastCard: {
    marginBottom: theme.spacing.lg,
  },
  forecastContent: {
    paddingVertical: theme.spacing.lg,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  footerText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.muted,
    textAlign: 'center',
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.lg,
  },
});
