'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { schemaHotelSteps3 } from '../../../../schema';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

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
        <FormItem>
          <FormLabel>{t('accepted_cards')}</FormLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sortedCards.map((card) => {
              const checked = field.value?.includes(card.id);
              return (
                <label key={card.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      const next = isChecked
                        ? [...(field.value || []), card.id]
                        : (field.value || []).filter((id: number) => id !== card.id);
                      field.onChange(next);
                    }}
                  />
                  {card.icon ? (
                    <img src={card.icon} alt={card.name} className="h-5 w-auto object-contain" />
                  ) : null}
                  <span>{card.name}</span>
                </label>
              );
            })}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
