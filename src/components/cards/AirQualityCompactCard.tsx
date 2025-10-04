import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, CardContent } from '../ui/Card';
import { Pollutants } from '../../types/airQuality';
import { useTheme } from '../../hooks/useTheme';

interface AirQualityCompactCardProps {
  pollutants: Pollutants;
}

export const AirQualityCompactCard: React.FC<AirQualityCompactCardProps> = ({ pollutants }) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(theme);

  console.log('[AirQualityCompactCard] Received pollutants:', pollutants);

  const topPollutants = [
    { key: 'pm25', name: 'PM2.5', value: pollutants?.pm25 ?? 0, unit: 'μg/m³' },
    { key: 'pm10', name: 'PM10', value: pollutants?.pm10 ?? 0, unit: 'μg/m³' },
    { key: 'o3', name: 'O₃', value: pollutants?.o3 ?? 0, unit: 'ppb' },
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('AirQualityDetail' as never)}
      style={styles.touchable}
    >
      <Card variant="elevated" style={styles.card}>
        <CardContent style={styles.content}>
        <Text style={styles.label}>AIR QUALITY</Text>
        <Text style={styles.mainValue}>{Math.round(pollutants?.pm25 ?? 0)}</Text>
        <Text style={styles.mainUnit}>PM2.5 μg/m³</Text>

        <View style={styles.details}>
          {topPollutants.slice(1).map((pollutant) => (
            <View key={pollutant.key} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{pollutant.name}</Text>
              <Text style={styles.detailValue}>
                {(pollutant.value ?? 0).toFixed(0)} {pollutant.unit}
              </Text>
            </View>
          ))}
        </View>
      </CardContent>
    </Card>
    </TouchableOpacity>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  touchable: {
    flex: 1,
  },
  card: {},
  content: {
    paddingVertical: theme.spacing.xl,
  },
  label: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.md,
  },
  mainValue: {
    fontSize: 48,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    letterSpacing: -2,
    lineHeight: 52,
  },
  mainUnit: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  details: {
    marginTop: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
  },
  detailValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
});
