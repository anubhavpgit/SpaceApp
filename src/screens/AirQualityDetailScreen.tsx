import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useDashboardData } from '../hooks/useDashboardData';
import { Card, CardContent } from '../components/ui/Card';
import { POLLUTANT_INFO } from '../constants/aqi';
import { Pollutants } from '../types/airQuality';

export default function AirQualityDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { data, loading } = useDashboardData();

  if (loading || !data) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.text.primary} />
      </View>
    );
  }

  const pollutants = data.currentAQI.pollutants;
  const currentAQI = data.currentAQI;
  const dataSources = data.dataSources;
  const pollutantEntries = Object.entries(pollutants) as Array<[keyof Pollutants, number]>;

  console.log('[AirQualityDetailScreen] Data:', {
    currentAQI,
    pollutants,
    dataSources,
  });

  const getPollutantLevel = (key: keyof Pollutants, value: number): { level: string; color: string } => {
    const levels: Record<keyof Pollutants, Array<{ max: number; level: string; color: string }>> = {
      pm25: [
        { max: 12, level: 'Good', color: '#10B981' },
        { max: 35, level: 'Moderate', color: '#F59E0B' },
        { max: 55, level: 'Unhealthy (Sensitive)', color: '#EF4444' },
        { max: 150, level: 'Unhealthy', color: '#DC2626' },
        { max: 999, level: 'Very Unhealthy', color: '#991B1B' },
      ],
      pm10: [
        { max: 54, level: 'Good', color: '#10B981' },
        { max: 154, level: 'Moderate', color: '#F59E0B' },
        { max: 254, level: 'Unhealthy (Sensitive)', color: '#EF4444' },
        { max: 354, level: 'Unhealthy', color: '#DC2626' },
        { max: 9999, level: 'Very Unhealthy', color: '#991B1B' },
      ],
      o3: [
        { max: 54, level: 'Good', color: '#10B981' },
        { max: 70, level: 'Moderate', color: '#F59E0B' },
        { max: 85, level: 'Unhealthy (Sensitive)', color: '#EF4444' },
        { max: 105, level: 'Unhealthy', color: '#DC2626' },
        { max: 9999, level: 'Very Unhealthy', color: '#991B1B' },
      ],
      no2: [
        { max: 53, level: 'Good', color: '#10B981' },
        { max: 100, level: 'Moderate', color: '#F59E0B' },
        { max: 360, level: 'Unhealthy (Sensitive)', color: '#EF4444' },
        { max: 649, level: 'Unhealthy', color: '#DC2626' },
        { max: 9999, level: 'Very Unhealthy', color: '#991B1B' },
      ],
      so2: [
        { max: 35, level: 'Good', color: '#10B981' },
        { max: 75, level: 'Moderate', color: '#F59E0B' },
        { max: 185, level: 'Unhealthy (Sensitive)', color: '#EF4444' },
        { max: 304, level: 'Unhealthy', color: '#DC2626' },
        { max: 9999, level: 'Very Unhealthy', color: '#991B1B' },
      ],
      co: [
        { max: 4.4, level: 'Good', color: '#10B981' },
        { max: 9.4, level: 'Moderate', color: '#F59E0B' },
        { max: 12.4, level: 'Unhealthy (Sensitive)', color: '#EF4444' },
        { max: 15.4, level: 'Unhealthy', color: '#DC2626' },
        { max: 9999, level: 'Very Unhealthy', color: '#991B1B' },
      ],
    };

    const found = levels[key].find(l => value <= l.max);
    return found || { level: 'Unknown', color: theme.colors.text.muted };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Air Quality Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Data Source Comparison */}
        {dataSources && (
          <Card variant="elevated" style={styles.card}>
            <CardContent style={styles.cardContent}>
              <Text style={styles.cardLabel}>DATA SOURCES</Text>

              {dataSources.tempo.available && (
                <View style={styles.sourceRow}>
                  <View style={styles.sourceInfo}>
                    <Text style={styles.sourceName}>NASA TEMPO</Text>
                    <Text style={styles.sourceDesc}>Satellite</Text>
                  </View>
                  <Text style={styles.sourceValue}>
                    {dataSources.tempo.aqi !== null ? dataSources.tempo.aqi : 'N/A'}
                  </Text>
                </View>
              )}

              {dataSources.ground.available && (
                <View style={styles.sourceRow}>
                  <View style={styles.sourceInfo}>
                    <Text style={styles.sourceName}>Ground Stations</Text>
                    <Text style={styles.sourceDesc}>
                      {dataSources.ground.stationCount} {dataSources.ground.stationCount === 1 ? 'sensor' : 'sensors'}
                    </Text>
                  </View>
                  <Text style={styles.sourceValue}>
                    {dataSources.ground.aqi !== null ? dataSources.ground.aqi : 'N/A'}
                  </Text>
                </View>
              )}

              <View style={[styles.sourceRow, styles.sourceRowHighlight]}>
                <View style={styles.sourceInfo}>
                  <Text style={styles.sourceNameBold}>Aggregated AQI</Text>
                  <Text style={styles.sourceDesc}>
                    Combined data ({Math.round(dataSources.aggregated.confidence * 100)}% confidence)
                  </Text>
                </View>
                <Text style={styles.sourceValueBold}>{dataSources.aggregated.aqi}</Text>
              </View>

              <Text style={styles.sourceNote}>
                Data combined from {dataSources.tempo.available ? 'NASA TEMPO satellite' : ''}
                {dataSources.tempo.available && dataSources.ground.available ? ' and ' : ''}
                {dataSources.ground.available ? 'ground-based sensors' : ''} for accuracy
              </Text>
            </CardContent>
          </Card>
        )}

        {/* Detailed Pollutants */}
        <Text style={styles.sectionTitle}>POLLUTANT BREAKDOWN</Text>

        {pollutantEntries.map(([key, value]) => {
          const info = POLLUTANT_INFO[key];
          const safeValue = value ?? 0;
          const assessment = getPollutantLevel(key, safeValue);

          return (
            <Card key={key} variant="elevated" style={styles.card}>
              <CardContent style={styles.cardContent}>
                <View style={styles.pollutantHeader}>
                  <View>
                    <Text style={styles.pollutantName}>{info.name}</Text>
                    <Text style={styles.pollutantFullName}>{info.fullName}</Text>
                  </View>
                  <View style={styles.pollutantValueContainer}>
                    <Text style={styles.pollutantValue}>{safeValue.toFixed(1)}</Text>
                    <Text style={styles.pollutantUnit}>{info.unit}</Text>
                  </View>
                </View>

                <View style={[styles.levelBadge, { backgroundColor: assessment.color + '20' }]}>
                  <View style={[styles.levelDot, { backgroundColor: assessment.color }]} />
                  <Text style={[styles.levelText, { color: assessment.color }]}>
                    {assessment.level}
                  </Text>
                </View>

                <Text style={styles.pollutantDescription}>{info.description}</Text>
              </CardContent>
            </Card>
          );
        })}

        {/* Last Updated */}
        <Text style={styles.footer}>
          Last updated {new Date().toLocaleString()}
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
  sectionTitle: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  cardContent: {
    paddingVertical: theme.spacing.xl,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.lg,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  sourceRowHighlight: {
    backgroundColor: theme.colors.overlay.light,
    paddingHorizontal: theme.spacing.lg,
    marginHorizontal: -theme.spacing.xl,
    marginTop: theme.spacing.md,
    borderBottomWidth: 0,
    borderRadius: theme.borderRadius.md,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  sourceNameBold: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  sourceDesc: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
  },
  sourceValue: {
    fontSize: 28,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.secondary,
  },
  sourceValueBold: {
    fontSize: 32,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  sourceNote: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.lg,
    lineHeight: theme.typography.sizes.xs * 1.5,
  },
  pollutantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  pollutantName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  pollutantFullName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
  },
  pollutantValueContainer: {
    alignItems: 'flex-end',
  },
  pollutantValue: {
    fontSize: 36,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    letterSpacing: -1,
  },
  pollutantUnit: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.lg,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  levelText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
  pollutantDescription: {
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
