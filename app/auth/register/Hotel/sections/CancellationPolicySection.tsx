'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { z } from 'zod';
import { schemaHotelSteps3 } from '../../../../schema';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  form: UseFormReturn<FormFields>;
  t: (key: string, values?: Record<string, string>) => string;
};

function clampPercent(value: string): string {
  const cleaned = value.replace(/[^0-9]/g, '');
  if (cleaned === '') return '';
  const num = Math.min(100, Math.max(0, parseInt(cleaned, 10)));
  return String(num);
}

export default function CancellationPolicySection({ form, t }: Props) {
  const cancelTime = form.watch('cancel_time');
  const displayCancelTime = cancelTime ? cancelTime.slice(0, 5) : '...';

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{t('cancellation_policy')}</h3>

      <FormField
        control={form.control}
        name="cancel_time"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-4">
              <FormLabel className="min-w-[200px]">{t('cancellable_time')}</FormLabel>
              <FormControl>
                <Input type="time" {...field} className="w-40" />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator className="my-4" />

      {/* Single Room Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-base">{t('single_room_fee_label')}</h4>

        <FormField
          control={form.control}
          name="single_before_time_percentage"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormLabel className="min-w-[200px]">
                  {t('before_cancel_label', { time: displayCancelTime })}
                </FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" min={0} max={100} step={1} {...field} onChange={(e) => field.onChange(clampPercent(e.target.value))} className="w-32" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="single_after_time_percentage"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormLabel className="min-w-[200px]">
                  {t('after_cancel_label', { time: displayCancelTime })}
                </FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" min={0} max={100} step={1} {...field} onChange={(e) => field.onChange(clampPercent(e.target.value))} className="w-32" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator className="my-4" />

      {/* Multi Room Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-base">{t('multi_room_fee_label')}</h4>

        <FormField
          control={form.control}
          name="multi_5days_before_percentage"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormLabel className="min-w-[200px]">{t('five_days_before')}</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" min={0} max={100} step={1} {...field} onChange={(e) => field.onChange(clampPercent(e.target.value))} className="w-32" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="multi_3days_before_percentage"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormLabel className="min-w-[200px]">{t('three_days_before')}</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" min={0} max={100} step={1} {...field} onChange={(e) => field.onChange(clampPercent(e.target.value))} className="w-32" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="multi_2days_before_percentage"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormLabel className="min-w-[200px]">{t('two_days_before')}</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" min={0} max={100} step={1} {...field} onChange={(e) => field.onChange(clampPercent(e.target.value))} className="w-32" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="multi_1day_before_percentage"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormLabel className="min-w-[200px]">{t('one_day_before')}</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" min={0} max={100} step={1} {...field} onChange={(e) => field.onChange(clampPercent(e.target.value))} className="w-32" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
