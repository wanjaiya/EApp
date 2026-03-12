import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useStorageState } from '../hooks/useStorageState';

export type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  currentTheme: 'light' | 'dark';
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  currentTheme: 'dark',
  setTheme: () => null,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // Get system color scheme and normalize to 'light' | 'dark'
  const rawColorScheme = useColorScheme(); // 'light' | 'dark' | 'no-preference' | null
  const systemColorScheme: 'light' | 'dark' = rawColorScheme === 'dark' ? 'dark' : 'light';

  // Persistent theme from storage
  const [[, storedTheme], setStoredTheme] = useStorageState('theme');

  const [theme, setThemeState] = useState<ThemeType>('system');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(
    systemColorScheme
  );

  // Initialize theme from storage
  useEffect(() => {
    if (storedTheme) {
      setThemeState(storedTheme as ThemeType);
    } else {
      setThemeState('system');
    }
  }, [storedTheme]);

  // Update current theme whenever theme or systemColorScheme changes
  useEffect(() => {
    setCurrentTheme(theme === 'system' ? systemColorScheme : theme);
  }, [theme, systemColorScheme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    setStoredTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};