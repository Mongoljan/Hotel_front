'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { schemaHotelSteps3 } from '../../../../schema';
import LanguagesPolicySection from './LanguagesPolicySection';
import MinGuestAgeSection from './MinGuestAgeSection';
import PetPolicySection from './PetPolicySection';
import AcceptedCardsSection, { type AcceptedCardType } from './AcceptedCardsSection';
import type { LanguageOption } from '@/components/LanguageMultiSelect';

type FormFields = z.infer<typeof schemaHotelSteps3>;

type Props = {
  form: UseFormReturn<FormFields>;
  t: (key: string) => string;
  languages: LanguageOption[];
  locale: string;
  acceptedCards: AcceptedCardType[];
};

/** Languages → min guest age → pet → payment cards (admin general edit). */
export default function GeneralPolicySection({
  form,
  t,
  languages,
  locale,
  acceptedCards,
}: Props) {
  return (
    <div className="space-y-5">
      <LanguagesPolicySection form={form} t={t} languages={languages} locale={locale} />
      <MinGuestAgeSection form={form} t={t} />
      <PetPolicySection form={form} t={t} />
      {acceptedCards.length > 0 && (
        <AcceptedCardsSection form={form} t={t} cards={acceptedCards} />
      )}
    </div>
  );
}
