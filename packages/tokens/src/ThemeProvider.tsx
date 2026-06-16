import React, { createContext, useContext, useEffect, useState } from "react";

import { themes, themeToCSSVars, type ThemeName } from "./tokens";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
});

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
}

/**
 * Web ThemeProvider — sets `data-theme` on <body> and writes the active theme's
 * CSS custom properties onto <html> via `setProperty`. Consumers read the vars
 * (`--surface-*`, `--ink-*`, `--brand-*`, `--border-*`, `--scrim`) from CSS.
 */
export const ThemeProvider = ({ children, defaultTheme = "light" }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<ThemeName>(defaultTheme);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    const vars = themeToCSSVars(themes[theme]);
    for (const [key, value] of Object.entries(vars)) {
      document.documentElement.style.setProperty(key, value);
    }
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

/** Returns the resolved theme object for the active theme. */
export const useTheme = () => themes[useContext(ThemeContext).theme];
