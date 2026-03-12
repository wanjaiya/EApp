import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { useStorageState } from '../hooks/useStorageState';

export type ThemeType = 'light' | 'dark' | 'system';
type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  currentTheme: 'light' | 'dark';
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  currentTheme: 'light',
  setTheme: () => null,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get the system color scheme (can be 'light' | 'dark' | 'no-preference' | null)
  const rawColorScheme = useColorScheme();
  const systemColorScheme: 'light' | 'dark' = rawColorScheme === 'dark' ? 'dark' : 'light';

  // Persistent theme storage
  const [[, storedTheme], setStoredTheme] = useStorageState('theme');

  const [theme, setThemeState] = useState<ThemeType>('system');
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('light');

  // Initialize theme from storage (or default to system)
  useEffect(() => {
    if (storedTheme) {
      setThemeState(storedTheme as ThemeType);
    } else {
      setThemeState('system');
    }
  }, [storedTheme]);

  // Update currentTheme whenever theme or system color scheme changes
  useEffect(() => {
   if (rawColorScheme === 'dark') {
      setCurrentTheme('dark');
    } else {
      setCurrentTheme('light'); // default for 'light', null, or 'no-preference'
    }
  }, [rawColorScheme]);
  

  

  // Setter function: updates both state and persistent storage
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