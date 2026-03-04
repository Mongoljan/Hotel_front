'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Coffee } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { NumericFormat } from 'react-number-format';
import { z } from 'zod';
import { schemaHotelSteps3 } from '../../../../schema';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  form: UseFormReturn<FormFields>;
  t: (key: string) => string;
};

export default function BreakfastPolicySection({ form, t }: Props) {
  const breakfastStatus = form.watch('breakfast_status');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Coffee className="h-5 w-5" />
        <h3 className="text-lg font-semibold">{t('breakfast')}</h3>
      </div>

      <FormField
        control={form.control}
        name="breakfast_status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('10')}</FormLabel>
            <FormControl>
              <div className="flex gap-3">
                {(['no', 'free', 'paid'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className={cn(
                      "px-8 py-2 rounded-md text-sm font-medium transition-all border",
                      field.value === value
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {value === 'no' ? t('17') : value === 'free' ? t('18') : t('19')}
                  </button>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {breakfastStatus !== 'no' && (
        <div className="space-y-4 p-4 border border-dashed rounded-lg">
          <div className="flex items-center gap-4">
            <FormLabel className="min-w-[150px]">{t('breakfast_time')}</FormLabel>
            <FormField
              control={form.control}
              name="breakfast_start_time"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="time" {...field} className="w-32" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <span>-</span>
            <FormField
              control={form.control}
              name="breakfast_end_time"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="time" {...field} className="w-32" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="breakfast_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('breakfast_type_label')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={t('select_placeholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="buffet">{t('buffet')}</SelectItem>
                    <SelectItem value="room">{t('in_room')}</SelectItem>
                    <SelectItem value="plate">{t('plate')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {breakfastStatus === 'paid' && (
            <FormField
              control={form.control}
              name="breakfast_price"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="min-w-[150px]">{t('price_label')}</FormLabel>
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
          )}
        </div>
      )}
    </div>
  );
}
