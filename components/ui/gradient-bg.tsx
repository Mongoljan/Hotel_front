"use client";

import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "vibrant";
}

export function GradientBackground({ 
  children, 
  className,
  variant = "default" 
}: GradientBackgroundProps) {
  const variants = {
    default: "bg-gradient-to-br from-blue-50 via-white to-indigo-50",
    subtle: "bg-gradient-to-br from-slate-50 via-white to-blue-50/30",
    vibrant: "bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-50"
  };

  return (
    <div className={cn(
      "min-h-screen",
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
}

export function GridPattern({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "absolute inset-0 opacity-[0.03] dark:opacity-[0.05]",
        className
      )}
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}
    />
  );
}