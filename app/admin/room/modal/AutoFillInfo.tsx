"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AutoFillInfo({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={text}
            className="ml-auto inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-muted-foreground/30 text-xs font-bold leading-none text-muted-foreground/70 hover:border-muted-foreground/50 hover:text-muted-foreground"
          >
            i
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[260px] text-sm leading-snug text-center">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
