'use client';

import React from 'react';
import { useTheme, themePresets, ThemeColor } from '@/context/ThemeContext';
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

export function ThemeSwitcher() {
  const { themeColor, setThemeColor, isDark, toggleDarkMode } = useTheme();

  const themeColors: ThemeColor[] = ['default', 'emerald', 'rose', 'amber', 'violet', 'cyan'];

  // Get computed background style for preview circles
  const getPreviewStyle = (color: ThemeColor) => {
    const preset = themePresets[color];
    const hsl = isDark ? preset.primary.dark : preset.primary.light;
    return { backgroundColor: `hsl(${hsl})` };
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <IconPalette className="h-5 w-5" />
          <span className="sr-only">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Өнгө сонгох</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="grid grid-cols-3 gap-2 p-2">
          {themeColors.map((color) => {
            const preset = themePresets[color];
            const isActive = themeColor === color;
            
            return (
              <button
                key={color}
                onClick={() => setThemeColor(color)}
                className={`relative flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all hover:bg-muted ${
                  isActive ? 'bg-muted ring-2 ring-primary' : ''
                }`}
              >
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center shadow-sm"
                  style={getPreviewStyle(color)}
                >
                  {isActive && <IconCheck className="h-4 w-4 text-white" />}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground">
                  {preset.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
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
