"use client";

import { Fragment } from "react";
import { ClipboardList, ImageIcon, LayoutGrid, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_ICONS = [ClipboardList, Sparkles, LayoutGrid, ImageIcon] as const;

export interface StepIndicatorProps {
  current: number;
  steps: string[];
  completed: Set<number>;
  onStepClick: (step: number) => void;
}

export function StepIndicator({ current, steps, completed, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex w-full items-start border-b border-border px-10 pt-4 pb-6">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isDone = completed.has(stepNum);
        const isCurrent = current === stepNum;
        const isClickable = isDone || stepNum <= current;
        const StepIcon = STEP_ICONS[idx];

        return (
          <Fragment key={stepNum}>
            {idx > 0 && (
              <div className="flex min-w-6 flex-1 items-center self-start pt-4">
                <div
                  className={cn(
                    "h-0.5 w-full rounded-full",
                    stepNum <= current ? "bg-theme-secondary-gradient-line" : "bg-border"
                  )}
                />
              </div>
            )}

            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(stepNum)}
                disabled={!isClickable}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  isDone && "border-primary bg-primary-gradient text-primary-foreground shadow-sm",
                  isCurrent && "border-primary border-dashed bg-background text-primary",
                  !isDone && !isCurrent && "border-dashed border-border bg-background text-muted-foreground"
                )}
              >
                <StepIcon className="h-5 w-5" />
              </button>

              <span
                className={cn(
                  "max-w-[96px] text-center text-sm font-medium leading-tight",
                  isCurrent ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
