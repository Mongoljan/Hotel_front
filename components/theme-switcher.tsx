'use client';

import React, { useEffect, useState } from 'react';
import {
  useTheme,
  themePresets,
  ThemeColor,
  hexToHslComponents,
  hslComponentsToHex,
  shiftLightness,
  type CustomThemeColors,
} from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconPalette, IconCheck, IconSun, IconMoon } from '@tabler/icons-react';

const themeColors: ThemeColor[] = ['default', 'black', 'emerald', 'rose', 'amber', 'violet', 'cyan', 'custom'];

function getGradientPreviewStyle(color: ThemeColor, isDark: boolean, customColors: CustomThemeColors) {
  const preset = themePresets[color];
  const mode = isDark ? 'dark' : 'light';
  const primary = color === 'custom' ? customColors.primary : preset.primary[mode];
  const primaryEnd = color === 'custom' ? customColors.primaryEnd : preset.primaryEnd[mode];
  const secondary = color === 'custom' ? customColors.secondary : preset.secondary[mode];
  const secondaryEnd = color === 'custom' ? customColors.secondaryEnd : preset.secondaryEnd[mode];

  return {
    primary: {
      backgroundImage: `linear-gradient(135deg, hsl(${primary}) 0%, hsl(${primaryEnd}) 100%)`,
    },
    secondary: {
      backgroundImage: `linear-gradient(135deg, hsl(${secondary}) 0%, hsl(${secondaryEnd}) 100%)`,
    },
    blend: {
      backgroundImage: `linear-gradient(90deg, hsl(${primary}) 0%, hsl(${secondary}) 100%)`,
    },
  };
}

export function ThemeSwitcher() {
  const { themeColor, setThemeColor, customColors, setCustomColors, isDark, toggleDarkMode } = useTheme();
  const [primaryHex, setPrimaryHex] = useState(() => hslComponentsToHex(customColors.primary));
  const [secondaryHex, setSecondaryHex] = useState(() => hslComponentsToHex(customColors.secondary));

  useEffect(() => {
    setPrimaryHex(hslComponentsToHex(customColors.primary));
    setSecondaryHex(hslComponentsToHex(customColors.secondary));
  }, [customColors.primary, customColors.secondary]);

  const applyCustomPrimary = (hex: string) => {
    setPrimaryHex(hex);
    const primary = hexToHslComponents(hex);
    setCustomColors({
      ...customColors,
      primary,
      primaryEnd: shiftLightness(primary, 6),
    });
  };

  const applyCustomSecondary = (hex: string) => {
    setSecondaryHex(hex);
    const secondary = hexToHslComponents(hex);
    setCustomColors({
      ...customColors,
      secondary,
      secondaryEnd: shiftLightness(secondary, -6),
    });
  };

  const customPreview = getGradientPreviewStyle('custom', isDark, customColors);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <IconPalette className="h-5 w-5" />
          <span className="sr-only">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Өнгийн хослол</DropdownMenuLabel>
        <p className="px-2 pb-2 text-sm text-muted-foreground leading-snug">
          Цэвэр, гэрэлтүүлсэн gradient · sky blue, mint, lilac гэх мэт
        </p>
        <DropdownMenuSeparator />

        <div className="grid grid-cols-2 gap-2 p-2">
          {themeColors.map((color) => {
            if (color === 'custom') return null;
            const preset = themePresets[color];
            const isActive = themeColor === color;
            const preview = getGradientPreviewStyle(color, isDark, customColors);

            return (
              <button
                key={color}
                type="button"
                onClick={() => setThemeColor(color)}
                className={`relative flex flex-col items-center gap-1.5 rounded-lg border p-2.5 transition-all hover:bg-muted text-left ${
                  isActive ? 'border-primary bg-muted ring-2 ring-primary/30' : 'border-border'
                }`}
              >
                <div className="relative h-10 w-full overflow-hidden rounded-md shadow-sm ring-1 ring-black/5">
                  <div className="absolute inset-0 flex">
                    <div className="h-full w-1/2" style={preview.primary} title="Primary" />
                    <div className="h-full w-1/2" style={preview.secondary} title="Secondary" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1" style={preview.blend} />
                  {isActive && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <IconCheck className="h-4 w-4 text-white drop-shadow" />
                    </span>
                  )}
                </div>
                <span className="w-full text-sm font-medium leading-tight text-foreground">
                  {preset.name}
                </span>
                <span className="w-full text-xs leading-tight text-muted-foreground">
                  {preset.description}
                </span>
              </button>
            );
          })}
        </div>

        <DropdownMenuSeparator />

        <div className="px-2 pb-2 space-y-3">
          <button
            type="button"
            onClick={() => setThemeColor('custom')}
            className={`w-full flex flex-col items-center gap-1.5 rounded-lg border p-2.5 transition-all hover:bg-muted text-left ${
              themeColor === 'custom' ? 'border-primary bg-muted ring-2 ring-primary/30' : 'border-border'
            }`}
          >
            <div className="relative h-10 w-full overflow-hidden rounded-md shadow-sm ring-1 ring-black/5">
              <div className="absolute inset-0 flex">
                <div className="h-full w-1/2" style={customPreview.primary} />
                <div className="h-full w-1/2" style={customPreview.secondary} />
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1" style={customPreview.blend} />
              {themeColor === 'custom' && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <IconCheck className="h-4 w-4 text-white drop-shadow" />
                </span>
              )}
            </div>
            <span className="w-full text-sm font-medium leading-tight text-foreground">
              {themePresets.custom.name}
            </span>
            <span className="w-full text-xs leading-tight text-muted-foreground">
              Өөрийн үндсэн ба хоёрдогч өнгө сонгох
            </span>
          </button>

          {themeColor === 'custom' && (
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground shrink-0">Үндсэн өнгө</span>
                <input
                  type="color"
                  value={primaryHex}
                  onChange={e => applyCustomPrimary(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded-md border border-border bg-background p-0.5"
                  aria-label="Үндсэн өнгө"
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground shrink-0">Хоёрдогч өнгө</span>
                <input
                  type="color"
                  value={secondaryHex}
                  onChange={e => applyCustomSecondary(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded-md border border-border bg-background p-0.5"
                  aria-label="Хоёрдогч өнгө"
                />
              </label>
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={toggleDarkMode} className="cursor-pointer">
          {isDark ? (
            <>
              <IconSun className="mr-2 h-4 w-4" />
              Гэрэлтэй горим
            </>
          ) : (
            <>
              <IconMoon className="mr-2 h-4 w-4" />
              Харанхуй горим
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
