'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Baby } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OptionButton } from "@/components/ui/option-button";
import { NumericFormat } from 'react-number-format';
import { z } from 'zod';
import { schemaHotelSteps3 } from '../../../../schema';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  form: UseFormReturn<FormFields>;
  t: (key: string) => string;
};

export default function ChildPolicySection({ form, t }: Props) {
  const allowChildren = form.watch('allow_children');
  const allowExtraBed = form.watch('allow_extra_bed');

  // Clear validation errors when allow_children changes to true
  React.useEffect(() => {
    if (allowChildren) {
      form.clearErrors(['max_child_age', 'child_bed_available']);
    }
  }, [allowChildren, form]);

  // Clear validation errors when allow_extra_bed changes to true
  React.useEffect(() => {
    if (allowExtraBed) {
      form.clearErrors(['extra_bed_price']);
    }
  }, [allowExtraBed, form]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Baby className="h-4 w-4" />
        <h3 className="text-sm font-semibold">{t('children_extra_bed')}</h3>
      </div>

      <FormField
        control={form.control}
        name="allow_children"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('11')}</FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <OptionButton selected={field.value === true} onClick={() => field.onChange(true)}>{t('yes')}</OptionButton>
                <OptionButton selected={field.value === false} onClick={() => field.onChange(false)}>{t('no_label')}</OptionButton>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {allowChildren && (
        <div className="space-y-3 p-3 border border-dashed rounded-lg">
          <FormField
            control={form.control}
            name="max_child_age"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-4">
                  <FormLabel className="min-w-[200px]">{t('max_child_age')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="17"
                      min="0"
                      max="18"
                      step="1"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-32"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="child_bed_available"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('child_bed_available')}</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <OptionButton selected={field.value === 'yes'} onClick={() => field.onChange('yes')}>{t('yes')}</OptionButton>
                    <OptionButton selected={field.value === 'no'} onClick={() => field.onChange('no')}>{t('no_label')}</OptionButton>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <FormField
        control={form.control}
        name="allow_extra_bed"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('extra_bed_available')}</FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <OptionButton selected={field.value === true} onClick={() => field.onChange(true)}>{t('yes')}</OptionButton>
                <OptionButton selected={field.value === false} onClick={() => field.onChange(false)}>{t('no_label')}</OptionButton>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {allowExtraBed && (
        <div className="p-3 border border-dashed rounded-lg">
          <FormField
            control={form.control}
            name="extra_bed_price"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-4">
                  <FormLabel className="min-w-[200px]">{t('extra_bed_price')}</FormLabel>
                  <FormControl>
                    <NumericFormat
                      thousandSeparator=","
                      placeholder="0"
                      value={field.value || ''}
                      onValueChange={(values) => field.onChange(values.value || null)}
                      customInput={Input}
                      className="w-40"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
