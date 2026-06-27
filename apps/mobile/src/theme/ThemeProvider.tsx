import React, { createContext, useContext } from 'react';
import { AppTheme, lightTheme } from './theme';

const ThemeContext = createContext<AppTheme>(lightTheme);

/**
 * ThemeProvider supplies the design system theme to the entire component tree.
 *
 * Usage: Wrap the root of the app in <ThemeProvider> and consume via useTheme().
 * V1 ships with lightTheme only. V2 will add a 'theme' prop to toggle dark mode.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <ThemeContext.Provider value={lightTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme — the primary hook for accessing design tokens inside components.
 *
 * @example
 * const { colors, spacing, fontSize } = useTheme();
 */
export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}
