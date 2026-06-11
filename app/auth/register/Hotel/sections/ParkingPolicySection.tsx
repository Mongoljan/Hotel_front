'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OptionButton } from "@/components/ui/option-button";
import { NumericFormat } from 'react-number-format';
import { z } from 'zod';
import { schemaHotelSteps3 } from '../../../../schema';
import { PolicySectionTitle, POLICY_INPUT_CLASS } from './PolicyFormRow';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  form: UseFormReturn<FormFields>;
  t: (key: string) => string;
};

function ParkingSubSection({
  form,
  t,
  title,
  parkingFieldName,
  feeTypeFieldName,
  priceFieldName,
}: {
  form: UseFormReturn<FormFields>;
  t: (key: string) => string;
  title: string;
  parkingFieldName: 'outdoor_parking' | 'indoor_parking';
  feeTypeFieldName: 'outdoor_fee_type' | 'indoor_fee_type';
  priceFieldName: 'outdoor_price' | 'indoor_price';
}) {
  const parkingValue = form.watch(parkingFieldName);
  const feeTypeValue = form.watch(feeTypeFieldName);
  const priceValue = form.watch(priceFieldName);

  React.useEffect(() => {
    if (parkingValue === 'paid') {
      form.clearErrors([priceFieldName, feeTypeFieldName]);
      const rawPrice = (priceValue || '').toString().replace(/,/g, '');
      const parsedPrice = parseFloat(rawPrice);
      if (feeTypeValue && rawPrice && !Number.isNaN(parsedPrice) && parsedPrice > 0) {
        form.clearErrors([priceFieldName, feeTypeFieldName]);
      }
      return;
    }

    form.setValue(feeTypeFieldName, null as FormFields[typeof feeTypeFieldName], { shouldValidate: true });
    form.setValue(priceFieldName, null as FormFields[typeof priceFieldName], { shouldValidate: true });
    form.clearErrors([priceFieldName, feeTypeFieldName]);
  }, [parkingValue, feeTypeValue, priceValue, form, priceFieldName, feeTypeFieldName]);

  return (
    <div className="space-y-3">
      <PolicySectionTitle>{title}</PolicySectionTitle>

      <FormField
        control={form.control}
        name={parkingFieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-normal">{t('status_label')}</FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {(['no', 'free', 'paid'] as const).map((value) => (
                  <OptionButton
                    key={value}
                    selected={field.value === value}
                    onClick={() => field.onChange(value)}
                  >
                    {value === 'no' ? t('17') : value === 'free' ? t('18') : t('19')}
                  </OptionButton>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {parkingValue === 'paid' && (
        <div className="space-y-3 rounded-lg border border-dashed p-3">
          <FormField
            control={form.control}
            name={feeTypeFieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-normal">{t('payment_unit')}</FormLabel>
                <Select
                  onValueChange={(value) => {
                    form.setValue(feeTypeFieldName, value as FormFields[typeof feeTypeFieldName], {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                  }}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className={POLICY_INPUT_CLASS}>
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
                <FormLabel className="text-sm font-normal">{t('price_label')}</FormLabel>
                <FormControl>
                  <NumericFormat
                    thousandSeparator=","
                    placeholder="0"
                    value={field.value || ''}
                    onValueChange={(values) => {
                      form.setValue(priceFieldName, values.value || null, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                    }}
                    customInput={Input}
                    className={POLICY_INPUT_CLASS}
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
    <div className="space-y-5">
      <ParkingSubSection
        form={form}
        t={t}
        title={t('outdoor_parking_label')}
        parkingFieldName="outdoor_parking"
        feeTypeFieldName="outdoor_fee_type"
        priceFieldName="outdoor_price"
      />

      <ParkingSubSection
        form={form}
        t={t}
        title={t('indoor_parking_label')}
        parkingFieldName="indoor_parking"
        feeTypeFieldName="indoor_fee_type"
        priceFieldName="indoor_price"
      />
    </div>
  );
}
