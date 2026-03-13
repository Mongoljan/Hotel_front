'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeColor = 'default' | 'emerald' | 'rose' | 'amber' | 'violet' | 'cyan';

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Simplified theme presets - ONLY primary/accent colors change
// Text colors stay neutral (slate-based) and only change between light/dark mode
export const themePresets: Record<ThemeColor, {
  name: string;
  preview: string;
  primary: { light: string; dark: string };
  primaryForeground: { light: string; dark: string };
  ring: { light: string; dark: string };
  sidebarPrimary: { light: string; dark: string };
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}> = {
  default: {
    name: 'Blue',
    preview: 'bg-blue-500',
    primary: { light: '221 83% 53%', dark: '217 91% 60%' },
    primaryForeground: { light: '0 0% 100%', dark: '222 47% 11%' },
    ring: { light: '221 83% 53%', dark: '217 91% 60%' },
    sidebarPrimary: { light: '221 83% 53%', dark: '217 91% 60%' },
    chart1: '221 83% 53%',
    chart2: '160 84% 39%',
    chart3: '38 92% 50%',
    chart4: '280 65% 60%',
    chart5: '340 75% 55%',
  },
  emerald: {
    name: 'Emerald',
    preview: 'bg-emerald-500',
    primary: { light: '160 84% 39%', dark: '160 84% 45%' },
    primaryForeground: { light: '0 0% 100%', dark: '160 84% 10%' },
    ring: { light: '160 84% 39%', dark: '160 84% 45%' },
    sidebarPrimary: { light: '160 84% 39%', dark: '160 84% 45%' },
    chart1: '160 84% 39%',
    chart2: '173 58% 39%',
    chart3: '142 76% 36%',
    chart4: '158 64% 52%',
    chart5: '172 66% 50%',
  },
  rose: {
    name: 'Rose',
    preview: 'bg-rose-500',
    primary: { light: '351 83% 61%', dark: '351 83% 65%' },
    primaryForeground: { light: '0 0% 100%', dark: '351 83% 10%' },
    ring: { light: '351 83% 61%', dark: '351 83% 65%' },
    sidebarPrimary: { light: '351 83% 61%', dark: '351 83% 65%' },
    chart1: '351 83% 61%',
    chart2: '330 81% 60%',
    chart3: '10 78% 54%',
    chart4: '340 82% 52%',
    chart5: '0 72% 51%',
  },
  amber: {
    name: 'Amber',
    preview: 'bg-amber-500',
    primary: { light: '38 92% 50%', dark: '38 92% 55%' },
    primaryForeground: { light: '38 92% 10%', dark: '38 92% 10%' },
    ring: { light: '38 92% 50%', dark: '38 92% 55%' },
    sidebarPrimary: { light: '38 92% 50%', dark: '38 92% 55%' },
    chart1: '38 92% 50%',
    chart2: '25 95% 53%',
    chart3: '45 93% 47%',
    chart4: '32 95% 44%',
    chart5: '20 90% 48%',
  },
  violet: {
    name: 'Violet',
    preview: 'bg-violet-500',
    primary: { light: '258 90% 66%', dark: '258 90% 70%' },
    primaryForeground: { light: '0 0% 100%', dark: '258 90% 10%' },
    ring: { light: '258 90% 66%', dark: '258 90% 70%' },
    sidebarPrimary: { light: '258 90% 66%', dark: '258 90% 70%' },
    chart1: '258 90% 66%',
    chart2: '280 65% 60%',
    chart3: '240 60% 60%',
    chart4: '270 76% 53%',
    chart5: '290 67% 50%',
  },
  cyan: {
    name: 'Cyan',
    preview: 'bg-cyan-500',
    primary: { light: '188 94% 43%', dark: '188 94% 50%' },
    primaryForeground: { light: '0 0% 100%', dark: '188 94% 10%' },
    ring: { light: '188 94% 43%', dark: '188 94% 50%' },
    sidebarPrimary: { light: '188 94% 43%', dark: '188 94% 50%' },
    chart1: '188 94% 43%',
    chart2: '173 80% 40%',
    chart3: '199 89% 48%',
    chart4: '192 91% 37%',
    chart5: '180 65% 45%',
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>('default');
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Apply theme colors - only primary/accent, keeps text neutral
  const applyThemeColors = (color: ThemeColor, dark: boolean) => {
    const preset = themePresets[color];
    const root = document.documentElement;
    const mode = dark ? 'dark' : 'light';
    
    // Only change accent colors, not text/foreground colors
    root.style.setProperty('--primary', preset.primary[mode]);
    root.style.setProperty('--primary-foreground', preset.primaryForeground[mode]);
    root.style.setProperty('--ring', preset.ring[mode]);
    root.style.setProperty('--sidebar-primary', preset.sidebarPrimary[mode]);
    root.style.setProperty('--sidebar-primary-foreground', preset.primaryForeground[mode]);
    root.style.setProperty('--sidebar-ring', preset.ring[mode]);
    
    // Chart colors
    root.style.setProperty('--chart-1', preset.chart1);
    root.style.setProperty('--chart-2', preset.chart2);
    root.style.setProperty('--chart-3', preset.chart3);
    root.style.setProperty('--chart-4', preset.chart4);
    root.style.setProperty('--chart-5', preset.chart5);
  };

  useEffect(() => {
    setMounted(true);
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme-color') as ThemeColor;
    const savedDark = localStorage.getItem('dark-mode') === 'true';
    
    if (savedTheme && themePresets[savedTheme]) {
      setThemeColorState(savedTheme);
    }
    setIsDark(savedDark);
    
    // Apply dark mode class
    if (savedDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply initial theme colors
    const initialTheme = savedTheme && themePresets[savedTheme] ? savedTheme : 'default';
    applyThemeColors(initialTheme, savedDark);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyThemeColors(themeColor, isDark);
    localStorage.setItem('theme-color', themeColor);
  }, [themeColor, isDark, mounted]);

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
  };

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const newValue = !prev;
      localStorage.setItem('dark-mode', String(newValue));
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newValue;
    });
  };

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor, isDark, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
