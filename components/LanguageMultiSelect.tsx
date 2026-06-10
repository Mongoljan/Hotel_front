'use client';

import React, { useMemo, useState } from 'react';
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
const SUMMARY_VISIBLE_COUNT = 5;

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

function formatSummary(
  selectedLanguages: LanguageOption[],
  locale: string | undefined,
  placeholder: string
): string {
  if (selectedLanguages.length === 0) return placeholder;

  const names = selectedLanguages.map((lang) => getLanguageLabel(lang, locale));
  if (names.length <= SUMMARY_VISIBLE_COUNT) {
    return names.join(', ');
  }

  const visible = names.slice(0, SUMMARY_VISIBLE_COUNT).join(', ');
  const rest = names.length - SUMMARY_VISIBLE_COUNT;
  return `${visible} +${rest}`;
}

export function LanguageMultiSelect({
  languages,
  value,
  onChange,
  labels,
  locale,
  disabled,
  className,
  hasError,
}: LanguageMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

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

  const summary = formatSummary(selectedLanguages, locale, labels.placeholder);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError && 'border-destructive',
          className
        )}
      >
        <span
          className={cn(
            'truncate text-left',
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
              <p className="text-xs font-semibold text-muted-foreground mb-2">
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
              <p className="text-xs font-semibold text-muted-foreground mb-2">
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
