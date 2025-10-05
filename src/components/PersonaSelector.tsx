/**
 * Persona Selector Component
 * Allows users to select their role/persona for personalized insights
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { usePersona } from '../contexts/PersonaContext';
import { PersonaType } from '../types/airQuality';

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

export const PersonaSelector: React.FC = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { persona, setPersona } = usePersona();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedPersonaLabel = PERSONAS.find(p => p.type === persona)?.label || 'Select Role';

  const handleSelectPersona = async (type: PersonaType) => {
    try {
      await setPersona(type);
      setModalVisible(false);
    } catch (error) {
      console.error('[PersonaSelector] Error setting persona:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.selectorContent}>
          <Text style={styles.label}>Your Role</Text>
          <Text style={styles.selectedValue}>{selectedPersonaLabel}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

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
                    <Text style={[
                      styles.personaLabel,
                      persona === p.type && styles.personaLabelSelected,
                    ]}>
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

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.overlay.light,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  selectorContent: {
    flex: 1,
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  selectedValue: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  chevron: {
    fontSize: 24,
    fontWeight: theme.typography.weights.light,
    color: theme.colors.text.secondary,
  },
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
