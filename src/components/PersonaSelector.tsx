/**
 * Persona Selector Component
 * Allows users to select their role/persona for personalized insights
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { usePersona } from '../contexts/PersonaContext';
import { PersonaType } from '../types/airQuality';
import { ScribbleText } from './scribble/ScribbleText';

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
          <ScribbleText size="xs" weight="bold" color={theme.colors.text.muted} style={styles.label}>
            YOUR ROLE
          </ScribbleText>
          <ScribbleText size="base" weight="bold" color={theme.colors.text.primary}>
            {selectedPersonaLabel}
          </ScribbleText>
        </View>
        <ScribbleText size="xl" weight="regular" color={theme.colors.text.secondary}>
          ›
        </ScribbleText>
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
              <ScribbleText size="xl" weight="bold" color={theme.colors.text.primary}>
                Select Your Role
              </ScribbleText>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <ScribbleText size="xxl" weight="regular" color={theme.colors.text.secondary}>
                  ✕
                </ScribbleText>
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
                    <ScribbleText
                      size="base"
                      weight={persona === p.type ? "bold" : "bold"}
                      color={theme.colors.text.primary}
                      style={styles.personaLabel}
                    >
                      {p.label}
                    </ScribbleText>
                    <ScribbleText size="sm" color={theme.colors.text.tertiary} style={styles.personaDescription}>
                      {p.description}
                    </ScribbleText>
                  </View>
                  {persona === p.type && (
                    <View style={styles.checkmark}>
                      <ScribbleText size="base" weight="bold" color={theme.colors.background.primary}>
                        ✓
                      </ScribbleText>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <ScribbleText size="xs" color={theme.colors.text.tertiary} style={styles.footerText}>
                Changing your role will fetch personalized air quality insights
              </ScribbleText>
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
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
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
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  personaDescription: {
    lineHeight: theme.typography.sizes.sm * 1.5,
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
  modalFooter: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    marginTop: theme.spacing.md,
  },
  footerText: {
    textAlign: 'center',
    lineHeight: theme.typography.sizes.xs * 1.6,
  },
});
