'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Baby, BedDouble, Info } from 'lucide-react';
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { YesNoToggle } from "@/components/ui/yes-no-toggle";
import { NumericFormat } from 'react-number-format';
import { z } from 'zod';
import { schemaHotelSteps3 } from '../../../../schema';
import PolicyFormRow, { PolicySectionTitle, PolicySubsectionTitle, POLICY_INPUT_CLASS } from './PolicyFormRow';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type FormFields = z.infer<typeof schemaHotelSteps3>;

const MAX_CHILD_AGE_LIMIT = 18;

function buildAgeOptions(max: number): number[] {
  return Array.from({ length: max + 1 }, (_, i) => i);
}

type Props = {
  form: UseFormReturn<FormFields>;
  t: (key: string) => string;
};

export default function ChildPolicySection({ form, t }: Props) {
  const allowChildren = form.watch('allow_children');
  const allowExtraBed = form.watch('allow_extra_bed');
  const maxChildAge = form.watch('max_child_age');
  const freeBreakfastMaxAge = form.watch('free_breakfast_max_age');

  const maxChildAgeOptions = buildAgeOptions(MAX_CHILD_AGE_LIMIT);
  const freeBreakfastAgeOptions =
    maxChildAge !== undefined && maxChildAge !== null
      ? buildAgeOptions(maxChildAge)
      : [];

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

  React.useEffect(() => {
    if (
      maxChildAge !== undefined &&
      maxChildAge !== null &&
      freeBreakfastMaxAge !== undefined &&
      freeBreakfastMaxAge !== null &&
      freeBreakfastMaxAge > maxChildAge
    ) {
      form.setValue('free_breakfast_max_age', maxChildAge);
    }
  }, [maxChildAge, freeBreakfastMaxAge, form]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Baby className="h-4 w-4" />
        <PolicySectionTitle>{t('children_extra_bed')}</PolicySectionTitle>
      </div>

      <div className="space-y-3">

        <FormField
          control={form.control}
          name="allow_children"
          render={({ field }) => (
            <FormItem>
              <PolicyFormRow label={t('11')} alignRight>
                <FormControl>
                  <YesNoToggle checked={field.value === true} onCheckedChange={(checked: boolean) => field.onChange(checked)} />
                </FormControl>
              </PolicyFormRow>
              <FormMessage />
            </FormItem>
          )}
        />

        {allowChildren && (
          <div className="space-y-3 rounded-lg bg-gray-75 p-3 py-4">
            <FormField
              control={form.control}
              name="max_child_age"
              render={({ field }) => (
                <FormItem>
                  <PolicyFormRow
                    label={
                      <span className="flex items-center gap-1">
                        {t('max_child_age')}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground " />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-[250px]">{t('max_child_age_helper')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                    }
                    alignRight
                  >
                    <FormControl className="bg-white">
                      <Select
                        value={field.value !== undefined && field.value !== null ? String(field.value) : undefined}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger className={`${POLICY_INPUT_CLASS} bg-white`}>
                          <SelectValue placeholder={<span className="text-muted-foreground">{t('select_placeholder')}</span>} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[260px]">
                          {maxChildAgeOptions.map((age) => (
                            <SelectItem key={age} value={String(age)}>
                              {age}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                  <PolicyFormRow label={t('child_bed_available')} alignRight>
                    <FormControl>
                      <YesNoToggle
                      className="bg-white"
                        checked={field.value === 'yes'}
                        onCheckedChange={(checked: boolean) => field.onChange(checked ? 'yes' : 'no')}
                      />
                    </FormControl>
                  </PolicyFormRow>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="free_breakfast_max_age"
              render={({ field }) => (
                <FormItem>
                  <PolicyFormRow
                    label={
                      <span className="flex items-center gap-1">
                        {t('free_breakfast_max_age')}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground " />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-[250px]">{t('free_breakfast_max_age_helper')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                    }
                    alignRight
                  >
                    <FormControl className="bg-white">
                      <Select
                        value={field.value !== undefined && field.value !== null ? String(field.value) : undefined}
                        onValueChange={(value) => field.onChange(Number(value))}
                        disabled={maxChildAge === undefined || maxChildAge === null}
                      >
                        <SelectTrigger className={`${POLICY_INPUT_CLASS} bg-white`}>
                          <SelectValue placeholder={<span className="text-muted-foreground">{t('select_placeholder')}</span>} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[260px]">
                          {freeBreakfastAgeOptions.map((age) => (
                            <SelectItem key={age} value={String(age)}>
                              {age}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
          <PolicySubsectionTitle > <div className="text-[16px]">{t('extra_bed_subtitle')}</div></PolicySubsectionTitle>
        </div>

        <FormField
          control={form.control}
          name="total_extra_beds"
          render={({ field }) => (
            <FormItem>
              <PolicyFormRow
                label={
                  <span className="flex items-center gap-1">
                    {t('total_extra_beds')}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground " />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-[250px]">{t('total_extra_beds_helper')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                }
                alignRight
              >
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    step="1"
                    className={POLICY_INPUT_CLASS}
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                  />
                </FormControl>
              </PolicyFormRow>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allow_extra_bed"
          render={({ field }) => (
            <FormItem>
              <PolicyFormRow label={t('extra_bed_available')} alignRight>
                <FormControl>
                  <YesNoToggle checked={field.value === true} onCheckedChange={(checked: boolean) => field.onChange(checked)} />
                </FormControl>
              </PolicyFormRow>
              <FormMessage />
            </FormItem>
          )}
        />

        {allowExtraBed && (
          <div className="rounded-lg bg-gray-75 p-3">
            <FormField
           
              control={form.control}
              name="extra_bed_price"
              render={({ field }) => (
                <FormItem>
                  <PolicyFormRow label={t('extra_bed_price')} alignRight>
                    
                    <FormControl  className="bg-white " >
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
