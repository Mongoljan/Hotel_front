"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface YesNoToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  labels?: { yes: string; no: string };
  className?: string;
}

export function YesNoToggle({
  checked,
  onCheckedChange,
  labels = { yes: "Тийм", no: "Үгүй" },
  className,
}: YesNoToggleProps) {
  return (
    <div className={cn("flex rounded-full border border-input p-1 overflow-hidden", className)}>
      <button
        type="button"
        className={cn(
          "px-4 py-1.5 text-sm rounded-full font-medium transition-colors",
          checked === false
            ? "bg-primary text-primary-foreground"
            : "bg-transparent text-muted-foreground hover:text-foreground"
        )}
        onClick={() => onCheckedChange(false)}
      >
        {labels.no}
      </button>
      <button
        type="button"
        className={cn(
          "px-4 py-1.5 text-sm rounded-full font-medium transition-colors",
          checked === true
            ? "bg-primary text-primary-foreground"
            : "bg-transparent text-muted-foreground hover:text-foreground"
        )}
        onClick={() => onCheckedChange(true)}
      >
        {labels.yes}
      </button>
    </div>
  )
}