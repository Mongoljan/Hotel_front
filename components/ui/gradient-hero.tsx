'use client';

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GradientHeroProps {
  badge?: {
    icon?: React.ComponentType<{ className?: string }>;
    text: string;
  };
  title: string;
  description: string;
  actions?: Array<{
    icon?: React.ComponentType<{ className?: string }>;
    text: string;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
    onClick?: () => void;
    className?: string;
  }>;
  sidePanel?: React.ReactNode;
  gradient?: 'purple' | 'blue' | 'red' | 'green' | 'orange' | 'pink';
  className?: string;
}

const gradientVariants = {
  purple: {
    bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950',
    radial1: 'bg-[radial-gradient(circle_at_top_left,_rgba(71,85,105,0.4),_transparent_50%)]',
    radial2: 'bg-[radial-gradient(circle_at_bottom_right,_rgba(51,65,85,0.3),_transparent_60%)]'
  },
  blue: {
    bg: 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950',
    radial1: 'bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.4),_transparent_50%)]',
    radial2: 'bg-[radial-gradient(circle_at_bottom_right,_rgba(79,70,229,0.3),_transparent_60%)]'
  },
  red: {
    bg: 'bg-gradient-to-br from-slate-900 via-red-900 to-rose-950',
    radial1: 'bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.4),_transparent_50%)]',
    radial2: 'bg-[radial-gradient(circle_at_bottom_right,_rgba(225,29,72,0.3),_transparent_60%)]'
  },
  green: {
    bg: 'bg-gradient-to-br from-slate-900 via-green-900 to-emerald-950',
    radial1: 'bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.4),_transparent_50%)]',
    radial2: 'bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.3),_transparent_60%)]'
  },
  orange: {
    bg: 'bg-gradient-to-br from-slate-900 via-orange-900 to-amber-950',
    radial1: 'bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.4),_transparent_50%)]',
    radial2: 'bg-[radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.3),_transparent_60%)]'
  },
  pink: {
    bg: 'bg-gradient-to-br from-slate-900 via-pink-900 to-rose-950',
    radial1: 'bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.4),_transparent_50%)]',
    radial2: 'bg-[radial-gradient(circle_at_bottom_right,_rgba(219,39,119,0.3),_transparent_60%)]'
  }
};

export function GradientHero({
  badge,
  title,
  description,
  actions = [],
  sidePanel,
  gradient = 'purple',
  className
}: GradientHeroProps) {
  const gradientStyles = gradientVariants[gradient];

  return (
    <section className={cn(
      "relative overflow-hidden rounded-3xl border border-border/50 p-8 text-white shadow-[0_40px_100px_rgba(15,23,42,0.5)]",
      gradientStyles.bg,
      className
    )}>
      <div className={cn("pointer-events-none absolute inset-0", gradientStyles.radial1)} />
      <div className={cn("pointer-events-none absolute inset-0", gradientStyles.radial2)} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.12),transparent_40%)]" />
      
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          {badge && (
            <Badge variant="outline" className="w-fit border-white/40 bg-white/15 text-white backdrop-blur-sm">
              {badge.icon && <badge.icon className="mr-2 h-3.5 w-3.5" />}
              {badge.text}
            </Badge>
          )}
          
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            {title}
          </h1>
          
          <p className="max-w-xl text-sm text-white/90 md:text-base font-medium">
            {description}
          </p>
          
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  size="lg"
                  variant={action.variant || "default"}
                  onClick={action.onClick}
                  className={cn(
                    "group inline-flex items-center gap-2 rounded-full",
                    action.variant === "outline" 
                      ? "border-white/30 bg-white/10 text-white hover:bg-white/20" 
                      : "bg-white/95 px-6 py-2 text-slate-900 shadow-lg transition hover:bg-white",
                    action.className
                  )}
                >
                  {action.icon && (
                    <action.icon className={cn(
                      "h-4 w-4 transition-transform",
                      action.variant !== "outline" && "group-hover:rotate-90"
                    )} />
                  )}
                  {action.text}
                </Button>
              ))}
            </div>
          )}
        </div>

        {sidePanel && (
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            {sidePanel}
          </div>
        )}
      </div>
    </section>
  );
}

export default GradientHero;