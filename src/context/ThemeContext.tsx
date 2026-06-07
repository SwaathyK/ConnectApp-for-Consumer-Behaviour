import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLOR, FONTS } from '../utils/tokens';
import { MW_COLOR, MW_FONTS } from '../utils/mywarwickTokens';

export type AppTheme = 'editorial' | 'mywarwick';

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  toggleTheme: () => void;
  colors: typeof COLOR | typeof MW_COLOR;
  fonts: typeof FONTS | typeof MW_FONTS;
  isMyWarwick: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = '@connect_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('editorial');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'mywarwick' || saved === 'editorial') setThemeState(saved);
    });
  }, []);

  const setTheme = useCallback((t: AppTheme) => {
    setThemeState(t);
    AsyncStorage.setItem(THEME_KEY, t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'editorial' ? 'mywarwick' : 'editorial');
  }, [theme, setTheme]);

  const isMyWarwick = theme === 'mywarwick';

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      colors: isMyWarwick ? MW_COLOR : COLOR,
      fonts:  isMyWarwick ? MW_FONTS : FONTS,
      isMyWarwick,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
