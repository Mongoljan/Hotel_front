"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { inlineIconClass } from "./formStyles";

interface ApiRequiredNoticeProps {
  message: string;
  className?: string;
}

export function ApiRequiredNotice({ message, className }: ApiRequiredNoticeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-status-warning/30 bg-status-warning-muted px-3 py-2",
        className
      )}
    >
      <Lock className={cn(inlineIconClass, "text-status-warning flex-shrink-0")} />
      <span className="text-xs font-semibold leading-snug text-status-warning">
        {message}
      </span>
    </div>
  );
}
