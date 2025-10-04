import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Pollutants } from '../../types/airQuality';
import { POLLUTANT_INFO } from '../../constants/aqi';
import { theme } from '../../constants/theme';

interface PollutantCardProps {
  pollutants: Pollutants;
}

export const PollutantCard: React.FC<PollutantCardProps> = ({ pollutants }) => {
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
                <View style={styles.pollutantNameContainer}>
                  <Text style={styles.pollutantIcon}>{info.icon}</Text>
                  <Text style={styles.pollutantName}>{info.name}</Text>
                </View>
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
  pollutantRow: {
    marginBottom: theme.spacing.xl,
  },
  pollutantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  pollutantNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pollutantIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
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
