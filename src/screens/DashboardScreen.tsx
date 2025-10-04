import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLocation } from '../contexts/LocationContext';
import { AQIGauge } from '../components/ui/AQIGauge';
import { ScrubbingTimeline } from '../components/ui/ScrubbingTimeline';
import { PollutantCard } from '../components/cards/PollutantCard';
import { HealthAlertCard } from '../components/cards/HealthAlertCard';
import { LocationCard } from '../components/cards/LocationCard';
import { WeatherCard } from '../components/cards/WeatherCard';
import { DataSourceCard } from '../components/cards/DataSourceCard';
import { HistoricalTrendCard } from '../components/cards/HistoricalTrendCard';
import { SmokeOverlay } from '../components/pollution/SmokeOverlay';
import {
  MOCK_CURRENT_AQI,
  MOCK_FORECAST,
  MOCK_HEALTH_ALERTS,
  MOCK_WEATHER,
  MOCK_HISTORICAL_DATA,
} from '../api/mock/airQualityData';
import { theme } from '../constants/theme';
import { ForecastItem } from '../types/airQuality';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { location } = useLocation();
  const [selectedForecast, setSelectedForecast] = useState<ForecastItem | null>(null);

  const handleForecastScrub = (forecast: ForecastItem) => {
    setSelectedForecast(forecast);
  };

  return (
    <View style={styles.container}>
      {/* Smoke overlay for visual effect */}
      <SmokeOverlay category={MOCK_CURRENT_AQI.category} intensity={0.2} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{location.displayName}</Text>
            <Text style={styles.headerSubtitle}>Air Quality - Real-time monitoring</Text>
          </View>
          <TouchableOpacity
            style={styles.globeButton}
            onPress={() => navigation.navigate('Globe' as never)}
          >
            <Text style={styles.globeIcon}>🌐</Text>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <LocationCard location={MOCK_CURRENT_AQI.location} />

        {/* Interactive AQI Gauge */}
        <View style={styles.gaugeSection}>
          <AQIGauge
            aqi={MOCK_CURRENT_AQI.aqi}
            category={MOCK_CURRENT_AQI.category}
          />
        </View>

        {/* Health Alerts */}
        {MOCK_HEALTH_ALERTS.map((alert) => (
          <HealthAlertCard key={alert.id} alert={alert} />
        ))}

        {/* Interactive Forecast Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>24-Hour Forecast</Text>
          <ScrubbingTimeline
            forecasts={MOCK_FORECAST.forecasts}
            onScrub={handleForecastScrub}
          />
        </View>

        {/* Data Source Comparison */}
        <DataSourceCard
          tempoAQI={72}
          groundAQI={68}
          aggregatedAQI={MOCK_CURRENT_AQI.aqi}
          lastUpdated={new Date()}
        />

        {/* Historical Trends */}
        <HistoricalTrendCard readings={MOCK_HISTORICAL_DATA} period="7d" />

        {/* Weather Conditions */}
        <WeatherCard weather={MOCK_WEATHER} />

        {/* Pollutants Detail */}
        <PollutantCard pollutants={MOCK_CURRENT_AQI.pollutants} />

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Data sourced from NASA TEMPO satellite and ground-based sensors
          </Text>
          <Text style={styles.footerSubtext}>
            Last updated: {new Date().toLocaleTimeString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xxl,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    letterSpacing: -1.5,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.secondary,
  },
  globeButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  globeIcon: {
    fontSize: 24,
  },
  gaugeSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.background.elevated,
    marginHorizontal: -theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border.light,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.lg,
  },
  footer: {
    marginTop: theme.spacing.xxxl,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  footerText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    lineHeight: theme.typography.sizes.sm * 1.5,
  },
  footerSubtext: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
});
