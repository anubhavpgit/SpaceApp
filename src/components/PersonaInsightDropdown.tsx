/**
 * Persona Insight Dropdown Component
 * Expandable card that shows persona selector and persona-specific insights
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { usePersona } from '../contexts/PersonaContext';
import { PersonaType, PersonaInsights } from '../types/airQuality';
import { Card, CardContent } from './ui/Card';

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
}

export const PersonaInsightDropdown: React.FC<PersonaInsightDropdownProps> = ({ insights }) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { persona, setPersona } = usePersona();
  const [expanded, setExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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
    <View style={styles.container}>
      <Card variant="elevated" style={styles.card}>
        <CardContent style={styles.cardContent}>
          {/* Header - Always Visible */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.personaButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.personaInfo}>
                <Text style={styles.label}>YOUR ROLE</Text>
                <Text style={styles.selectedValue}>{selectedPersonaLabel}</Text>
              </View>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>

            {insights && (
              <TouchableOpacity
                style={styles.expandButton}
                onPress={toggleExpanded}
                activeOpacity={0.7}
              >
                <Text style={styles.expandIcon}>{expanded ? '−' : '+'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Expanded Content - Persona Insights */}
          {expanded && insights && (
            <View style={styles.expandedContent}>
              {/* Risk Assessment */}
              <View style={styles.riskHeader}>
                <Text style={styles.sectionLabel}>WHAT THIS MEANS FOR YOU</Text>
                <View style={[styles.riskBadge, { backgroundColor: getRiskColor() + '20' }]}>
                  <View style={[styles.riskDot, { backgroundColor: getRiskColor() }]} />
                  <Text style={[styles.riskText, { color: getRiskColor() }]}>
                    {insights.risk_assessment.level.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Immediate Action */}
              <View style={styles.immediateActionContainer}>
                <Text style={styles.immediateActionLabel}>IMMEDIATE ACTION</Text>
                <Text style={styles.immediateActionText}>{insights.immediate_action}</Text>
              </View>

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

              {/* Key Insight */}
              {insights.key_insight && (
                <View style={[styles.section, styles.keyInsightSection]}>
                  <Text style={styles.keyInsightLabel}>KEY INSIGHT</Text>
                  <Text style={styles.keyInsightText}>{insights.key_insight}</Text>
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
                    <Text style={styles.personaDescription}>{p.description}</Text>
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
              <Text style={styles.footerText}>
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
    cardContent: {
      paddingVertical: theme.spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
      color: theme.colors.text.muted,
      letterSpacing: 1.2,
      marginBottom: 4,
    },
    selectedValue: {
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.semibold,
      color: theme.colors.text.primary,
    },
    editIcon: {
      fontSize: theme.typography.sizes.base,
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
      marginTop: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.light,
    },
    riskHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
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
      marginBottom: theme.spacing.lg,
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
