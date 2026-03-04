'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Car } from 'lucide-react';
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

function ParkingSubSection({
  form,
  t,
  label,
  parkingFieldName,
  feeTypeFieldName,
  priceFieldName,
}: {
  form: UseFormReturn<FormFields>;
  t: (key: string) => string;
  label: string;
  parkingFieldName: 'outdoor_parking' | 'indoor_parking';
  feeTypeFieldName: 'outdoor_fee_type' | 'indoor_fee_type';
  priceFieldName: 'outdoor_price' | 'indoor_price';
}) {
  const parkingValue = form.watch(parkingFieldName);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={parkingFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
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

      {parkingValue === 'paid' && (
        <div className="flex gap-4 p-4 border border-dashed rounded-lg">
          <FormField
            control={form.control}
            name={feeTypeFieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment_unit')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder={t('select_placeholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hour">{t('hourly')}</SelectItem>
                    <SelectItem value="day">{t('daily')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={priceFieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('price_label')}</FormLabel>
                <FormControl>
                  <NumericFormat
                    thousandSeparator=","
                    placeholder="0"
                    value={field.value || ''}
                    onValueChange={(values) => field.onChange(values.value || null)}
                    customInput={Input}
                    className="w-32"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}

export default function ParkingPolicySection({ form, t }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Car className="h-5 w-5" />
        <h3 className="text-lg font-semibold">{t('parking_info')}</h3>
      </div>

      <ParkingSubSection
        form={form}
        t={t}
        label={t('outdoor_parking_label')}
        parkingFieldName="outdoor_parking"
        feeTypeFieldName="outdoor_fee_type"
        priceFieldName="outdoor_price"
      />

      <ParkingSubSection
        form={form}
        t={t}
        label={t('indoor_parking_label')}
        parkingFieldName="indoor_parking"
        feeTypeFieldName="indoor_fee_type"
        priceFieldName="indoor_price"
      />
    </div>
  );
}
