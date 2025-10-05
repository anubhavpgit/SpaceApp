import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useSwrDashboard } from '../hooks/useSwrDashboard';
import { Card, CardContent } from '../components/ui/Card';

export default function WeatherDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { data, loading } = useSwrDashboard();
  const [useFahrenheit, setUseFahrenheit] = useState(true);

  const celsiusToFahrenheit = (celsius: number) => (celsius * 9/5) + 32;

  if (loading || !data) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.text.primary} />
      </View>
    );
  }

  const weather = data.weather;
  const tempInSelectedUnit = (temp: number) => useFahrenheit
    ? Math.round(celsiusToFahrenheit(temp))
    : Math.round(temp);
  const tempUnit = useFahrenheit ? '°F' : '°C';

  const weatherMetrics = [
    { label: 'Temperature', value: `${tempInSelectedUnit(weather.temperature)}${tempUnit}`, icon: '🌡️' },
    { label: 'Feels Like', value: `${tempInSelectedUnit(weather.temperature - 2)}${tempUnit}`, icon: '💨' },
    { label: 'Humidity', value: `${Math.round(weather.humidity)}%`, icon: '💧' },
    { label: 'Wind Speed', value: `${Math.round(weather.windSpeed)} km/h`, icon: '🍃' },
    { label: 'Wind Direction', value: `${weather.windDirection}°`, icon: '🧭' },
    { label: 'Pressure', value: `${weather.pressure} hPa`, icon: '📊' },
    { label: 'Precipitation', value: `${weather.precipitation} mm`, icon: '🌧️' },
    { label: 'Visibility', value: '10 km', icon: '👁️' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weather Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Conditions */}
        <Card variant="elevated" style={styles.heroCard}>
          <CardContent style={styles.heroContent}>
            <TouchableOpacity onPress={() => setUseFahrenheit(!useFahrenheit)} activeOpacity={0.7}>
              <Text style={styles.heroTemp}>{tempInSelectedUnit(weather.temperature)}{tempUnit}</Text>
            </TouchableOpacity>
            <Text style={styles.heroCondition}>{weather.conditions}</Text>
            <Text style={styles.heroSubtext}>Partly cloudy with gentle breeze</Text>
          </CardContent>
        </Card>

        {/* Weather Metrics Grid */}
        <Text style={styles.sectionTitle}>CONDITIONS</Text>
        <View style={styles.grid}>
          {weatherMetrics.map((metric, index) => (
            <Card key={index} variant="elevated" style={styles.metricCard}>
              <CardContent style={styles.metricContent}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
              </CardContent>
            </Card>
          ))}
        </View>

        {/* Weather Impact on Air Quality */}
        <Text style={styles.sectionTitle}>IMPACT ON AIR QUALITY</Text>
        <Card variant="elevated" style={styles.card}>
          <CardContent style={styles.cardContent}>
            <Text style={styles.impactTitle}>Weather Conditions</Text>
            <Text style={styles.impactText}>
              Current wind conditions ({Math.round(weather.windSpeed)} km/h) are helping to disperse pollutants,
              leading to better air quality. Low humidity ({Math.round(weather.humidity)}%) reduces the
              formation of secondary pollutants.
            </Text>

            <View style={styles.impactMetric}>
              <Text style={styles.impactLabel}>Dispersion Factor</Text>
              <View style={styles.impactBar}>
                <View style={[styles.impactBarFill, { width: '75%', backgroundColor: '#10B981' }]} />
              </View>
              <Text style={styles.impactValue}>Good</Text>
            </View>
          </CardContent>
        </Card>

        {/* UV Index */}
        <Text style={styles.sectionTitle}>UV INDEX</Text>
        <Card variant="elevated" style={styles.card}>
          <CardContent style={styles.cardContent}>
            <View style={styles.uvHeader}>
              <Text style={styles.uvValue}>6</Text>
              <View style={[styles.uvBadge, { backgroundColor: '#F59E0B20' }]}>
                <Text style={[styles.uvBadgeText, { color: '#F59E0B' }]}>High</Text>
              </View>
            </View>
            <Text style={styles.uvText}>
              Protection required. Seek shade during midday hours. Wear sunscreen and protective clothing.
            </Text>
          </CardContent>
        </Card>

        <Text style={styles.footer}>
          Weather data updated every 15 minutes
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
  heroCard: {
    marginBottom: theme.spacing.xl,
  },
  heroContent: {
    paddingVertical: theme.spacing.xxxl,
    alignItems: 'center',
  },
  heroTemp: {
    fontSize: 96,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    letterSpacing: -4,
    lineHeight: 100,
  },
  heroCondition: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
  },
  heroSubtext: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  metricCard: {
    width: '48%',
  },
  metricContent: {
    paddingVertical: theme.spacing.lg,
  },
  metricLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.sm,
  },
  metricValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  cardContent: {
    paddingVertical: theme.spacing.xl,
  },
  impactTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  impactText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.sizes.sm * 1.5,
    marginBottom: theme.spacing.lg,
  },
  impactMetric: {
    marginTop: theme.spacing.md,
  },
  impactLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.sm,
  },
  impactBar: {
    height: 8,
    backgroundColor: theme.colors.overlay.medium,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  impactBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  impactValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: '#10B981',
  },
  uvHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  uvValue: {
    fontSize: 48,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  uvBadge: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
  },
  uvBadgeText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
  uvText: {
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
