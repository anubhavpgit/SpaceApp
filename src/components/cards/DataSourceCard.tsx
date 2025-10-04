import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { DataSource } from '../../types/airQuality';
import { theme } from '../../constants/theme';

interface DataSourceCardProps {
  tempoAQI: number;
  groundAQI: number;
  aggregatedAQI: number;
  lastUpdated: Date;
}

export const DataSourceCard: React.FC<DataSourceCardProps> = ({
  tempoAQI,
  groundAQI,
  aggregatedAQI,
  lastUpdated,
}) => {
  const difference = Math.abs(tempoAQI - groundAQI);
  const agreement = difference <= 10 ? 'High' : difference <= 25 ? 'Moderate' : 'Low';

  return (
    <Card variant="elevated" style={styles.card}>
      <CardHeader>
        <Text style={styles.title}>Data Sources Comparison</Text>
        <Text style={styles.subtitle}>
          Satellite vs Ground-based measurements
        </Text>
      </CardHeader>

      <CardContent>
        {/* TEMPO Satellite Data */}
        <View style={styles.sourceRow}>
          <View style={styles.sourceInfo}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🛰️</Text>
            </View>
            <View style={styles.sourceDetails}>
              <Text style={styles.sourceName}>NASA TEMPO</Text>
              <Text style={styles.sourceDesc}>Satellite Data</Text>
            </View>
          </View>
          <Text style={styles.sourceValue}>{tempoAQI}</Text>
        </View>

        <View style={styles.divider} />

        {/* Ground Sensors Data */}
        <View style={styles.sourceRow}>
          <View style={styles.sourceInfo}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📡</Text>
            </View>
            <View style={styles.sourceDetails}>
              <Text style={styles.sourceName}>Ground Sensors</Text>
              <Text style={styles.sourceDesc}>OpenAQ Network</Text>
            </View>
          </View>
          <Text style={styles.sourceValue}>{groundAQI}</Text>
        </View>

        <View style={styles.divider} />

        {/* Aggregated Data */}
        <View style={styles.sourceRow}>
          <View style={styles.sourceInfo}>
            <View style={[styles.iconContainer, styles.aggregatedIcon]}>
              <Text style={styles.icon}>⚡</Text>
            </View>
            <View style={styles.sourceDetails}>
              <Text style={styles.sourceName}>Aggregated</Text>
              <Text style={styles.sourceDesc}>ML-processed</Text>
            </View>
          </View>
          <Text style={[styles.sourceValue, styles.aggregatedValue]}>
            {aggregatedAQI}
          </Text>
        </View>

        {/* Agreement Indicator */}
        <View style={styles.agreement}>
          <Text style={styles.agreementLabel}>Data Agreement:</Text>
          <View
            style={[
              styles.agreementBadge,
              agreement === 'High' && styles.agreementHigh,
              agreement === 'Moderate' && styles.agreementModerate,
              agreement === 'Low' && styles.agreementLow,
            ]}
          >
            <Text style={styles.agreementText}>{agreement}</Text>
          </View>
        </View>

        <Text style={styles.timestamp}>
          Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
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
  subtitle: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.xs,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  aggregatedIcon: {
    backgroundColor: theme.colors.text.primary,
  },
  icon: {
    fontSize: 20,
  },
  sourceDetails: {
    flex: 1,
  },
  sourceName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  sourceDesc: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.tertiary,
  },
  sourceValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.primary,
  },
  aggregatedValue: {
    fontWeight: theme.typography.weights.regular,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
  },
  agreement: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  agreementLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
  },
  agreementBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  agreementHigh: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  agreementModerate: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  agreementLow: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  agreementText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
  },
  timestamp: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.muted,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});
