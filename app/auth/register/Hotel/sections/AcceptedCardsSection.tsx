'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { CreditCard } from 'lucide-react';
import { schemaHotelSteps3 } from '../../../../schema';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { PolicySectionTitle } from './PolicyFormRow';

type FormFields = z.infer<typeof schemaHotelSteps3>;

export interface AcceptedCardType {
  id: number;
  name: string;
  icon: string;
  order: number;
}

type Props = {
  form: UseFormReturn<FormFields>;
  t: (key: string) => string;
  cards: AcceptedCardType[];
};

export default function AcceptedCardsSection({ form, t, cards }: Props) {
  const sortedCards = [...cards].sort((a, b) => a.order - b.order);

  return (
    <FormField
      control={form.control}
      name="accepted_card_ids"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <PolicySectionTitle>{t('accepted_cards')}</PolicySectionTitle>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {sortedCards.map((card) => {
              const checked = field.value?.includes(card.id);
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    const next = checked
                      ? (field.value || []).filter((id: number) => id !== card.id)
                      : [...(field.value || []), card.id];
                    field.onChange(next);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-3 h-12 rounded-md border transition-all text-xs font-medium",
                    checked
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-input bg-background hover:bg-accent hover:border-accent-foreground/20"
                  )}
                >
                  {card.icon ? (
                    <img src={card.icon} alt={card.name} className="h-4 w-auto object-contain" />
                  ) : null}
                  <span>{card.name}</span>
                </button>
              );
            })}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
