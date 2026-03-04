'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Clock } from 'lucide-react';
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { z } from 'zod';
import { schemaHotelSteps3 } from '../../../../schema';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  form: UseFormReturn<FormFields>;
  t: (key: string) => string;
};

export default function CheckInOutSection({ form, t }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5" />
        <h3 className="text-lg font-semibold">{t('set_time_title')}</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        {t('set_time_description')}
      </p>

      <div className="space-y-4 p-4 border border-dashed rounded-lg">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h4 className="font-medium md:mr-10">{t('6')}</h4>
            <FormField
              control={form.control}
              name="check_in_from"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input type="time" {...field} className="w-32" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <span className="text-sm text-muted-foreground"> - </span>
            <FormField
              control={form.control}
              name="check_in_until"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input type="time" {...field} className="w-32" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h4 className="font-medium md:mr-10">{t('8')}</h4>
            <FormField
              control={form.control}
              name="check_out_from"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input type="time" {...field} className="w-32" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <span className="text-sm text-muted-foreground"> - </span>
            <FormField
              control={form.control}
              name="check_out_until"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input type="time" {...field} className="w-32" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
