import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Text } from '../ui/Text';
import { AQIReading } from '../../types/airQuality';
import { getAQIColor, getAQILabel, AQI_LABELS } from '../../constants/aqi';
import { theme } from '../../constants/theme';

interface AQICardProps {
  data: AQIReading;
}

export const AQICard: React.FC<AQICardProps> = ({ data }) => {
  const color = getAQIColor(data.category);
  const label = getAQILabel(data.category);

  return (
    <Card variant="elevated" style={styles.card}>
      <CardHeader>
        <Text bold style={[styles.title, { color: theme.colors.text.secondary }]}>
          AIR QUALITY INDEX
        </Text>
        <Text style={styles.location}>
          {data.location.city}
        </Text>
      </CardHeader>

      <CardContent style={styles.content}>
        <View style={styles.aqiContainer}>
          <View style={[styles.aqiIndicator, { backgroundColor: color }]}>
            <Text bold style={[styles.aqiValue, { color: theme.colors.text.inverse }]}>
              {data.aqi}
            </Text>
          </View>
          <View style={styles.aqiInfo}>
            <Text style={[styles.aqiLabel, { color }]}>
              {label}
            </Text>
            <Text style={{ color: theme.colors.text.muted, fontSize: theme.typography.sizes.sm }}>
              Updated {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        {data.dominantPollutant && (
          <View style={styles.dominantPollutant}>
            <Text style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.sizes.sm }}>
              Dominant Pollutant
            </Text>
            <Text bold style={{ color: theme.colors.text.primary, fontSize: theme.typography.sizes.base }}>
              {data.dominantPollutant.toUpperCase()}
            </Text>
          </View>
        )}
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    // marginBottom handled by Card wrapper
  },
  title: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: theme.spacing.sm,
    fontSize: theme.typography.sizes.xs,
  },
  location: {
    letterSpacing: -0.3,
    fontSize: theme.typography.sizes.xxl,
  },
  content: {
    paddingTop: theme.spacing.xl,
  },
  aqiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  aqiIndicator: {
    width: 95,
    height: 95,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.xl,
    ...theme.shadows.md,
  },
  aqiValue: {
    letterSpacing: -0.5,
    fontSize: theme.typography.sizes.xxxl,
  },
  aqiInfo: {
    flex: 1,
  },
  aqiLabel: {
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.sizes.lg,
  },
  dominantPollutant: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    borderTopWidth: 2,
    borderTopColor: theme.colors.border.light,
  },
});
