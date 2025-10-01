"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Trend = "up" | "down" | "neutral";

export type DashboardStat = {
  label: string;
  value: string;
  helper?: string;
  change?: {
    trend: Trend;
    label: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  gradientFrom?: string;
  gradientTo?: string;
};

export type DashboardHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  highlight?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  background?: "default" | "glass" | "subtle";
};

export function DashboardShell({
  children,
  className
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("space-y-6 pb-10", className)}>
      {children}
    </div>
  );
}

export function DashboardHero({
  eyebrow,
  title,
  description,
  highlight,
  actions,
  meta,
  background = "default"
}: DashboardHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/40 bg-background/70 shadow-xl backdrop-blur",
        background === "glass" && "bg-background/60",
        background === "subtle" && "bg-muted/60"
      )}
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-y-0 left-1/2 h-[140%] w-[140%] -translate-x-1/2 transform bg-gradient-to-br from-indigo-500/20 via-sky-400/15 to-cyan-400/25 blur-3xl" />
        <div className="absolute -top-24 left-10 h-48 w-48 rounded-full bg-primary/20 blur-2xl" />
        <div className="absolute -bottom-32 right-6 h-56 w-56 rounded-full bg-slate-500/20 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-10">
        <div className="space-y-4 max-w-2xl">
          {eyebrow ? (
            <Badge variant="outline" className="bg-background/70 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {eyebrow}
            </Badge>
          ) : null}
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            {highlight ? (
              <p className="text-base font-medium text-primary/90">
                {highlight}
              </p>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-4 md:w-auto md:items-end">
          {meta ? <div className="text-sm text-muted-foreground">{meta}</div> : null}
          {actions}
        </div>
      </div>
    </section>
  );
}

export function DashboardStats({
  stats,
  className
}: {
  stats: DashboardStat[];
  className?: string;
}) {
  if (!stats?.length) return null;

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="relative overflow-hidden border border-border/40 bg-background/70 shadow-lg"
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 -top-20 h-40 bg-gradient-to-r opacity-50 blur-3xl",
                stat.gradientFrom && stat.gradientTo
                  ? `${stat.gradientFrom} ${stat.gradientTo}`
                  : "from-primary/25 via-sky-400/20 to-cyan-400/25"
              )}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              {Icon ? (
                <span className="rounded-full bg-primary/10 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              {stat.helper ? (
                <p className="text-xs text-muted-foreground">{stat.helper}</p>
              ) : null}
              {stat.change ? (
                <p
                  className={cn(
                    "text-xs font-medium",
                    stat.change.trend === "up" && "text-emerald-500",
                    stat.change.trend === "down" && "text-rose-500",
                    stat.change.trend === "neutral" && "text-muted-foreground"
                  )}
                >
                  {stat.change.label}
                </p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function DashboardSection({
  title,
  description,
  actions,
  children
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      {(title || description || actions) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            {title ? (
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function DashboardGrid({
  children,
  className
}: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("grid gap-4", className)}>{children}</div>;
}

export function DashboardPanel({
  title,
  description,
  children,
  footer
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="border border-border/40 bg-background/60 shadow-lg">
      {(title || description) && (
        <CardHeader>
          {title ? (
            <CardTitle className="text-sm font-semibold text-foreground">
              {title}
            </CardTitle>
          ) : null}
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {children}
        {footer ? <div className="pt-2 text-xs text-muted-foreground">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
