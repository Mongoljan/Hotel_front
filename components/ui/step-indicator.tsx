'use client';

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <nav aria-label="Progress">
        <ol role="list" className="flex items-center">
          {steps.map((step, stepIdx) => (
            <li
              key={step.id}
              className={cn(
                "relative",
                stepIdx !== steps.length - 1 ? "flex-1 pr-8 sm:pr-20" : ""
              )}
            >
              {/* Connector line */}
              {stepIdx !== steps.length - 1 && (
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      "h-0.5 w-full",
                      step.id < currentStep
                        ? "bg-primary"
                        : "bg-muted-foreground/20"
                    )}
                  />
                </div>
              )}

              <div className="relative flex h-6 w-6 items-center justify-center">
                {step.id < currentStep ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                ) : step.id === currentStep ? (
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-background"
                    aria-current="step"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground/20 bg-background">
                    <div className="h-2 w-2 rounded-full bg-transparent" />
                  </div>
                )}

                <span className="ml-4 flex min-w-0 flex-col">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      step.id <= currentStep
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span
                      className={cn(
                        "text-xs",
                        step.id <= currentStep
                          ? "text-muted-foreground"
                          : "text-muted-foreground/60"
                      )}
                    >
                      {step.description}
                    </span>
                  )}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}