import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Language, getCurrentLanguage, applyLanguage } from '@/lib/i18n';
import { getReadableTimezone } from '@/lib/dateUtils';

// Interface for the account preferences
interface AccountPreferences {
  language: Language;
  timezone: 'utc' | 'est' | 'pst';
}

// Default preferences
const defaultPreferences: AccountPreferences = {
  language: 'en',
  timezone: 'utc'
};

// Context interface
interface SettingsContextType {
  preferences: AccountPreferences;
  setLanguage: (language: Language) => void;
  setTimezone: (timezone: 'utc' | 'est' | 'pst') => void;
  savePreferences: () => void;
  readableTimezone: string;
  forceRefresh: () => void;
}

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider props
interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [preferences, setPreferences] = useState<AccountPreferences>(defaultPreferences);
  const [readableTimezone, setReadableTimezone] = useState<string>(getReadableTimezone());
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const loadPreferences = () => {
      const savedPrefs = localStorage.getItem('accountPreferences');
      if (savedPrefs) {
        try {
          const prefs = JSON.parse(savedPrefs) as AccountPreferences;
          setPreferences(prefs);
          setReadableTimezone(getReadableTimezone());
        } catch (e) {
          console.error('Failed to parse saved account preferences');
        }
      }
    };

    loadPreferences();

    // Listen for storage events (in case preferences are changed in another tab)
    window.addEventListener('storage', loadPreferences);
    return () => {
      window.removeEventListener('storage', loadPreferences);
    };
  }, []);

  // Set language
  const setLanguage = (language: Language) => {
    setPreferences(prev => ({ ...prev, language }));
  };

  // Set timezone
  const setTimezone = (timezone: 'utc' | 'est' | 'pst') => {
    setPreferences(prev => ({ ...prev, timezone }));
    setReadableTimezone(getReadableTimezone());
  };

  // Save preferences to localStorage
  const savePreferences = () => {
    localStorage.setItem('accountPreferences', JSON.stringify(preferences));
    document.documentElement.lang = preferences.language;
    
    // Apply language changes immediately
    applyLanguage();
    
    // Dispatch a storage event to notify other tabs
    window.dispatchEvent(new Event('storage'));
    
    // Force update timezone readable value
    setReadableTimezone(getReadableTimezone());
  };

  // Force a refresh of components using this context
  const forceRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };

  const value = {
    preferences,
    setLanguage,
    setTimezone,
    savePreferences,
    readableTimezone,
    forceRefresh
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook for using settings context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 