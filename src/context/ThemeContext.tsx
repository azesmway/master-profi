import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

interface ThemeContextValue {
  isDark:      boolean;
  colorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark:      false,
  colorScheme: 'light',
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark      = colorScheme === 'dark';

  return (
    <ThemeContext.Provider value={{ isDark, colorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
