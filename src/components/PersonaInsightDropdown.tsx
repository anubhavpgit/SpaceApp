/**
 * Persona Insight Dropdown Component
 * Expandable card that shows persona selector and persona-specific insights
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { usePersona } from '../contexts/PersonaContext';
import { PersonaType, PersonaInsights, LiveWeatherReport } from '../types/airQuality';
import { Text } from './ui/Text';
import { Card, CardContent } from './ui/Card';
import { RISK_LEVEL_COLORS } from '../constants/colors';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PERSONAS: Array<{ type: PersonaType; label: string; description: string }> = [
  {
    type: 'general',
    label: 'General Public',
    description: 'No specific role',
  },
  {
    type: 'vulnerable_population',
    label: 'Vulnerable Individual',
    description: 'Elderly, children, asthma, respiratory conditions',
  },
  {
    type: 'school_administrator',
    label: 'School Administrator',
    description: 'Managing student outdoor activities',
  },
  {
    type: 'eldercare_manager',
    label: 'Eldercare Manager',
    description: 'Senior care facilities',
  },
  {
    type: 'government_official',
    label: 'Government Official',
    description: 'Policy makers, municipal leaders',
  },
  {
    type: 'transportation_authority',
    label: 'Transportation Authority',
    description: 'Transit, traffic, port operations',
  },
  {
    type: 'parks_recreation',
    label: 'Parks & Recreation',
    description: 'Parks departments, event coordinators',
  },
  {
    type: 'emergency_response',
    label: 'Emergency Response',
    description: 'Fire departments, disaster management',
  },
  {
    type: 'insurance_assessor',
    label: 'Insurance Assessor',
    description: 'Risk evaluation and analysis',
  },
  {
    type: 'citizen_scientist',
    label: 'Citizen Scientist',
    description: 'Data collection and validation',
  },
];

interface PersonaInsightDropdownProps {
  insights?: PersonaInsights;
  liveWeatherReport?: LiveWeatherReport;
  isLoading?: boolean;
}

export const PersonaInsightDropdown: React.FC<PersonaInsightDropdownProps> = ({ insights, liveWeatherReport, isLoading = false }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { persona, setPersona, isChangingPersona } = usePersona();
  const [expanded, setExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Combine loading states
  const showLoader = isLoading || isChangingPersona;

  const selectedPersona = PERSONAS.find(p => p.type === persona);
  const selectedPersonaLabel = selectedPersona?.label || 'Select Role';

  const handleSelectPersona = async (type: PersonaType) => {
    try {
      await setPersona(type);
      setModalVisible(false);
    } catch (error) {
      console.error('[PersonaInsightDropdown] Error setting persona:', error);
    }
  };

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const getRiskColor = () => {
    if (!insights?.risk_assessment?.level) return theme.colors.text.secondary;

    switch (insights.risk_assessment.level) {
      case 'low':
        return RISK_LEVEL_COLORS.low;
      case 'moderate':
        return RISK_LEVEL_COLORS.moderate;
      case 'high':
        return RISK_LEVEL_COLORS.high;
      case 'critical':
        return RISK_LEVEL_COLORS.critical;
      default:
        return theme.colors.text.secondary;
    }
  };

  return (
    <View style={styles.container}>
      <Card variant="elevated" style={[styles.card, isChangingPersona && styles.cardDisabled]}>
        <CardContent style={styles.cardContent}>
          {/* Header - Always Visible */}
          <View style={styles.header}>
            {liveWeatherReport && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.personaButton}
              onPress={() => !isChangingPersona && setModalVisible(true)}
              activeOpacity={0.7}
              disabled={isChangingPersona}
            >
              <View style={styles.personaInfo}>
                <Text style={styles.label}>YOUR ROLE</Text>
                <Text style={styles.selectedValue}>{selectedPersonaLabel}</Text>
              </View>
              <Text style={styles.editIcon}>›</Text>
            </TouchableOpacity>

            {(insights || liveWeatherReport || showLoader) && (
              <View style={styles.expandButton}>
                {showLoader ? (
                  <ActivityIndicator size="small" color={theme.colors.text.primary} />
                ) : (
                  <TouchableOpacity
                    onPress={toggleExpanded}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.expandIcon}>{expanded ? '−' : '+'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Expanded Content - Simplified */}
          {expanded && (insights || liveWeatherReport) && (
            <View style={styles.expandedContent}>
              {/* Live Weather Headline */}
              {liveWeatherReport && (
                <View style={styles.liveSection}>
                  <Text readable bold style={styles.liveHeadline}>{liveWeatherReport.headline}</Text>
                  {liveWeatherReport.health_advisory && (
                    <Text readable style={styles.healthAdvisory}>{liveWeatherReport.health_advisory}</Text>
                  )}
                </View>
              )}

              {/* Main Insight */}
              {insights && (
                <View style={styles.mainInsight}>
                  <View style={styles.insightHeader}>
                    <View style={[styles.riskDot, { backgroundColor: getRiskColor() }]} />
                    <Text readable style={styles.insightText}>{insights.immediate_action}</Text>
                  </View>
                </View>
              )}

              {/* Best Time Window (if available) */}
              {insights?.time_windows && insights.time_windows.length > 0 && (
                <View style={styles.timeWindowCompact}>
                  <Text style={styles.timeWindowLabel}>Best time for outdoor activities</Text>
                  <View style={styles.timeWindowRow}>
                    <Text style={styles.timeWindowTime}>
                      {insights.time_windows[0].start} - {insights.time_windows[0].end}
                    </Text>
                    <Text style={styles.timeWindowAqi}>AQI {insights.time_windows[0].aqi}</Text>
                  </View>
                </View>
              )}

              {/* Top Recommendations (max 3) */}
              {(liveWeatherReport?.recommendations || insights?.recommendations) && (
                <View style={styles.recommendationsCompact}>
                  {(liveWeatherReport?.recommendations || insights?.recommendations)
                    ?.slice(0, 3)
                    .map((rec, idx) => (
                      <Text readable key={idx} style={styles.recommendationCompact}>
                        • {rec}
                      </Text>
                    ))}
                </View>
              )}
            </View>
          )}
        </CardContent>
      </Card>

      {/* Modal for persona selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Role</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.personaList} showsVerticalScrollIndicator={false}>
              {PERSONAS.map((p) => (
                <TouchableOpacity
                  key={p.type}
                  style={[
                    styles.personaOption,
                    persona === p.type && styles.personaOptionSelected,
                  ]}
                  onPress={() => handleSelectPersona(p.type)}
                  activeOpacity={0.7}
                >
                  <View style={styles.personaOptionContent}>
                    <Text
                      style={[
                        styles.personaLabel,
                        persona === p.type && styles.personaLabelSelected,
                      ]}
                    >
                      {p.label}
                    </Text>
                    <Text readable style={styles.personaDescription}>{p.description}</Text>
                  </View>
                  {persona === p.type && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Text readable style={styles.footerText}>
                Changing your role will fetch personalized air quality insights
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    card: {
      marginBottom: 0,
    },
    cardDisabled: {
      opacity: 0.6,
    },
    cardContent: {
      paddingVertical: theme.spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    liveBadge: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      marginRight: theme.spacing.sm,
    },
    liveBadgeText: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.bold,
      color: RISK_LEVEL_COLORS.high,
      letterSpacing: 1.2,
    },
    personaButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: theme.spacing.md,
    },
    personaInfo: {
      flex: 1,
    },
    label: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.secondary,
      letterSpacing: 1.2,
      marginBottom: 4,
    },
    selectedValue: {
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text.primary,
    },
    editIcon: {
      fontSize: 24,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.sm,
    },
    expandButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    expandIcon: {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.light,
      color: theme.colors.text.primary,
    },
    expandedContent: {
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.light,
    },
    // Live Section
    liveSection: {
      marginBottom: theme.spacing.lg,
    },
    liveHeadline: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
      lineHeight: theme.typography.sizes.lg * 1.3,
      marginBottom: theme.spacing.sm,
    },
    healthAdvisory: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.regular,
      color: theme.colors.text.secondary,
      lineHeight: theme.typography.sizes.sm * 1.5,
    },
    // Main Insight
    mainInsight: {
      marginBottom: theme.spacing.lg,
    },
    insightHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    insightText: {
      flex: 1,
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text.primary,
      lineHeight: theme.typography.sizes.base * 1.5,
      marginLeft: theme.spacing.md,
    },
    // Time Window
    timeWindowCompact: {
      backgroundColor: theme.colors.overlay.light,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
    },
    timeWindowLabel: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text.muted,
      marginBottom: theme.spacing.xs,
    },
    timeWindowRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    timeWindowTime: {
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
    },
    timeWindowAqi: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text.secondary,
    },
    // Recommendations
    recommendationsCompact: {
      marginTop: theme.spacing.sm,
    },
    recommendationCompact: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.regular,
      color: theme.colors.text.secondary,
      lineHeight: theme.typography.sizes.sm * 1.6,
      marginBottom: theme.spacing.xs,
    },
    riskDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginTop: 4,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: theme.colors.background.primary,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: '80%',
      paddingBottom: theme.spacing.xxl,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.light,
    },
    modalTitle: {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.bold,
      color: theme.colors.text.primary,
    },
    closeButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 24,
      fontWeight: theme.typography.weights.light,
      color: theme.colors.text.secondary,
    },
    personaList: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
    personaOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      backgroundColor: theme.colors.overlay.light,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    personaOptionSelected: {
      borderColor: theme.colors.text.primary,
      backgroundColor: theme.colors.overlay.medium,
    },
    personaOptionContent: {
      flex: 1,
    },
    personaLabel: {
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    personaLabelSelected: {
      fontWeight: theme.typography.weights.bold,
    },
    personaDescription: {
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.regular,
      color: theme.colors.text.tertiary,
      lineHeight: theme.typography.sizes.sm * 1.4,
    },
    checkmark: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.text.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: theme.spacing.md,
    },
    checkmarkText: {
      color: theme.colors.background.primary,
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.bold,
    },
    modalFooter: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.light,
      marginTop: theme.spacing.md,
    },
    footerText: {
      fontSize: theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.regular,
      color: theme.colors.text.tertiary,
      textAlign: 'center',
      lineHeight: theme.typography.sizes.xs * 1.5,
    },
  });
