'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeColor = 'black' | 'default' | 'emerald' | 'rose' | 'amber' | 'violet' | 'cyan' | 'custom';

export interface CustomThemeColors {
  primary: string;
  primaryEnd: string;
  secondary: string;
  secondaryEnd: string;
}

export const DEFAULT_CUSTOM_COLORS: CustomThemeColors = {
  primary: '204 90% 54%',
  primaryEnd: '212 95% 62%',
  secondary: '18 88% 62%',
  secondaryEnd: '12 82% 55%',
};

interface ColorPair {
  light: string;
  dark: string;
}

export interface ThemePreset {
  name: string;
  description: string;
  preview: string;
  primary: ColorPair;
  primaryEnd: ColorPair;
  primaryForeground: ColorPair;
  secondary: ColorPair;
  secondaryEnd: ColorPair;
  secondaryForeground: ColorPair;
  ring: ColorPair;
  sidebarPrimary: ColorPair;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  customColors: CustomThemeColors;
  setCustomColors: (colors: CustomThemeColors) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function linearGradient(from: string, to: string, angle = 135): string {
  return `linear-gradient(${angle}deg, hsl(${from}) 0%, hsl(${to}) 100%)`;
}

export function hexToHslComponents(hex: string): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return DEFAULT_CUSTOM_COLORS.primary;

  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function hslComponentsToHex(hsl: string): string {
  const match = hsl.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!match) return '#3b9eff';

  const h = Number(match[1]) / 360;
  const s = Number(match[2]) / 100;
  const l = Number(match[3]) / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    let value = t;
    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) return p + (q - p) * 6 * value;
    if (value < 1 / 2) return q;
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
    return p;
  };

  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (value: number) => Math.round(value * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function shiftLightness(hsl: string, delta: number): string {
  const match = hsl.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!match) return hsl;
  const nextL = Math.min(100, Math.max(0, Number(match[3]) + delta));
  return `${match[1]} ${match[2]}% ${nextL}%`;
}

/**
 * Light, bright aesthetic palettes for hotel admin.
 *
 * - Airy sky blues, mint, lilac, peach — not dark/muted luxury tones
 * - Saturation ~65–92% for a fresh modern SaaS feel
 * - Soft 135° gradients (sky → lighter blue, etc.)
 * - Secondary = warm/cool pop clearly distinct from primary
 */
