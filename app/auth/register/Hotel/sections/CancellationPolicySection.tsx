'use client';

import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { z } from 'zod';
import { schemaHotelStepsCancellation } from '../../../../schema';
import { PolicySubsectionTitle, POLICY_TIME_SELECT_CLASS } from './PolicyFormRow';

type FormFields = z.infer<typeof schemaHotelStepsCancellation>;

type RuleArrayName = 'single_rules' | 'multi_rules';

type Props = {
  form: UseFormReturn<FormFields>;
  t: (key: string, values?: Record<string, string>) => string;
};

const DAYS_SELECT_CLASS = 'w-[160px] h-9';
const FILLED_SELECT_TRIGGER_CLASS =
  'text-foreground font-medium [&_span[data-placeholder]]:font-normal [&_span[data-placeholder]]:text-muted-foreground';

const timeOptions = Array.from({ length: 96 }, (_, i) => {
  const hour = Math.floor(i / 4).toString().padStart(2, '0');
  const minute = ((i % 4) * 15).toString().padStart(2, '0');
  return { value: `${hour}:${minute}`, label: `${hour}:${minute}` };
});

const dayOptions = Array.from({ length: 31 }, (_, i) => i);

function clampPercent(value: string): string {
  const cleaned = value.replace(/[^0-9]/g, '');
  if (cleaned === '') return '';
  const num = Math.min(100, Math.max(0, parseInt(cleaned, 10)));
  return String(num);
}

const NEW_PAID_RULE = { days_before: 0, before_time_percentage: '', after_time_percentage: '' };

function DaysSelect({
  form,
  t,
  fieldName,
}: Props & { fieldName: `${RuleArrayName}.${number}.days_before` }) {
  const dayLabel = (day: number) =>
    day === 0 ? t('day_of_arrival') : t('days_before_option', { count: String(day) });

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className="space-y-0">
          <Select
            onValueChange={(val) => field.onChange(Number(val))}
            value={field.value !== undefined && field.value !== null ? String(field.value) : undefined}
          >
            <FormControl>
              <SelectTrigger className={`${DAYS_SELECT_CLASS} ${FILLED_SELECT_TRIGGER_CLASS} bg-white`}>
                <SelectValue placeholder={t('select_days')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-h-[260px]">
              {dayOptions.map((day) => (
                <SelectItem key={day} value={String(day)}>
                  {dayLabel(day)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage className="text-sm" />
        </FormItem>
      )}
    />
  );
}

function RuleDescription({
  cancelTime,
  t,
  children,
}: {
  cancelTime: string;
  t: Props['t'];
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
      <span className="text-muted-foreground">
        (<span className="font-medium text-foreground">{cancelTime}</span> {t('hour_suffix')}) {t('if_cancelled')}
      </span>
      {children}
    </div>
  );
}

// Multi-room: free row first, then addable deduction rows.
function MultiRoomRows({ form, t, cancelTime }: Props & { cancelTime: string }) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'multi_rules' });

  return (
    <div className="space-y-4">
      {fields.map((fieldItem, index) => {
        const isFree = index === 0;
        const isLast = index === fields.length - 1;

        return (
          <div key={fieldItem.id} className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <DaysSelect form={form} t={t} fieldName={`multi_rules.${index}.days_before` as const} />

            {isFree ? (
              <RuleDescription cancelTime={cancelTime} t={t}>
                <span className="font-medium text-emerald-600">{t('free_cancellation')}</span>
              </RuleDescription>
            ) : (
              <RuleDescription cancelTime={cancelTime} t={t}>
                <FormField
                  control={form.control}
                  name={`multi_rules.${index}.before_time_percentage` as const}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min={0}
                          max={100}
                          step={1}
                          {...field}
                          onChange={(e) => field.onChange(clampPercent(e.target.value))}
                          className="w-[72px] h-9 bg-white text-center text-foreground font-medium"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <span className="text-muted-foreground">{t('deducted_suffix')}</span>
              </RuleDescription>
            )}

            <div className="ml-auto flex items-center gap-1.5">
              {!isFree && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-muted-foreground hover:text-red"
                  onClick={() => remove(index)}
                  aria-label={t('remove_rule')}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
              {isLast && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  onClick={() => append({ ...NEW_PAID_RULE })}
                  aria-label={t('add_rule')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SingleRoomHelpTooltip({ t }: { t: Props['t'] }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="shrink-0 rounded-full text-muted-foreground transition-colors hover:text-foreground"
            aria-label={t('cancellation_help')}
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[280px]">
          <p className="text-sm leading-relaxed">
            {t('single_cancel_help_prefix')}{' '}
            <span className="font-medium text-red">&ldquo;{t('cancel_not_possible')}&rdquo;</span>{' '}
            {t('single_cancel_help_suffix')}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function CancellationPolicySection({ form, t }: Props) {
  const cancelTime = form.watch('cancel_time');
  const displayCancelTime = cancelTime ? cancelTime.slice(0, 5) : '...';

  return (
    <div className="space-y-8">
      <p className="text-sm leading-relaxed text-muted-foreground">{t('cancellation_description')}</p>
      
      <div className="rounded-lg bg-gray-75 p-3 py-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <span className="text-muted-foreground">{t('rule_applies_prefix')}</span>
          <FormField
            control={form.control}
            name="cancel_time"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger className={`${POLICY_TIME_SELECT_CLASS} ${FILLED_SELECT_TRIGGER_CLASS} bg-white`}>
                      <SelectValue placeholder={<span className="text-muted-foreground">ЦЦ:ММ</span>} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[260px]">
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />
          <span className="text-muted-foreground">{t('rule_applies_suffix')}</span>
        </div>
      </div>

      {/* Single Room Section — static single row only */}
      <div className="space-y-4">
        <div className="flex w-full items-center justify-between gap-4">
          <PolicySubsectionTitle>{t('single_room_fee_label')}</PolicySubsectionTitle>
          <SingleRoomHelpTooltip t={t} />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <DaysSelect form={form} t={t} fieldName="single_rules.0.days_before" />
          <RuleDescription cancelTime={displayCancelTime} t={t}>
            <span className="font-medium text-emerald-600">{t('free_cancellation')}</span>
          </RuleDescription>
        </div>
      </div>

      {/* Multi Room Section — dynamic rows */}
      <div className="space-y-4">
        <PolicySubsectionTitle>{t('multi_room_fee_label')}</PolicySubsectionTitle>
        <MultiRoomRows form={form} t={t} cancelTime={displayCancelTime} />
      </div>
    </div>
  );
}
