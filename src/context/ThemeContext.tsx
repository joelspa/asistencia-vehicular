import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, AppColors } from '../theme/colors';

export type ThemePreference = 'auto' | 'light' | 'dark';

interface ThemeContextValue {
  colors: AppColors;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  preference: 'auto',
  setPreference: () => {},
});

const STORAGE_KEY = '@mecanicaya_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('auto');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === 'light' || v === 'dark' || v === 'auto') setPreferenceState(v);
    });
  }, []);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    AsyncStorage.setItem(STORAGE_KEY, p);
  }, []);

  const isDark = preference === 'auto' ? systemScheme === 'dark' : preference === 'dark';

  const value = useMemo<ThemeContextValue>(() => ({
    colors: isDark ? darkColors : lightColors,
    isDark,
    preference,
    setPreference,
  }), [isDark, preference, setPreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
export const useColors = () => useContext(ThemeContext).colors;
