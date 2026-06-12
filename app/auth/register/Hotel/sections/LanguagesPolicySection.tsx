'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Globe } from 'lucide-react';
import { z } from 'zod';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { LanguageMultiSelect, type LanguageOption } from '@/components/LanguageMultiSelect';
import { schemaHotelSteps3 } from '../../../../schema';
import PolicyFormRow, { PolicySectionTitle } from './PolicyFormRow';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  form: UseFormReturn<FormFields>;
  t: (key: string) => string;
  languages: LanguageOption[];
  locale: string;
};

export default function LanguagesPolicySection({ form, t, languages, locale }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        <PolicySectionTitle>{t('languages')}</PolicySectionTitle>
      </div>
      <FormField
        control={form.control}
        name="languages"
        render={({ field }) => (
          <FormItem>
            <PolicyFormRow label={t('selectLanguagesHint')} alignRight>
              <FormControl>
                <LanguageMultiSelect
                  languages={languages}
                  value={(field.value || []).map(String)}
                  onChange={(ids) => field.onChange(ids.map(Number))}
                  locale={locale}
                  labels={{
                    selected: t('languages_section_selected'),
                    available: t('languages_section_available'),
                    search: t('languages_search'),
                    placeholder: t('selectLanguagesHint'),
                    done: t('languages_done'),
                    emptySelected: t('languages_empty_selected'),
                  }}
                />
              </FormControl>
            </PolicyFormRow>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
