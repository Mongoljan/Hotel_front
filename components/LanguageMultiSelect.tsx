'use client';

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface LanguageOption {
  id: number;
  languages_name_mn: string;
  languages_name_en?: string;
}

const SEARCH_THRESHOLD = 12;

export interface LanguageMultiSelectLabels {
  selected: string;
  available: string;
  search: string;
  placeholder: string;
  done: string;
  emptySelected: string;
}

interface LanguageMultiSelectProps {
  languages: LanguageOption[];
  value: string[];
  onChange: (value: string[]) => void;
  labels: LanguageMultiSelectLabels;
  locale?: string;
  disabled?: boolean;
  className?: string;
  hasError?: boolean;
}

function getLanguageLabel(lang: LanguageOption, locale?: string): string {
  if (locale === 'en' && lang.languages_name_en) {
    return lang.languages_name_en;
  }
  return lang.languages_name_mn;
}

function formatSummaryWithCount(names: string[], visibleCount: number): string {
  if (names.length === 0) return '';
  if (visibleCount >= names.length) return names.join(', ');
  if (visibleCount <= 0) return `+${names.length}`;

  const visible = names.slice(0, visibleCount).join(', ');
  const rest = names.length - visibleCount;
  return `${visible} +${rest}`;
}

function measureFittingVisibleCount(names: string[], availableWidth: number, font: string): number {
  if (names.length === 0 || availableWidth <= 0) return names.length;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return names.length;

  ctx.font = font;

  const fits = (count: number) => {
    const text = formatSummaryWithCount(names, count);
    return ctx.measureText(text).width <= availableWidth;
  };

  if (fits(names.length)) return names.length;

  let low = 0;
  let high = names.length;
  let best = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (fits(mid)) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best;
}

function useFittingSummary(names: string[], containerRef: React.RefObject<HTMLElement | null>) {
  const [visibleCount, setVisibleCount] = useState(names.length);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const style = getComputedStyle(el);
      const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      setVisibleCount(measureFittingVisibleCount(names, el.clientWidth, font));
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [names, containerRef]);

  return visibleCount;
}

export function LanguageMultiSelect({
  languages = [],
  value = [],
  onChange,
  labels,
  locale,
  disabled,
  className,
  hasError,
}: LanguageMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const summaryRef = useRef<HTMLSpanElement>(null);

  const selectedIds = useMemo(() => new Set(value), [value]);

  const selectedLanguages = useMemo(
    () => languages.filter((lang) => selectedIds.has(String(lang.id))),
    [languages, selectedIds]
  );

  const availableLanguages = useMemo(
    () => languages.filter((lang) => !selectedIds.has(String(lang.id))),
    [languages, selectedIds]
  );

  const showSearch = languages.length > SEARCH_THRESHOLD;
  const query = search.trim().toLowerCase();

  const filterBySearch = (list: LanguageOption[]) => {
    if (!query) return list;
    return list.filter((lang) => {
      const mn = lang.languages_name_mn.toLowerCase();
      const en = (lang.languages_name_en || '').toLowerCase();
      return mn.includes(query) || en.includes(query);
    });
  };

  const filteredSelected = showSearch ? filterBySearch(selectedLanguages) : selectedLanguages;
  const filteredAvailable = showSearch ? filterBySearch(availableLanguages) : availableLanguages;

  const addLanguage = (id: number) => {
    const idStr = String(id);
    if (selectedIds.has(idStr)) return;
    onChange([...value, idStr]);
  };

  const removeLanguage = (id: number) => {
    const idStr = String(id);
    onChange(value.filter((v) => v !== idStr));
  };

  const selectedNames = useMemo(
    () => selectedLanguages.map((lang) => getLanguageLabel(lang, locale)),
    [selectedLanguages, locale]
  );

  const visibleCount = useFittingSummary(selectedNames, summaryRef);

  const summary =
    selectedNames.length === 0
      ? labels.placeholder
      : formatSummaryWithCount(selectedNames, visibleCount);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-10 w-[250px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError && 'border-destructive',
          className
        )}
      >
        <span
          ref={summaryRef}
          className={cn(
            'min-w-0 flex-1 truncate text-left',
            selectedLanguages.length === 0 && 'text-muted-foreground'
          )}
        >
          {summary}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col gap-0 p-0">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="text-base">{labels.placeholder}</DialogTitle>
          </DialogHeader>

          {showSearch && (
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={labels.search}
                  className="pl-9"
                />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-4 min-h-0">
            <section>
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                {labels.selected} ({selectedLanguages.length})
              </p>
              {filteredSelected.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">{labels.emptySelected}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredSelected.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => removeLanguage(lang.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-primary bg-primary/10 px-2.5 py-1 text-sm text-primary"
                    >
                      {getLanguageLabel(lang, locale)}
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section>
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                {labels.available} ({availableLanguages.length})
              </p>
              {filteredAvailable.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">—</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredAvailable.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => addLanguage(lang.id)}
                      className="inline-flex items-center rounded-md border border-input bg-background px-2.5 py-1 text-sm hover:bg-accent"
                    >
                      {getLanguageLabel(lang, locale)}
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>

          <DialogFooter className="px-4 py-3 border-t">
            <Button type="button" className="w-full sm:w-auto" onClick={() => setOpen(false)}>
              {labels.done}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
