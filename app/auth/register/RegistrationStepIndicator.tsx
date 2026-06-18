'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Building2, UserRound, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegistrationStepIndicatorProps {
  currentStep: number;
}

const TOTAL_STEPS = 2;

const STEP_ROUTES: Record<number, string> = {
  1: '/auth/register',
  2: '/auth/register/2',
};

const STEP_ICONS: LucideIcon[] = [Building2, UserRound];

export default function RegistrationStepIndicator({ currentStep }: RegistrationStepIndicatorProps) {
  const t = useTranslations('RegistrationSteps');
  const stepNames = [t('hotelInfo'), t('employeeInfo')];

  return (
    <div className="w-full mb-10">
      <div className="flex items-start justify-between gap-1 sm:gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isClickable = isCompleted && STEP_ROUTES[stepNumber];
          const StepIcon = STEP_ICONS[i];

          const circleClass = cn(
            'relative z-10 h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full border-2 transition-transform duration-200',
            isCompleted && 'bg-primary border-primary text-primary-foreground',
            isActive && 'border-primary border-dashed bg-background text-primary',
            !isCompleted && !isActive && 'border-border bg-background text-muted-foreground',
            (isClickable || isActive) && 'hover:scale-110'
          );

          const labelClass = cn(
            'mt-2 text-[10px] sm:text-xs text-center leading-tight px-1 line-clamp-2',
            isActive ? 'text-foreground font-semibold' : isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'
          );

          const stepContent = (
            <>
              <div className={circleClass}>
                <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={isCompleted ? 2.5 : 2} />
              </div>
              <div className={labelClass} title={stepNames[i]}>
                {stepNames[i]}
              </div>
            </>
          );

          return (
            <div key={stepNumber} className="flex-1 flex flex-col items-center min-w-0 relative">
              {stepNumber > 1 && (
                <div
                  className={cn(
                    'absolute top-5 sm:top-6 right-1/2 h-[2px] w-full -z-0',
                    isCompleted || isActive ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}

              {isClickable ? (
                <Link
                  href={STEP_ROUTES[stepNumber]}
                  className="flex flex-col items-center min-w-0 cursor-pointer group"
                >
                  {stepContent}
                </Link>
              ) : (
                <div className={cn('flex flex-col items-center min-w-0', isActive && 'group')}>
                  {stepContent}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
