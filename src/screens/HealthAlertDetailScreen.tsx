import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { Text } from '../components/ui/Text';
import { Card, CardContent } from '../components/ui/Card';
import { HealthAlert } from '../types/airQuality';

export default function HealthAlertDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const styles = createStyles(theme);

  // Get alert from route params or use a default
  const alert = (route.params as { alert?: HealthAlert })?.alert || {
    id: '1',
    severity: 'warning' as const,
    title: 'Air Quality Alert',
    message: 'Unhealthy air quality for sensitive groups',
    affectedGroups: ['Children', 'Elderly', 'People with respiratory conditions'],
    recommendations: [
      'Limit prolonged outdoor exertion',
      'Keep windows closed',
      'Use air purifiers indoors',
      'Monitor symptoms closely',
    ],
  };

  const severityConfig = {
    info: { color: theme.colors.text.secondary, bgColor: theme.colors.overlay.medium, label: 'INFO' },
    warning: { color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.08)', label: 'WARNING' },
    critical: { color: '#DC2626', bgColor: 'rgba(220, 38, 38, 0.08)', label: 'CRITICAL' },
  };

  const config = severityConfig[alert.severity];

  const proactiveMeasures = [
    'Keep windows and doors closed during high pollution periods',
    'Use air purifiers indoors if available',
    'Limit strenuous outdoor activities',
    'Wear N95 masks when outdoor exposure is unavoidable',
    'Monitor air quality before planning outdoor activities',
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Alert</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Alert Header */}
        <Card variant="elevated" style={[styles.alertCard, { backgroundColor: config.bgColor }]}>
          <CardContent style={styles.alertContent}>
            <View style={[styles.severityBadge, { backgroundColor: config.color }]}>
              <Text style={styles.severityText}>{config.label}</Text>
            </View>

            <Text style={[styles.alertTitle, { color: config.color }]}>{alert.title}</Text>
            <Text readable style={styles.alertMessage}>{alert.message}</Text>

            <View style={styles.affectedGroupsContainer}>
              <Text style={styles.affectedGroupsLabel}>Affected Groups:</Text>
              <View style={styles.affectedGroupsTags}>
                {alert.affectedGroups.map((group, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{group}</Text>
                  </View>
                ))}
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>PROACTIVE MEASURES</Text>
        {proactiveMeasures.map((measure, index) => (
          <Card key={index} variant="elevated" style={styles.recCard}>
            <CardContent style={styles.recContent}>
              <View style={styles.recNumber}>
                <Text style={styles.recNumberText}>{index + 1}</Text>
              </View>
              <Text readable style={styles.recText}>{measure}</Text>
            </CardContent>
          </Card>
        ))}

        {/* When to Seek Medical Help */}
        <Text style={styles.sectionTitle}>WHEN TO SEEK HELP</Text>
        <Card variant="elevated" style={[styles.card, { borderColor: '#DC2626', borderWidth: 2 }]}>
          <CardContent style={styles.cardContent}>
            <Text style={styles.helpTitle}>Seek Immediate Medical Attention If:</Text>
            <View style={styles.helpList}>
              <Text readable style={styles.helpItem}>• Severe difficulty breathing</Text>
              <Text readable style={styles.helpItem}>• Chest pain or pressure</Text>
              <Text readable style={styles.helpItem}>• Persistent coughing or wheezing</Text>
              <Text readable style={styles.helpItem}>• Dizziness or confusion</Text>
              <Text readable style={styles.helpItem}>• Blue lips or fingernails</Text>
            </View>

            <TouchableOpacity style={styles.emergencyButton}>
              <Text style={styles.emergencyButtonText}>Call Emergency Services</Text>
            </TouchableOpacity>
          </CardContent>
        </Card>

        <View style={{ marginBottom: theme.spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 32,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.primary,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  alertCard: {
    marginBottom: theme.spacing.xl,
  },
  alertContent: {
    paddingVertical: theme.spacing.xxl,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.lg,
  },
  severityText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  alertTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.md,
  },
  alertMessage: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.sizes.base * 1.6,
    marginBottom: theme.spacing.xl,
  },
  affectedGroupsContainer: {
    marginTop: theme.spacing.lg,
  },
  affectedGroupsLabel: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  affectedGroupsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tag: {
    backgroundColor: theme.colors.overlay.medium,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
  },
  tagText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  recCard: {
    marginBottom: theme.spacing.sm,
  },
  recContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  recNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recNumberText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  recText: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.sizes.base * 1.5,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  cardContent: {
    paddingVertical: theme.spacing.xl,
  },
  helpTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: '#DC2626',
    marginBottom: theme.spacing.lg,
  },
  helpList: {
    marginBottom: theme.spacing.xl,
  },
  helpItem: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.sizes.sm * 1.8,
  },
  emergencyButton: {
    backgroundColor: '#DC2626',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: '#FFFFFF',
  },
});
