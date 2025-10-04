import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { HealthAlert } from '../../types/airQuality';
import { theme } from '../../constants/theme';

interface HealthAlertCardProps {
  alert: HealthAlert;
}

export const HealthAlertCard: React.FC<HealthAlertCardProps> = ({ alert }) => {
  const severityConfig = {
    info: { icon: 'ℹ️', color: theme.colors.text.secondary, bgColor: 'rgba(115, 115, 115, 0.1)' },
    warning: { icon: '⚠️', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
    critical: { icon: '🚨', color: '#DC2626', bgColor: 'rgba(220, 38, 38, 0.1)' },
  };

  const config = severityConfig[alert.severity];

  return (
    <Card variant="elevated" style={[styles.card, { backgroundColor: config.bgColor }]}>
      <CardHeader>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
            <Text style={styles.icon}>{config.icon}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: config.color }]}>{alert.title}</Text>
            <Text style={styles.affectedGroups}>
              Affects: {alert.affectedGroups.join(', ')}
            </Text>
          </View>
        </View>
      </CardHeader>

      <CardContent>
        <Text style={styles.message}>{alert.message}</Text>

        {alert.recommendations.length > 0 && (
          <View style={styles.recommendations}>
            <Text style={styles.recommendationsTitle}>Recommendations</Text>
            {alert.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        )}
      </CardContent>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  icon: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.xs,
  },
  affectedGroups: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.secondary,
  },
  message: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.base * theme.typography.lineHeights.relaxed,
    marginBottom: theme.spacing.xl,
  },
  recommendations: {
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  recommendationsTitle: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.lg,
  },
  recommendationRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  bullet: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.md,
    fontWeight: theme.typography.weights.medium,
  },
  recommendationText: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.base * theme.typography.lineHeights.normal,
  },
});
