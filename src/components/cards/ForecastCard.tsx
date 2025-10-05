import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { ForecastItem } from '../../types/airQuality';
import { getAQIChartColor } from '../../constants/aqi';
import { theme } from '../../constants/theme';

interface ForecastCardProps {
  forecasts: ForecastItem[];
  title?: string;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({
  forecasts,
  title = '24-Hour Forecast',
}) => {
  const hourlyForecasts = forecasts.slice(0, 12); // Show next 12 hours

  return (
    <Card variant="elevated" style={styles.card}>
      <CardHeader>
        <Text style={styles.title}>{title}</Text>
      </CardHeader>

      <CardContent style={styles.content}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
          snapToInterval={76}
          snapToAlignment="start"
          scrollEventThrottle={16}
        >
          {hourlyForecasts.map((forecast, index) => {
            const color = getAQIChartColor(forecast.category);
            const time = new Date(forecast.timestamp).toLocaleTimeString([], {
              hour: 'numeric',
            });

            return (
              <View key={index} style={styles.forecastItem}>
                <Text style={styles.time}>{time}</Text>
                <View style={[styles.aqiBadge, { backgroundColor: color }]}>
                  <Text style={styles.aqiText}>{forecast.aqi}</Text>
                </View>
                {forecast.temperature && (
                  <Text style={styles.temp}>{Math.round(forecast.temperature)}°</Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    paddingHorizontal: 0,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  forecastItem: {
    alignItems: 'center',
    minWidth: 60,
    marginRight: theme.spacing.md,
  },
  time: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.sm,
  },
  aqiBadge: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  aqiText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.inverse,
  },
  temp: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.secondary,
  },
});
