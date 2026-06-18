"use client";

import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  AMENITY_PANEL_WIDTH,
  IMAGE_UPLOAD_PANEL_WIDTH,
  PANEL_EASING,
  PANEL_TRANSITION_MS,
  ROOM_SHEET_WIDTH,
} from "./constants";
import { StepIndicator } from "./StepIndicator";

export interface RoomModalSheetLayoutProps {
  isOpen: boolean;
  sheetTitle: string;
  sidePanelOpen: boolean;
  sidePanelWidth: number;
  sidePanel: ReactNode | null;
  onOpenChange: (open: boolean) => void;
  showStepIndicator: boolean;
  step: number;
  stepLabels: string[];
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
  form: ReactNode;
  footer: ReactNode;
}

export function RoomModalSheetLayout({
  isOpen,
  sheetTitle,
  sidePanelOpen,
  sidePanelWidth,
  sidePanel,
  onOpenChange,
  showStepIndicator,
  step,
  stepLabels,
  completedSteps,
  onStepClick,
  form,
  footer,
}: RoomModalSheetLayoutProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        fallbackTitle={sheetTitle}
        className="flex h-full flex-col gap-0 overflow-visible p-0 sm:max-w-none z-[51]"
        style={{ width: ROOM_SHEET_WIDTH, maxWidth: ROOM_SHEET_WIDTH }}
        onPointerDownOutside={(event) => {
          const target = event.target as HTMLElement;
          if (
            target.closest("[data-radix-select-content]") ||
            target.closest("[data-radix-select-viewport]")
          ) {
            event.preventDefault();
          }
        }}
      >
        {/* Stretched panel — expands to the left; main sheet width stays fixed */}
        <div
          className={cn(
            "absolute top-0 z-10 flex h-full flex-col overflow-hidden border-r bg-background shadow-2xl",
            "transition-[width,opacity] ease-[cubic-bezier(0.32,0.72,0,1)]",
            sidePanelOpen ? "opacity-100" : "pointer-events-none w-0 opacity-0"
          )}
          style={{
            right: "100%",
            width: sidePanelOpen ? sidePanelWidth : 0,
            transitionDuration: `${PANEL_TRANSITION_MS}ms`,
          }}
        >
          {sidePanel}
        </div>

        {/* Main sheet — fixed width; blurred when side panel open */}
        <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-background">
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-20 transition-opacity backdrop-blur-[2px]",
              sidePanelOpen ? "opacity-100" : "opacity-0"
            )}
            style={{
              transitionDuration: `${PANEL_TRANSITION_MS}ms`,
              transitionTimingFunction: PANEL_EASING,
              backgroundColor: sidePanelOpen ? "rgba(255,255,255,0.55)" : "transparent",
            }}
            aria-hidden
          />
          <div
            className={cn(
              "relative flex h-full min-h-0 flex-col",
              sidePanelOpen && "pointer-events-none"
            )}
          >
            <SheetHeader className="border-b border-border px-5 py-4 space-y-0 flex-row items-center justify-between">
              <SheetTitle className="text-lg font-semibold">{sheetTitle}</SheetTitle>
            </SheetHeader>

            {showStepIndicator && (
              <StepIndicator
                current={step}
                steps={stepLabels}
                completed={completedSteps}
                onStepClick={onStepClick}
              />
            )}

            {form}
            {footer}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
