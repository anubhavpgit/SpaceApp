import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, CardContent } from '../ui/Card';
import { useTheme } from '../../hooks/useTheme';
import { LiveWeatherReport } from '../../types/airQuality';

interface LiveWeatherReportCardProps {
  report: LiveWeatherReport;
}

export function LiveWeatherReportCard({ report }: LiveWeatherReportCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card variant="elevated" style={styles.card}>
      <CardContent style={styles.content}>
        {/* Header - Always Visible */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.badge}>LIVE</Text>
            <Text style={styles.label}>LOCATION REPORT</Text>
          </View>
          <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
        </TouchableOpacity>

        {/* Headline - Always Visible */}
        <Text style={styles.headline}>{report.headline}</Text>

        {/* Expandable Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Current Conditions */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>CURRENT CONDITIONS</Text>
              <Text style={styles.sectionText}>{report.current_conditions}</Text>
            </View>

            {/* Local Alerts */}
            {report.local_alerts && report.local_alerts !== 'No specific local alerts available at this time.' && (
              <View style={[styles.section, styles.alertSection]}>
                <Text style={styles.sectionLabel}>⚠️ LOCAL ALERTS</Text>
                <Text style={styles.alertText}>{report.local_alerts}</Text>
              </View>
            )}

            {/* Health Advisory */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>HEALTH ADVISORY</Text>
              <Text style={styles.sectionText}>{report.health_advisory}</Text>
            </View>

            {/* Trending Info */}
            {report.trending_info && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>WHAT'S HAPPENING</Text>
                <Text style={styles.sectionText}>{report.trending_info}</Text>
              </View>
            )}

            {/* Recommendations */}
            {report.recommendations && report.recommendations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>RECOMMENDATIONS</Text>
                {report.recommendations.map((rec, idx) => (
                  <View key={idx} style={styles.recommendationRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.sources}>{report.sources}</Text>
              <Text style={styles.nextUpdate}>{report.next_update}</Text>
            </View>
          </View>
        )}
      </CardContent>
    </Card>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  content: {
    paddingVertical: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
    letterSpacing: 1.2,
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
  },
  expandIcon: {
    fontSize: 24,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.secondary,
  },
  headline: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.lg * 1.3,
    marginBottom: theme.spacing.md,
  },
  expandedContent: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  alertSection: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  sectionLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.sm,
  },
  sectionText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.sm * 1.6,
  },
  alertText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: '#D97706',
    lineHeight: theme.typography.sizes.sm * 1.6,
  },
  recommendationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  bullet: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.sizes.sm * 1.5,
  },
  footer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  sources: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.muted,
    marginBottom: theme.spacing.xs,
  },
  nextUpdate: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
});
