'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type StepStatus = 'completed' | 'active' | 'pending';

interface StepIndicatorProps {
  /** Array of step labels */
  steps: string[];
  /** Per-step status — preferred over currentStep when provided */
  stepStatuses?: StepStatus[];
  /** 1-based index of the current active step (fallback when stepStatuses omitted) */
  currentStep?: number;
}

function resolveStepStatuses(
  steps: string[],
  stepStatuses: StepStatus[] | undefined,
  currentStep: number
): StepStatus[] {
  if (stepStatuses && stepStatuses.length === steps.length) {
    return stepStatuses;
  }

  return steps.map((_, idx) => {
    const stepNum = idx + 1;
    if (stepNum < currentStep) return 'completed';
    if (stepNum === currentStep) return 'active';
    return 'pending';
  });
}

export default function StepIndicator({
  steps,
  stepStatuses,
  currentStep = 1,
}: StepIndicatorProps) {
  const t = useTranslations('HotelPage');
  const statuses = resolveStepStatuses(steps, stepStatuses, currentStep);

  const statusLabel = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return t('step_completed');
      case 'active':
        return t('step_in_progress');
      default:
        return t('step_pending');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 max-w-[800px] mx-auto">
        <div className="text-[18px] mb-4 font-semibold">
          {t('registration_request_title')}
        </div>
        <div className="flex items-start justify-between gap-2">
          {steps.map((label, idx) => {
            const status = statuses[idx];
            const isCompleted = status === 'completed';
            const isActive = status === 'active';
            const stepNum = idx + 1;

            const circleClass = cn(
              'w-8 h-8 flex items-center justify-center rounded-full border-2 shrink-0',
              isCompleted && 'bg-primary border-primary text-white',
              isActive && 'border-primary border-dashed bg-background text-primary',
              !isCompleted && !isActive && 'border-gray-300 bg-background text-gray-400'
            );

            const lineClass = cn(
              'flex-1 h-px mt-4',
              isCompleted ? 'bg-primary' : 'bg-gray-300'
            );

            const badgeClass = cn(
              'mt-1.5 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full',
              isCompleted && 'bg-green-100 text-green-800',
              isActive && 'bg-amber-100 text-amber-800',
              !isCompleted && !isActive && 'bg-gray-100 text-gray-500'
            );

            return (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <div className={circleClass}>
                    {isCompleted ? (
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span className="mt-2 text-xs text-center leading-tight px-1">{label}</span>
                  <span className={badgeClass}>{statusLabel(status)}</span>
                </div>
                {idx < steps.length - 1 && <div className={lineClass} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
