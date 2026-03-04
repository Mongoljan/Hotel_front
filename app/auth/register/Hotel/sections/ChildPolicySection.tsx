'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Baby } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Baby className="h-5 w-5" />
        <h3 className="text-lg font-semibold">{t('children_extra_bed')}</h3>
      </div>

      <FormField
        control={form.control}
        name="allow_children"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('11')}</FormLabel>
            <FormControl>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => field.onChange(true)}
                  className={cn(
                    "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                    field.value === true
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {t('yes')}
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange(false)}
                  className={cn(
                    "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                    field.value === false
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {t('no_label')}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {allowChildren && (
        <div className="space-y-4 p-4 border border-dashed rounded-lg">
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
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => field.onChange('yes')}
                      className={cn(
                        "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                        field.value === 'yes'
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {t('yes')}
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange('no')}
                      className={cn(
                        "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                        field.value === 'no'
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {t('no_label')}
                    </button>
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
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => field.onChange(true)}
                  className={cn(
                    "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                    field.value === true
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {t('yes')}
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange(false)}
                  className={cn(
                    "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                    field.value === false
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {t('no_label')}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {allowExtraBed && (
        <div className="p-4 border border-dashed rounded-lg">
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
