import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { WeatherData } from '../../types/airQuality';
import { theme } from '../../constants/theme';

interface WeatherCardProps {
  weather: WeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  return (
    <Card variant="elevated" style={styles.card}>
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
            <Text style={styles.detailIcon}>💨</Text>
            <View>
              <Text style={styles.detailLabel}>Wind</Text>
              <Text style={styles.detailValue}>{Math.round(weather.windSpeed)} km/h</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>💧</Text>
            <View>
              <Text style={styles.detailLabel}>Humidity</Text>
              <Text style={styles.detailValue}>{Math.round(weather.humidity)}%</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>🌡️</Text>
            <View>
              <Text style={styles.detailLabel}>Pressure</Text>
              <Text style={styles.detailValue}>{weather.pressure} hPa</Text>
            </View>
          </View>

          {weather.precipitation > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>🌧️</Text>
              <View>
                <Text style={styles.detailLabel}>Precipitation</Text>
                <Text style={styles.detailValue}>{weather.precipitation} mm</Text>
              </View>
            </View>
          )}
        </View>
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
    marginBottom: theme.spacing.xxl,
    paddingVertical: theme.spacing.xl,
  },
  temperature: {
    fontSize: 80,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.primary,
    letterSpacing: -5,
  },
  conditions: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
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
  detailIcon: {
    fontSize: 28,
    marginRight: theme.spacing.lg,
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
});
