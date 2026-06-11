'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Baby, BedDouble } from 'lucide-react';
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { NumericFormat } from 'react-number-format';
import { z } from 'zod';
import { schemaHotelSteps3 } from '../../../../schema';
import PolicyFormRow, { PolicySectionTitle, PolicySubsectionTitle, POLICY_INPUT_CLASS } from './PolicyFormRow';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  form: UseFormReturn<FormFields>;
  t: (key: string) => string;
};

export default function ChildPolicySection({ form, t }: Props) {
  const allowChildren = form.watch('allow_children');
  const allowExtraBed = form.watch('allow_extra_bed');

  React.useEffect(() => {
    if (allowChildren) {
      form.clearErrors(['max_child_age', 'child_bed_available']);
    }
  }, [allowChildren, form]);

  React.useEffect(() => {
    if (allowExtraBed) {
      form.clearErrors(['extra_bed_price']);
    }
  }, [allowExtraBed, form]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Baby className="h-4 w-4" />
        <PolicySectionTitle>{t('children_extra_bed')}</PolicySectionTitle>
      </div>

      <div className="space-y-3">
        <PolicySubsectionTitle>{t('children_policy_subtitle')}</PolicySubsectionTitle>

        <FormField
          control={form.control}
          name="allow_children"
          render={({ field }) => (
            <FormItem>
              <PolicyFormRow label={t('11')}>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </PolicyFormRow>
              <FormMessage />
            </FormItem>
          )}
        />

        {allowChildren && (
          <div className="space-y-3 rounded-lg border border-dashed p-3">
            <FormField
              control={form.control}
              name="max_child_age"
              render={({ field }) => (
                <FormItem>
                  <PolicyFormRow
                    label={t('max_child_age')}
                    helper={t('max_child_age_helper')}
                  >
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="17"
                        min="0"
                        max="18"
                        step="1"
                        className={POLICY_INPUT_CLASS}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                  </PolicyFormRow>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="child_bed_available"
              render={({ field }) => (
                <FormItem>
                  <PolicyFormRow label={t('child_bed_available')}>
                    <FormControl>
                      <Switch
                        checked={field.value === 'yes'}
                        onCheckedChange={(checked) => field.onChange(checked ? 'yes' : 'no')}
                      />
                    </FormControl>
                  </PolicyFormRow>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BedDouble className="h-4 w-4" />
          <PolicySubsectionTitle>{t('extra_bed_subtitle')}</PolicySubsectionTitle>
        </div>

        <FormField
          control={form.control}
          name="allow_extra_bed"
          render={({ field }) => (
            <FormItem>
              <PolicyFormRow label={t('extra_bed_available')}>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </PolicyFormRow>
              <FormMessage />
            </FormItem>
          )}
        />

        {allowExtraBed && (
          <div className="rounded-lg border border-dashed p-3">
            <FormField
              control={form.control}
              name="extra_bed_price"
              render={({ field }) => (
                <FormItem>
                  <PolicyFormRow label={t('extra_bed_price')}>
                    <FormControl>
                      <NumericFormat
                        thousandSeparator=","
                        placeholder="0"
                        value={field.value || ''}
                        onValueChange={(values) => field.onChange(values.value || null)}
                        customInput={Input}
                        className={POLICY_INPUT_CLASS}
                      />
                    </FormControl>
                  </PolicyFormRow>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
