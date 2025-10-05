/**
 * Persona Insight Card
 * Displays personalized "What This Means For You" insights
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { PersonaInsights } from '../../types/airQuality';
import { Card, CardContent } from '../ui/Card';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PersonaInsightCardProps {
  insights: PersonaInsights;
  personaName?: string;
  isNew?: boolean;
}

export const PersonaInsightCard: React.FC<PersonaInsightCardProps> = ({
  insights,
  personaName,
  isNew = true
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [expanded, setExpanded] = useState(false);
  const [showNewBadge, setShowNewBadge] = useState(isNew);

  // Hide "NEW" badge after 3 seconds
  React.useEffect(() => {
    if (isNew) {
      setShowNewBadge(true);
      const timer = setTimeout(() => setShowNewBadge(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const getRiskColor = () => {
    switch (insights.risk_assessment.level) {
      case 'low':
        return '#10B981';
      case 'moderate':
        return '#F59E0B';
      case 'high':
        return '#EF4444';
      case 'critical':
        return '#DC2626';
      default:
        return theme.colors.text.secondary;
    }
  };

  return (
    <Card variant="elevated" style={[styles.card, showNewBadge && styles.cardHighlight]}>
      <CardContent style={styles.content}>
        {/* Personalized Banner */}
        {personaName && (
          <View style={styles.personalizedBanner}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerIcon}>✨</Text>
              <Text style={styles.bannerText}>Personalized for {personaName}</Text>
            </View>
            {showNewBadge && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>WHAT THIS MEANS FOR YOU</Text>
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor() + '20' }]}>
            <View style={[styles.riskDot, { backgroundColor: getRiskColor() }]} />
            <Text style={[styles.riskText, { color: getRiskColor() }]}>
              {insights.risk_assessment.level.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Immediate Action - Always Visible */}
        <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.8}>
          <View style={styles.immediateActionContainer}>
            <Text style={styles.immediateActionLabel}>IMMEDIATE ACTION</Text>
            <Text style={styles.immediateActionText}>{insights.immediate_action}</Text>
            <Text style={styles.expandHint}>{expanded ? 'Tap to collapse' : 'Tap for more details'}</Text>
          </View>
        </TouchableOpacity>

        {/* Expanded Content */}
        {expanded && (
          <View style={styles.expandedContent}>
            {/* Context */}
            {insights.context && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>WHY THIS MATTERS</Text>
                <Text style={styles.contextText}>{insights.context}</Text>
              </View>
            )}

            {/* Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>ACTION ITEMS</Text>
                {insights.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <View style={styles.checkboxContainer}>
                      <View style={styles.checkbox} />
                    </View>
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Time Windows */}
            {insights.time_windows && insights.time_windows.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>SAFE TIME WINDOWS</Text>
                {insights.time_windows.map((window, index) => (
                  <View key={index} style={styles.timeWindow}>
                    <View style={styles.timeHeader}>
                      <Text style={styles.timeRange}>{window.start} - {window.end}</Text>
                      <Text style={styles.aqiBadge}>AQI {window.aqi}</Text>
                    </View>
                    <Text style={styles.safeForText}>{window.safe_for}</Text>
                    <Text style={styles.timeRecommendation}>{window.recommendation}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Affected Groups */}
            {insights.risk_assessment.affected_groups && insights.risk_assessment.affected_groups.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>AFFECTED GROUPS</Text>
                <View style={styles.groupsContainer}>
                  {insights.risk_assessment.affected_groups.map((group, index) => (
                    <View key={index} style={styles.groupBadge}>
                      <Text style={styles.groupText}>{group}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Comparative */}
            {insights.comparative && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>COMPARISON</Text>
                <Text style={styles.contextText}>{insights.comparative}</Text>
              </View>
            )}

            {/* Key Insight */}
            {insights.key_insight && (
              <View style={[styles.section, styles.keyInsightSection]}>
                <Text style={styles.keyInsightLabel}>KEY INSIGHT</Text>
                <Text style={styles.keyInsightText}>{insights.key_insight}</Text>
              </View>
            )}

            {/* Data Confidence */}
            {insights.data_confidence && (
              <View style={styles.confidenceFooter}>
                <Text style={styles.confidenceLabel}>
                  Data Confidence: {insights.data_confidence.level.toUpperCase()}
                </Text>
                <Text style={styles.confidenceExplanation}>{insights.data_confidence.explanation}</Text>
              </View>
            )}
          </View>
        )}
      </CardContent>
    </Card>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  card: {
    marginBottom: theme.spacing.lg,
  },
  cardHighlight: {
    borderWidth: 2,
    borderColor: theme.colors.text.primary,
    shadowColor: theme.colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    paddingVertical: theme.spacing.xl,
  },
  personalizedBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.text.primary + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.text.primary,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    fontSize: theme.typography.sizes.base,
    marginRight: theme.spacing.sm,
  },
  bannerText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  newBadge: {
    backgroundColor: '#10B981',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  newBadgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  riskText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
  },
  immediateActionContainer: {
    backgroundColor: theme.colors.overlay.light,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
  },
  immediateActionLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.sm,
  },
  immediateActionText: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.lg * 1.4,
    marginBottom: theme.spacing.sm,
  },
  expandHint: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  expandedContent: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.md,
  },
  contextText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.sizes.sm * 1.6,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.overlay.light,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  checkboxContainer: {
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.text.muted,
    borderRadius: 4,
  },
  recommendationText: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.sm * 1.5,
  },
  timeWindow: {
    backgroundColor: theme.colors.overlay.light,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  timeRange: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  aqiBadge: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.secondary,
  },
  safeForText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  timeRecommendation: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
    lineHeight: theme.typography.sizes.sm * 1.4,
  },
  groupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  groupBadge: {
    backgroundColor: theme.colors.overlay.medium,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  groupText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
  },
  keyInsightSection: {
    backgroundColor: theme.colors.overlay.light,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.text.primary,
  },
  keyInsightLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.sm,
  },
  keyInsightText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.sm * 1.5,
    fontStyle: 'italic',
  },
  confidenceFooter: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  confidenceLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    marginBottom: theme.spacing.xs,
  },
  confidenceExplanation: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.tertiary,
    lineHeight: theme.typography.sizes.xs * 1.5,
  },
});
