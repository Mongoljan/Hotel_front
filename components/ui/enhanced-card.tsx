"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "bordered" | "glass";
  hover?: boolean;
}

export function EnhancedCard({ 
  children, 
  className,
  variant = "default",
  hover = true
}: EnhancedCardProps) {
  const variants = {
    default: "bg-card border-border/50",
    elevated: "bg-card border-0 shadow-lg shadow-black/5",
    bordered: "bg-card border-2 border-border",
    glass: "bg-card/50 backdrop-blur-md border-border/30"
  };

  return (
    <Card className={cn(
      variants[variant],
      hover && "transition-all duration-200 hover:shadow-md hover:shadow-black/5 hover:-translate-y-0.5",
      className
    )}>
      {children}
    </Card>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  className
}: StatsCardProps) {
  return (
    <EnhancedCard className={cn("relative overflow-hidden", className)} variant="elevated">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline space-x-3">
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </div>
          {trend && (
            <div className={cn(
              "flex items-center text-sm font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              <span className="sr-only">
                {trend.isPositive ? "Increased" : "Decreased"} by
              </span>
              {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {description && (
          <CardDescription className="mt-1">
            {description}
          </CardDescription>
        )}
      </CardContent>
      
      {/* Subtle gradient overlay */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-primary/5" />
    </EnhancedCard>
  );
}