export const themePresets: Record<ThemeColor, ThemePreset> = {
  /** Recommended default — bright sky blue + soft peach */
  default: {
    name: 'Sky Blue & Peach',
    description: 'Light · fresh · airy',
    preview: 'bg-sky-400',
    primary: { light: '204 90% 54%', dark: '204 85% 62%' },
    primaryEnd: { light: '212 95% 62%', dark: '210 88% 68%' },
    primaryForeground: { light: '0 0% 100%', dark: '204 40% 12%' },
    secondary: { light: '18 88% 62%', dark: '18 82% 66%' },
    secondaryEnd: { light: '12 82% 55%', dark: '14 78% 58%' },
    secondaryForeground: { light: '0 0% 100%', dark: '0 0% 100%' },
    ring: { light: '204 90% 54%', dark: '204 85% 62%' },
    sidebarPrimary: { light: '204 90% 54%', dark: '204 85% 62%' },
    chart1: '204 90% 54%',
    chart2: '18 88% 62%',
    chart3: '212 95% 62%',
    chart4: '168 65% 48%',
    chart5: '265 75% 62%',
  },

  /** Ice blue + butter — soft neutral bright */
  black: {
    name: 'Ice Blue & Butter',
    description: 'Calm · creamy bright',
    preview: 'bg-sky-300',
    primary: { light: '200 78% 58%', dark: '200 72% 65%' },
    primaryEnd: { light: '208 82% 65%', dark: '206 76% 70%' },
    primaryForeground: { light: '0 0% 100%', dark: '200 35% 12%' },
    secondary: { light: '44 92% 58%', dark: '42 88% 62%' },
    secondaryEnd: { light: '38 88% 50%', dark: '40 84% 54%' },
    secondaryForeground: { light: '38 30% 14%', dark: '38 28% 12%' },
    ring: { light: '200 78% 58%', dark: '200 72% 65%' },
    sidebarPrimary: { light: '200 78% 58%', dark: '200 72% 65%' },
    chart1: '200 78% 58%',
    chart2: '44 92% 58%',
    chart3: '204 90% 54%',
    chart4: '168 65% 48%',
    chart5: '340 70% 65%',
  },

  /** Spa resort — mint green + aqua blue */
  emerald: {
    name: 'Mint & Aqua',
    description: 'Spa · cool fresh',
    preview: 'bg-emerald-400',
    primary: { light: '162 68% 46%', dark: '162 62% 54%' },
    primaryEnd: { light: '170 72% 52%', dark: '168 66% 58%' },
    primaryForeground: { light: '0 0% 100%', dark: '0 0% 100%' },
    secondary: { light: '192 88% 52%', dark: '192 82% 58%' },
    secondaryEnd: { light: '198 85% 46%', dark: '196 78% 50%' },
    secondaryForeground: { light: '0 0% 100%', dark: '0 0% 100%' },
    ring: { light: '162 68% 46%', dark: '162 62% 54%' },
    sidebarPrimary: { light: '162 68% 46%', dark: '162 62% 54%' },
    chart1: '162 68% 46%',
    chart2: '192 88% 52%',
    chart3: '204 90% 54%',
    chart4: '44 92% 58%',
    chart5: '265 75% 62%',
  },

  /** Soft aesthetic — lilac + blush pink */
  rose: {
    name: 'Lilac & Blush',
    description: 'Soft · dreamy',
    preview: 'bg-violet-300',
    primary: { light: '262 78% 62%', dark: '262 72% 68%' },
    primaryEnd: { light: '270 75% 68%', dark: '268 68% 72%' },
    primaryForeground: { light: '0 0% 100%', dark: '262 30% 14%' },
    secondary: { light: '340 72% 62%', dark: '340 68% 66%' },
    secondaryEnd: { light: '330 68% 55%', dark: '332 64% 58%' },
    secondaryForeground: { light: '0 0% 100%', dark: '0 0% 100%' },
    ring: { light: '262 78% 62%', dark: '262 72% 68%' },
    sidebarPrimary: { light: '262 78% 62%', dark: '262 72% 68%' },
    chart1: '262 78% 62%',
    chart2: '340 72% 62%',
    chart3: '204 90% 54%',
    chart4: '162 68% 46%',
    chart5: '44 92% 58%',
  },

  /** Energetic — azure blue + sunshine yellow */
  amber: {
    name: 'Azure & Sunshine',
    description: 'Bright · optimistic',
    preview: 'bg-blue-400',
    primary: { light: '214 88% 54%', dark: '214 82% 62%' },
    primaryEnd: { light: '220 92% 60%', dark: '218 86% 66%' },
    primaryForeground: { light: '0 0% 100%', dark: '214 35% 12%' },
    secondary: { light: '42 96% 56%', dark: '42 92% 60%' },
    secondaryEnd: { light: '36 92% 48%', dark: '38 88% 52%' },
    secondaryForeground: { light: '36 28% 14%', dark: '36 26% 12%' },
    ring: { light: '214 88% 54%', dark: '214 82% 62%' },
    sidebarPrimary: { light: '214 88% 54%', dark: '214 82% 62%' },
    chart1: '214 88% 54%',
    chart2: '42 96% 56%',
    chart3: '204 90% 54%',
    chart4: '18 88% 62%',
    chart5: '162 68% 46%',
  },

  /** Periwinkle + lavender — Instagram-soft aesthetic */
  violet: {
    name: 'Periwinkle & Lavender',
    description: 'Pastel · modern',
    preview: 'bg-indigo-300',
    primary: { light: '228 78% 62%', dark: '228 72% 68%' },
    primaryEnd: { light: '236 75% 68%', dark: '234 68% 72%' },
    primaryForeground: { light: '0 0% 100%', dark: '228 30% 14%' },
    secondary: { light: '278 68% 62%', dark: '278 64% 66%' },
    secondaryEnd: { light: '288 62% 55%', dark: '284 58% 58%' },
    secondaryForeground: { light: '0 0% 100%', dark: '0 0% 100%' },
    ring: { light: '228 78% 62%', dark: '228 72% 68%' },
    sidebarPrimary: { light: '228 78% 62%', dark: '228 72% 68%' },
    chart1: '228 78% 62%',
    chart2: '278 68% 62%',
    chart3: '204 90% 54%',
    chart4: '340 72% 62%',
    chart5: '162 68% 46%',
  },

  /** Coastal bright — ocean cyan + coral pop */
  cyan: {
    name: 'Ocean & Coral',
    description: 'Coastal · vibrant',
    preview: 'bg-cyan-400',
    primary: { light: '188 72% 46%', dark: '188 66% 54%' },
    primaryEnd: { light: '196 78% 52%', dark: '194 72% 58%' },
    primaryForeground: { light: '0 0% 100%', dark: '0 0% 100%' },
    secondary: { light: '12 82% 60%', dark: '12 78% 64%' },
    secondaryEnd: { light: '6 76% 52%', dark: '8 72% 56%' },
    secondaryForeground: { light: '0 0% 100%', dark: '0 0% 100%' },
    ring: { light: '188 72% 46%', dark: '188 66% 54%' },
    sidebarPrimary: { light: '188 72% 46%', dark: '188 66% 54%' },
    chart1: '188 72% 46%',
    chart2: '12 82% 60%',
    chart3: '204 90% 54%',
    chart4: '262 78% 62%',
    chart5: '42 96% 56%',
  },

  custom: {
    name: 'Custom',
    description: 'Pick your own colors',
    preview: 'bg-gradient-to-r from-sky-400 to-orange-400',
    primary: { light: DEFAULT_CUSTOM_COLORS.primary, dark: DEFAULT_CUSTOM_COLORS.primary },
    primaryEnd: { light: DEFAULT_CUSTOM_COLORS.primaryEnd, dark: DEFAULT_CUSTOM_COLORS.primaryEnd },
    primaryForeground: { light: '0 0% 100%', dark: '0 0% 100%' },
    secondary: { light: DEFAULT_CUSTOM_COLORS.secondary, dark: DEFAULT_CUSTOM_COLORS.secondary },
    secondaryEnd: { light: DEFAULT_CUSTOM_COLORS.secondaryEnd, dark: DEFAULT_CUSTOM_COLORS.secondaryEnd },
    secondaryForeground: { light: '0 0% 100%', dark: '0 0% 100%' },
    ring: { light: DEFAULT_CUSTOM_COLORS.primary, dark: DEFAULT_CUSTOM_COLORS.primary },
    sidebarPrimary: { light: DEFAULT_CUSTOM_COLORS.primary, dark: DEFAULT_CUSTOM_COLORS.primary },
    chart1: DEFAULT_CUSTOM_COLORS.primary,
    chart2: DEFAULT_CUSTOM_COLORS.secondary,
    chart3: DEFAULT_CUSTOM_COLORS.primaryEnd,
    chart4: '168 65% 48%',
    chart5: '265 75% 62%',
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>('default');
  const [customColors, setCustomColorsState] = useState<CustomThemeColors>(DEFAULT_CUSTOM_COLORS);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  const applyThemeColors = (color: ThemeColor, dark: boolean, custom: CustomThemeColors) => {
    const preset = themePresets[color];
    const root = document.documentElement;
    const mode = dark ? 'dark' : 'light';

    const primary = color === 'custom' ? custom.primary : preset.primary[mode];
    const primaryEnd = color === 'custom' ? custom.primaryEnd : preset.primaryEnd[mode];
    const secondary = color === 'custom' ? custom.secondary : preset.secondary[mode];
    const secondaryEnd = color === 'custom' ? custom.secondaryEnd : preset.secondaryEnd[mode];
    const primaryForeground = color === 'custom' ? '0 0% 100%' : preset.primaryForeground[mode];
    const secondaryForeground = color === 'custom' ? '0 0% 100%' : preset.secondaryForeground[mode];
    const ring = color === 'custom' ? custom.primary : preset.ring[mode];
    const sidebarPrimary = color === 'custom' ? custom.primary : preset.sidebarPrimary[mode];

    root.style.setProperty('--primary', primary);
    root.style.setProperty('--primary-end', primaryEnd);
    root.style.setProperty('--primary-foreground', primaryForeground);
    root.style.setProperty('--theme-secondary', secondary);
    root.style.setProperty('--theme-secondary-end', secondaryEnd);
    root.style.setProperty('--theme-secondary-foreground', secondaryForeground);
    root.style.setProperty('--ring', ring);
    root.style.setProperty('--sidebar-primary', sidebarPrimary);
    root.style.setProperty('--sidebar-primary-foreground', primaryForeground);
    root.style.setProperty('--sidebar-ring', ring);

    root.style.setProperty('--primary-gradient', linearGradient(primary, primaryEnd));
    root.style.setProperty('--theme-secondary-gradient', linearGradient(secondary, secondaryEnd));
    root.style.setProperty(
      '--surface-gradient',
      dark
        ? `radial-gradient(ellipse 130% 80% at 50% -20%, hsl(${primary} / 0.18) 0%, transparent 65%)`
        : `radial-gradient(ellipse 130% 80% at 50% -20%, hsl(${primary} / 0.14) 0%, transparent 65%)`
    );

    root.style.setProperty('--chart-1', color === 'custom' ? custom.primary : preset.chart1);
    root.style.setProperty('--chart-2', color === 'custom' ? custom.secondary : preset.chart2);
    root.style.setProperty('--chart-3', color === 'custom' ? custom.primaryEnd : preset.chart3);
    root.style.setProperty('--chart-4', preset.chart4);
    root.style.setProperty('--chart-5', preset.chart5);
  };

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme-color') as ThemeColor;
    const savedDark = localStorage.getItem('dark-mode') === 'true';
    const savedCustom = localStorage.getItem('theme-custom-colors');

    if (savedCustom) {
      try {
        const parsed = JSON.parse(savedCustom) as CustomThemeColors;
        setCustomColorsState({ ...DEFAULT_CUSTOM_COLORS, ...parsed });
      } catch {
        setCustomColorsState(DEFAULT_CUSTOM_COLORS);
      }
    }

    if (savedTheme && themePresets[savedTheme]) {
      setThemeColorState(savedTheme);
    }
    setIsDark(savedDark);

    if (savedDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const initialTheme = savedTheme && themePresets[savedTheme] ? savedTheme : 'default';
    let initialCustom = DEFAULT_CUSTOM_COLORS;
    if (savedCustom) {
      try {
        initialCustom = { ...DEFAULT_CUSTOM_COLORS, ...JSON.parse(savedCustom) as CustomThemeColors };
      } catch {
        initialCustom = DEFAULT_CUSTOM_COLORS;
      }
    }
    applyThemeColors(initialTheme, savedDark, initialCustom);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyThemeColors(themeColor, isDark, customColors);
    localStorage.setItem('theme-color', themeColor);
  }, [themeColor, isDark, customColors, mounted]);

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
  };

  const setCustomColors = (colors: CustomThemeColors) => {
    setCustomColorsState(colors);
    localStorage.setItem('theme-custom-colors', JSON.stringify(colors));
    setThemeColorState('custom');
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

  const contextValue = useMemo(
    () => ({ themeColor, setThemeColor, customColors, setCustomColors, isDark, toggleDarkMode }),
    [themeColor, customColors, isDark]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
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
