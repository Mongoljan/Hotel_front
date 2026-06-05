'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { z } from 'zod';
import { schemaHotelStepsCancellation } from '../../../../schema';

type FormFields = z.infer<typeof schemaHotelStepsCancellation>;

type Props = {
  form: UseFormReturn<FormFields>;
  t: (key: string, values?: Record<string, string>) => string;
};

const timeOptions = Array.from({ length: 96 }, (_, i) => {
  const hour = Math.floor(i / 4).toString().padStart(2, '0');
  const minute = ((i % 4) * 15).toString().padStart(2, '0');
  return { value: `${hour}:${minute}`, label: `${hour}:${minute}` };
});

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
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{t('cancellation_policy')}</h3>

      <FormField
        control={form.control}
        name="cancel_time"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-4">
              <FormLabel className="min-w-[200px] text-sm font-normal text-muted-foreground">{t('cancellable_time')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="ЦЦ:ММ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator className="my-2" />

      {/* Single Room Section */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">{t('single_room_fee_label')}</h4>

        <FormField
          control={form.control}
          name="single_before_time_percentage"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-4 text-muted-foreground">
                <FormLabel className="min-w-[200px] text-sm font-normal">
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
              <div className="flex items-center gap-4 text-muted-foreground">
                <FormLabel className="min-w-[200px] text-sm font-normal">
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

      <Separator className="my-2" />

      {/* Multi Room Section */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">{t('multi_room_fee_label')}</h4>

        <FormField
          control={form.control}
          name="multi_5days_before_percentage"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-4 ">
                <FormLabel className="min-w-[200px] text-sm font-normal text-muted-foreground">{t('five_days_before')}</FormLabel>
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
              <div className="flex items-center gap-4 ">
                <FormLabel className="min-w-[200px] text-muted-foreground text-sm font-normal">{t('three_days_before')}</FormLabel>
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
                <FormLabel className="min-w-[200px] text-sm  text-muted-foreground font-normal">{t('two_days_before')}</FormLabel>
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
                <FormLabel className="min-w-[200px] text-sm text-muted-foreground font-normal">{t('one_day_before')}</FormLabel>
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
