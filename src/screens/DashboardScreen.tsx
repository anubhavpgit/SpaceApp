import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLocation } from '../contexts/LocationContext';
import { usePersona } from '../contexts/PersonaContext';
import { useTheme } from '../hooks/useTheme';
import { useSwrDashboard } from '../hooks/useSwrDashboard';
import { Text } from '../components/ui/Text';
import { ScrubbingTimeline } from '../components/ui/ScrubbingTimeline';
import { HealthAlertCard } from '../components/cards/HealthAlertCard';
import { HistoricalTrendCard } from '../components/cards/HistoricalTrendCard';
import { WeatherCompactCard } from '../components/cards/WeatherCompactCard';
import { AirQualityCompactCard } from '../components/cards/AirQualityCompactCard';
import { Card, CardContent } from '../components/ui/Card';
import { AnimatedDataView } from '../components/ui/AnimatedDataView';
import { RevalidationIndicator } from '../components/ui/RevalidationIndicator';
import { ForecastItem } from '../types/airQuality';
import { PersonaInsightDropdown } from '../components/PersonaInsightDropdown';
import { AQI_LEVEL_COLORS, PASTEL_COLORS } from '../constants/colors';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { location } = useLocation();
  const { persona } = usePersona();
  const theme = useTheme();
  const { data, loading, error, isValidating, mutate, lastUpdated } = useSwrDashboard();
  const [selectedForecast, setSelectedForecast] = useState<ForecastItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAQIInfo, setShowAQIInfo] = useState(false);

  // NOTE: Removed persona change useEffect that was calling mutate()
  // SWR automatically refetches when cache key changes (which includes persona)
  // The duplicate mutate() call was causing two API requests
  useEffect(() => {
    console.log('[DashboardScreen] Persona changed to:', persona);
    console.log('[DashboardScreen] SWR will auto-fetch via cache key change - no manual mutate needed');
  }, [persona]);

  console.log('[DashboardScreen] Render state:', {
    locationLoading: location.isLoading,
    dataLoading: loading,
    hasData: !!data,
    hasError: !!error,
    lat: location.latitude,
    lon: location.longitude,
    hasAlerts: data?.healthAlerts?.length || 0,
    hasForecast: data?.forecast?.forecasts?.length || 0,
    hasPollutants: data?.currentAQI?.pollutants ? Object.keys(data.currentAQI.pollutants).length : 0,
    hasHistorical: data?.historicalReadings?.length || 0,
    historicalReadings: data?.historicalReadings,
    hasPersonaInsights: !!data?.personaInsights,
    hasLiveWeatherReport: !!data?.liveWeatherReport,
    liveWeatherReportHeadline: data?.liveWeatherReport?.headline || 'N/A',
  });

  const handleForecastScrub = (forecast: ForecastItem) => {
    setSelectedForecast(forecast);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  };

  const styles = createStyles(theme);

  // Loading state
  if (loading && !data) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.text.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorTitle}>Unable to load data</Text>
        <Text style={styles.errorMessage}>
          {error.message || 'An unexpected error occurred'}
        </Text>
        <Text style={styles.errorDetails}>
          Please check your internet connection and try again
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={mutate}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No data state
  if (!data) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorTitle}>No data available</Text>
        <Text style={styles.errorMessage}>Unable to fetch air quality information</Text>
        <TouchableOpacity style={styles.retryButton} onPress={mutate}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 4,
            paddingBottom: insets.bottom + 20,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.text.primary}
          />
        }
      >
        {/* Location Permission Notice */}
        {location.error && (
          <View style={styles.locationNotice}>
            <Text style={styles.locationNoticeText}>{location.error}</Text>
          </View>
        )}

        {/* Revalidation Indicator */}
        <RevalidationIndicator
          isValidating={isValidating}
          lastUpdated={lastUpdated}
          isPullRefreshing={refreshing}
        />

        {/* Header */}
        <AnimatedDataView data={data.currentAQI} animationType="fade">
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.location}>{location.city || 'Unknown Location'}</Text>
              <View style={styles.aqiRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('AirQualityDetail' as never, {
                    currentAQI: data.currentAQI,
                    dataSources: data.dataSources,
                  } as never)}
                >
                  <Text style={styles.headerTitle}>{data.currentAQI?.aqi || '--'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={() => setShowAQIInfo(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.infoButtonText}>i</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.category}>
                {data.currentAQI?.category?.replace('-', ' ').toUpperCase() || 'UNKNOWN'}
              </Text>

              {/* AI Summary - Left aligned with AQI */}
              {data.currentAQISummary && (
                <View style={styles.summaryContainer}>
                  <Text readable style={styles.summaryText}>{data.currentAQISummary.brief}</Text>
                  {data.currentAQISummary.insight && (
                    <Text readable style={styles.insightText}>{data.currentAQISummary.insight}</Text>
                  )}
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate('Globe' as never)}
            >
              <Text style={styles.menuIcon}>•••</Text>
            </TouchableOpacity>
          </View>
        </AnimatedDataView>

        {/* Persona Selector & Insights with Live Report */}
        <PersonaInsightDropdown
          insights={data.personaInsights}
          liveWeatherReport={data.liveWeatherReport}
          isLoading={loading || isValidating}
        />

        {/* Health Alerts - Compact */}
        {data.healthAlerts && data.healthAlerts.length > 0 && data.healthAlerts.map((alert) => (
          <HealthAlertCard key={alert.id} alert={alert} />
        ))}

        {/* 24-Hour Forecast */}
        {data.forecast?.forecasts && data.forecast.forecasts.length > 0 && (
          <AnimatedDataView data={data.forecast} animationType="fade">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ForecastDetail' as never, {
                forecast: data.forecast,
                aiSummary: data.forecastSummary,
              } as never)}
            >
              <Card variant="elevated" style={styles.forecastCard}>
                <CardContent style={styles.forecastContent}>
                  <Text style={styles.cardLabel}>24-HOUR FORECAST</Text>
                  <ScrubbingTimeline
                    forecasts={data.forecast.forecasts}
                    onScrub={handleForecastScrub}
                  />
                </CardContent>
              </Card>
            </TouchableOpacity>
          </AnimatedDataView>
        )}

        {/* Grid: Weather + Air Quality */}
        {data.weather && data.currentAQI?.pollutants && (
          <AnimatedDataView data={data.weather} animationType="fade">
            <View style={styles.grid}>
              <WeatherCompactCard
                weather={data.weather}
                aiSummary={data.weatherSummary}
              />
              <AirQualityCompactCard
                pollutants={data.currentAQI.pollutants}
                currentAQI={data.currentAQI}
                dataSources={data.dataSources}
                aiSummary={data.currentAQISummary}
              />
            </View>
          </AnimatedDataView>
        )}

        {/* Historical Trends */}
        {data.historicalReadings && data.historicalReadings.length > 0 ? (
          <AnimatedDataView data={data.historicalReadings} animationType="fade">
            <HistoricalTrendCard
              readings={data.historicalReadings}
              period="7d"
              aiSummary={data.historicalSummary}
            />
          </AnimatedDataView>
        ) : (
          console.log('[DashboardScreen] No historical readings to display:', {
            hasHistoricalReadings: !!data.historicalReadings,
            length: data.historicalReadings?.length,
            data: data.historicalReadings
          })
        )}

        {/* Footer */}
        <Text style={styles.footerText}>
          NASA TEMPO • Last updated {lastUpdated?.toLocaleTimeString() || 'Loading...'}
        </Text>
      </ScrollView>

      {/* AQI Info Modal */}
      <Modal
        visible={showAQIInfo}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAQIInfo(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAQIInfo(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AQI Scale</Text>
              <TouchableOpacity
                onPress={() => setShowAQIInfo(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.aqiLevelsContainer}>
                <View style={[styles.aqiLevel, { backgroundColor: AQI_LEVEL_COLORS.good }]}>
                  <Text style={[styles.aqiLevelText, { color: PASTEL_COLORS.deepBlueGray }]}>0-50</Text>
                  <Text style={[styles.aqiLevelLabel, { color: PASTEL_COLORS.deepBlueGray }]}>Good</Text>
                </View>
                <View style={[styles.aqiLevel, { backgroundColor: AQI_LEVEL_COLORS.moderate }]}>
                  <Text style={[styles.aqiLevelText, { color: PASTEL_COLORS.deepBlueGray }]}>51-100</Text>
                  <Text style={[styles.aqiLevelLabel, { color: PASTEL_COLORS.deepBlueGray }]}>Moderate</Text>
                </View>
                <View style={[styles.aqiLevel, { backgroundColor: AQI_LEVEL_COLORS.unhealthySensitive }]}>
                  <Text style={[styles.aqiLevelText, { color: PASTEL_COLORS.deepBlueGray }]}>101-150</Text>
                  <Text style={[styles.aqiLevelLabel, { color: PASTEL_COLORS.deepBlueGray }]}>Unhealthy (Sensitive)</Text>
                </View>
                <View style={[styles.aqiLevel, { backgroundColor: AQI_LEVEL_COLORS.unhealthy }]}>
                  <Text style={[styles.aqiLevelText, { color: PASTEL_COLORS.deepBlueGray }]}>151-200</Text>
                  <Text style={[styles.aqiLevelLabel, { color: PASTEL_COLORS.deepBlueGray }]}>Unhealthy</Text>
                </View>
                <View style={[styles.aqiLevel, { backgroundColor: AQI_LEVEL_COLORS.veryUnhealthy }]}>
                  <Text style={[styles.aqiLevelText, { color: PASTEL_COLORS.deepBlueGray }]}>201-300</Text>
                  <Text style={[styles.aqiLevelLabel, { color: PASTEL_COLORS.deepBlueGray }]}>Very Unhealthy</Text>
                </View>
                <View style={[styles.aqiLevel, { backgroundColor: AQI_LEVEL_COLORS.hazardous }]}>
                  <Text style={[styles.aqiLevelText, { color: PASTEL_COLORS.deepBlueGray }]}>301+</Text>
                  <Text style={[styles.aqiLevelLabel, { color: PASTEL_COLORS.deepBlueGray }]}>Hazardous</Text>
                </View>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.text.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.inverse,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  locationNotice: {
    backgroundColor: 'rgba(255, 217, 61, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: PASTEL_COLORS.golden,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
  },
  locationNoticeText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.sizes.sm * 1.5,
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
  aqiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  infoButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  infoButtonText: {
    fontSize: 12,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  summaryContainer: {
    marginTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  summaryText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.sm * 1.5,
  },
  insightText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    lineHeight: theme.typography.sizes.xs * 1.5,
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
    color: theme.colors.text.secondary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 64, 89, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    borderWidth: 3,
    borderColor: theme.colors.text.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.text.primary,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 32,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    lineHeight: 32,
  },
  modalBody: {
    padding: theme.spacing.md,
  },
  aqiLevelsContainer: {
    gap: theme.spacing.xs,
  },
  aqiLevel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.text.primary,
  },
  aqiLevelText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
  aqiLevelLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
});
