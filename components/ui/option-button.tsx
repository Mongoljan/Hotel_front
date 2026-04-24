"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface OptionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean
}

const OptionButton = React.forwardRef<HTMLButtonElement, OptionButtonProps>(
  ({ selected, className, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "px-5 py-2 rounded-md text-sm font-medium transition-colors",
          selected
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
          className
        )}
        {...props}
      />
    )
  }
)
OptionButton.displayName = "OptionButton"

export { OptionButton }
