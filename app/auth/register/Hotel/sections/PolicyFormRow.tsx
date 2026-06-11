'use client';

import React from 'react';
import { FormLabel } from '@/components/ui/form';
import { cn } from '@/lib/utils';

export const POLICY_TIME_SELECT_CLASS = 'w-[140px] h-9';
export const POLICY_INPUT_CLASS = 'w-[140px]';

type PolicyFormRowProps = {
  label: string;
  helper?: string;
  children: React.ReactNode;
  className?: string;
};

export function PolicySectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-[16px] font-semibold', className)}>{children}</h3>;
}

export function PolicySubsectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-semibold text-foreground">{children}</h4>;
}

export default function PolicyFormRow({ label, helper, children, className }: PolicyFormRowProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="grid grid-cols-[minmax(160px,220px)_minmax(0,1fr)] items-center gap-x-4">
        <FormLabel className="text-sm font-normal leading-snug">{label}</FormLabel>
        <div className="min-w-0">{children}</div>
      </div>
      {helper ? <p className="text-sm text-muted-foreground">{helper}</p> : null}
    </div>
  );
}
