'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Coffee } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OptionButton } from "@/components/ui/option-button";
import { NumericFormat } from 'react-number-format';
import { z } from 'zod';
import { schemaHotelSteps3 } from '../../../../schema';
import PolicyFormRow, { PolicySectionTitle, POLICY_TIME_SELECT_CLASS, POLICY_INPUT_CLASS } from './PolicyFormRow';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  form: UseFormReturn<FormFields>;
  t: (key: string) => string;
};

const timeOptions = Array.from({ length: 96 }, (_, i) => {
  const hour = Math.floor(i / 4).toString().padStart(2, '0');
  const minute = ((i % 4) * 15).toString().padStart(2, '0');
  return { value: `${hour}:${minute}`, label: `${hour}:${minute}` };
});

export default function BreakfastPolicySection({ form, t }: Props) {
  const breakfastStatus = form.watch('breakfast_status');

  React.useEffect(() => {
    if (breakfastStatus !== 'no') {
      form.clearErrors(['breakfast_start_time', 'breakfast_end_time']);
    }
  }, [breakfastStatus, form]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Coffee className="h-4 w-4" />
        <PolicySectionTitle>{t('breakfast')}</PolicySectionTitle>
      </div>

      <FormField
        control={form.control}
        name="breakfast_status"
        render={({ field }) => (
          <FormItem>
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

      {breakfastStatus !== 'no' && (
        <div className="space-y-3 rounded-lg bg-gray-75 p-3 py-4">
          <PolicyFormRow label={t('breakfast_time')}>
            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="breakfast_start_time"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className={`${POLICY_TIME_SELECT_CLASS} bg-white`}>
                          <SelectValue placeholder={<span className="text-muted-foreground">ЦЦ:ММ</span>} />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <span className="text-sm text-muted-foreground">–</span>
              <FormField
                control={form.control}
                name="breakfast_end_time"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className={`${POLICY_TIME_SELECT_CLASS} bg-white`}>
                          <SelectValue placeholder={<span className="text-muted-foreground">ЦЦ:ММ</span>} />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </PolicyFormRow>

          <FormField
            control={form.control}
            name="breakfast_type"
            render={({ field }) => (
              <FormItem>
                <PolicyFormRow label={t('breakfast_type_label')}>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-[200px] h-9 bg-white">
                        <SelectValue placeholder={<span className="text-muted-foreground">{t('select_placeholder')}</span>} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="buffet">{t('buffet')}</SelectItem>
                      <SelectItem value="room">{t('in_room')}</SelectItem>
                      <SelectItem value="plate">{t('plate')}</SelectItem>
                    </SelectContent>
                  </Select>
                </PolicyFormRow>
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
                  <PolicyFormRow label={t('price_label')}>
                    <FormControl>
                      <NumericFormat
                        thousandSeparator=","
                        placeholder="0"
                        value={field.value || ''}
                        onValueChange={(values) => field.onChange(values.value || null)}
                        customInput={Input}
                        className={`${POLICY_INPUT_CLASS} bg-white`}
                      />
                    </FormControl>
                  </PolicyFormRow>
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
