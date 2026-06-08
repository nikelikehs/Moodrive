import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
export type ColorTheme = 'volt' | 'crimson' | 'blue' | 'green' | 'purple';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isGrayscale: boolean;
  toggleGrayscale: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (color: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('moodrive-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [isGrayscale, setIsGrayscale] = useState<boolean>(() => {
    return localStorage.getItem('moodrive-grayscale') === 'true';
  });

  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const savedColor = localStorage.getItem('moodrive-color-theme');
    if (savedColor === 'volt' || savedColor === 'crimson' || savedColor === 'blue' || savedColor === 'green' || savedColor === 'purple') {
      return savedColor as ColorTheme;
    }
    return 'volt';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('moodrive-theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isGrayscale) {
      root.classList.add('grayscale-mode');
    } else {
      root.classList.remove('grayscale-mode');
    }
    localStorage.setItem('moodrive-grayscale', String(isGrayscale));
  }, [isGrayscale]);

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove previous color theme classes
    root.classList.remove('theme-volt', 'theme-crimson', 'theme-blue', 'theme-green', 'theme-purple');
    // Add current color theme class
    root.classList.add(`theme-${colorTheme}`);
    localStorage.setItem('moodrive-color-theme', colorTheme);
  }, [colorTheme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleGrayscale = () => {
    setIsGrayscale(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isGrayscale, toggleGrayscale, colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

