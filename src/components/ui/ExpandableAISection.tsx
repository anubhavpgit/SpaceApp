/**
 * Expandable AI Section Component
 * Displays AI summary with expand/collapse functionality
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { AISummary } from '../../types/airQuality';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ExpandableAISectionProps {
  title: string;
  aiSummary: AISummary;
  defaultExpanded?: boolean;
}

export const ExpandableAISection: React.FC<ExpandableAISectionProps> = ({
  title,
  aiSummary,
  defaultExpanded = false,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  if (!aiSummary || !aiSummary.brief) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.7}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.expandIcon}>{expanded ? '−' : '+'}</Text>
        </View>

        {/* Always show brief */}
        <Text style={styles.brief}>{aiSummary.brief}</Text>
      </TouchableOpacity>

      {/* Expandable content */}
      {expanded && (
        <View style={styles.expandedContent}>
          {aiSummary.detailed && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>DETAILS</Text>
              <Text style={styles.detailedText}>{aiSummary.detailed}</Text>
            </View>
          )}

          {aiSummary.recommendation && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>RECOMMENDATION</Text>
              <Text style={styles.recommendationText}>{aiSummary.recommendation}</Text>
            </View>
          )}

          {aiSummary.recommendations && Array.isArray(aiSummary.recommendations) && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>RECOMMENDATIONS</Text>
              {aiSummary.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>
          )}

          {aiSummary.insight && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>INSIGHT</Text>
              <Text style={styles.insightText}>{aiSummary.insight}</Text>
            </View>
          )}

          {aiSummary.keyInsights && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>KEY INSIGHTS</Text>
              <Text style={styles.insightText}>{aiSummary.keyInsights}</Text>
            </View>
          )}

          {aiSummary.trendAnalysis && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>TREND ANALYSIS</Text>
              <Text style={styles.detailedText}>{aiSummary.trendAnalysis}</Text>
            </View>
          )}

          {aiSummary.impact && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>IMPACT</Text>
              <Text style={styles.detailedText}>{aiSummary.impact}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.overlay.light,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  expandIcon: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.primary,
  },
  brief: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.base * 1.5,
  },
  expandedContent: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.sm,
  },
  detailedText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.sizes.sm * 1.6,
  },
  recommendationText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.sm * 1.5,
    flex: 1,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  bullet: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  insightText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.sizes.sm * 1.6,
    fontStyle: 'italic',
  },
});
