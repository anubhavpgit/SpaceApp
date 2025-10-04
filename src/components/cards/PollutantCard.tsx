import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Pollutants, WeatherData } from '../../types/airQuality';
import { POLLUTANT_INFO } from '../../constants/aqi';
import { theme } from '../../constants/theme';

interface PollutantCardProps {
  pollutants: Pollutants;
  weather?: WeatherData;
}

export const PollutantCard: React.FC<PollutantCardProps> = ({ pollutants, weather }) => {
  const pollutantEntries = Object.entries(pollutants) as Array<[keyof Pollutants, number]>;

  const getBarWidth = (value: number, max: number) => {
    return `${Math.min((value / max) * 100, 100)}%`;
  };

  const getPollutantMax = (key: keyof Pollutants): number => {
    const maxValues: Record<keyof Pollutants, number> = {
      pm25: 150,
      pm10: 250,
      o3: 200,
      no2: 200,
      so2: 150,
      co: 10,
    };
    return maxValues[key];
  };

  return (
    <Card variant="elevated" style={styles.card}>
      {weather && (
        <>
          <CardHeader>
            <Text style={styles.title}>Weather Conditions</Text>
          </CardHeader>
          <CardContent>
            <View style={styles.mainCondition}>
              <Text style={styles.temperature}>{Math.round(weather.temperature)}°</Text>
              <Text style={styles.conditions}>{weather.conditions}</Text>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <View>
                  <Text style={styles.detailLabel}>Wind</Text>
                  <Text style={styles.detailValue}>{Math.round(weather.windSpeed)} km/h</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View>
                  <Text style={styles.detailLabel}>Humidity</Text>
                  <Text style={styles.detailValue}>{Math.round(weather.humidity)}%</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View>
                  <Text style={styles.detailLabel}>Pressure</Text>
                  <Text style={styles.detailValue}>{weather.pressure} hPa</Text>
                </View>
              </View>

              {weather.precipitation > 0 && (
                <View style={styles.detailItem}>
                  <View>
                    <Text style={styles.detailLabel}>Precipitation</Text>
                    <Text style={styles.detailValue}>{weather.precipitation} mm</Text>
                  </View>
                </View>
              )}
            </View>
          </CardContent>
          <View style={styles.divider} />
        </>
      )}

      <CardHeader>
        <Text style={styles.title}>Pollutant Levels</Text>
      </CardHeader>

      <CardContent>
        {pollutantEntries.map(([key, value]) => {
          const info = POLLUTANT_INFO[key];
          const max = getPollutantMax(key);
          const barWidth = getBarWidth(value, max);

          return (
            <View key={key} style={styles.pollutantRow}>
              <View style={styles.pollutantHeader}>
                <Text style={styles.pollutantName}>{info.name}</Text>
                <Text style={styles.pollutantValue}>
                  {value.toFixed(1)} {info.unit}
                </Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: barWidth }]} />
              </View>
            </View>
          );
        })}
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mainCondition: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  temperature: {
    fontSize: 72,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.primary,
    letterSpacing: -4,
  },
  conditions: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  detailLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.muted,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginVertical: theme.spacing.lg,
  },
  pollutantRow: {
    marginBottom: theme.spacing.xl,
  },
  pollutantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  pollutantName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.primary,
  },
  pollutantValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
  },
  barContainer: {
    height: 8,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: theme.colors.text.primary,
    borderRadius: theme.borderRadius.sm,
  },
});
