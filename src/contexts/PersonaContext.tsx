/**
 * Persona Context
 * Manages user persona selection and persistence
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersonaType } from '../types/airQuality';

const PERSONA_STORAGE_KEY = '@clearskies:selectedPersona';

interface PersonaContextType {
  persona: PersonaType;
  setPersona: (persona: PersonaType) => Promise<void>;
  isLoading: boolean;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

interface PersonaProviderProps {
  children: ReactNode;
}

export const PersonaProvider: React.FC<PersonaProviderProps> = ({ children }) => {
  const [persona, setPersonaState] = useState<PersonaType>('general');
  const [isLoading, setIsLoading] = useState(true);

  // Load persona from storage on mount
  useEffect(() => {
    loadPersona();
  }, []);

  const loadPersona = async () => {
    try {
      const stored = await AsyncStorage.getItem(PERSONA_STORAGE_KEY);
      if (stored) {
        setPersonaState(stored as PersonaType);
        console.log('[PersonaContext] Loaded persona from storage:', stored);
      } else {
        console.log('[PersonaContext] No stored persona, using default: general');
      }
    } catch (error) {
      console.error('[PersonaContext] Error loading persona:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setPersona = async (newPersona: PersonaType) => {
    try {
      console.log('[PersonaContext] Setting persona:', newPersona);
      setPersonaState(newPersona);
      await AsyncStorage.setItem(PERSONA_STORAGE_KEY, newPersona);
      console.log('[PersonaContext] Persona saved to storage');
    } catch (error) {
      console.error('[PersonaContext] Error saving persona:', error);
      throw error;
    }
  };

  return (
    <PersonaContext.Provider value={{ persona, setPersona, isLoading }}>
      {children}
    </PersonaContext.Provider>
  );
};

// Hook to use persona context
export const usePersona = (): PersonaContextType => {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
};
