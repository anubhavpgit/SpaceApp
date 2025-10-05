import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, CardContent } from '../ui/Card';
import { WeatherData } from '../../types/airQuality';
import { useTheme } from '../../hooks/useTheme';

interface AISummary {
  brief: string;
  detailed?: string;
  recommendation?: string;
  insight?: string;
  [key: string]: string | string[] | undefined;
}

interface WeatherCompactCardProps {
  weather: WeatherData;
  aiSummary?: AISummary;
}

export const WeatherCompactCard: React.FC<WeatherCompactCardProps> = ({ weather, aiSummary }) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = createStyles(theme);
  const [useFahrenheit, setUseFahrenheit] = useState(true);

  const celsiusToFahrenheit = (celsius: number) => (celsius * 9/5) + 32;
  const temperature = useFahrenheit
    ? Math.round(celsiusToFahrenheit(weather.temperature))
    : Math.round(weather.temperature);
  const unit = useFahrenheit ? '°F' : '°C';

  const handleTemperatureTap = (e: any) => {
    e.stopPropagation();
    setUseFahrenheit(!useFahrenheit);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('WeatherDetail' as never, {
        weather,
        aiSummary,
      } as never)}
      style={styles.touchable}
    >
      <Card variant="elevated" style={styles.card}>
        <CardContent style={styles.content}>
          <Text style={styles.label}>WEATHER</Text>
          <TouchableOpacity onPress={handleTemperatureTap} activeOpacity={0.7}>
            <Text style={styles.temperature}>{temperature}{unit}</Text>
          </TouchableOpacity>
          <Text style={styles.conditions}>{weather.conditions}</Text>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Wind</Text>
              <Text style={styles.detailValue}>{Math.round(weather.windSpeed)} km/h</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Humidity</Text>
              <Text style={styles.detailValue}>{Math.round(weather.humidity)}%</Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  touchable: {
    flex: 1,
    marginRight: theme.spacing.lg,
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
  temperature: {
    fontSize: 48,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    letterSpacing: -2,
    lineHeight: 52,
  },
  conditions: {
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
