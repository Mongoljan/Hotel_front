'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconGradient?: 'emerald' | 'blue' | 'purple' | 'orange' | 'pink' | 'cyan';
  trend?: {
    value: string | number;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
  };
  className?: string;
}

const iconGradients = {
  emerald: 'bg-gradient-to-br from-emerald-500 to-green-600',
  blue: 'bg-gradient-to-br from-blue-500 to-indigo-600',
  purple: 'bg-gradient-to-br from-slate-600 to-slate-700',
  orange: 'bg-gradient-to-br from-orange-500 to-red-600',
  pink: 'bg-gradient-to-br from-pink-500 to-rose-600',
  cyan: 'bg-gradient-to-br from-cyan-500 to-blue-600',
};

const trendColors = {
  emerald: 'text-emerald-600',
  blue: 'text-blue-600',
  purple: 'text-slate-600',
  orange: 'text-orange-600',
  pink: 'text-pink-600',
  cyan: 'text-cyan-600',
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconGradient = 'blue',
  trend,
  className
}: StatsCardProps) {
  return (
    <Card className={cn(
      "border-border/40 bg-background/60 backdrop-blur transition-all hover:scale-[1.02] hover:shadow-lg",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && (
          <div className={cn(
            "h-8 w-8 rounded-lg p-1.5 text-white",
            iconGradients[iconGradient]
          )}>
            <Icon className="h-full w-full" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {trend?.icon && (
              <trend.icon className={cn(
                "h-3 w-3",
                trend.color || trendColors[iconGradient]
              )} />
            )}
            {trend?.value && <span>{trend.value}</span>}
            {description && <span>{description}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default StatsCard;