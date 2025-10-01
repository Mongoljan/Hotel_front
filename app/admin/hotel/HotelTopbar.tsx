'use client';

import * as React from 'react';
import {
  IconChecklist,
  IconClipboardText,
  IconClockHour4,
  IconCircle,
  IconCircleCheck,
  IconInfoCircle,
  IconRefresh,
  IconSparkles
} from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useHotelOnboarding } from './hotel-onboarding-context';

const stepStatusStyles: Record<string, string> = {
  complete: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600',
  current: 'border-primary/40 bg-primary/10 text-primary',
  upcoming: 'border-border/70 bg-background text-muted-foreground'
};

const stepIconMap = {
  complete: IconCircleCheck,
  current: IconClockHour4,
  upcoming: IconCircle
};

const viewOptions = [
  {
    id: 'proceed' as const,
    label: 'Явцын самбар',
    description: 'Бүртгэлийн явцыг хянана',
    icon: IconChecklist
  },
  {
    id: 'register' as const,
    label: 'Мэдээлэл оруулах',
    description: 'Хөтөч даган дэлгэрэнгүй мэдээлэл оруулах',
    icon: IconClipboardText
  }
];

export function HotelTopbar() {
  const {
    hotelInfo,
    hotelApproved,
    steps,
    progress,
    lastSyncedAt,
    view,
    setView,
    refresh,
    loading
  } = useHotelOnboarding();

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const currentStep = React.useMemo(() => steps.find((step) => step.status === 'current'), [steps]);
  const completedSteps = React.useMemo(() => steps.filter((step) => step.status === 'complete').length, [steps]);

  const syncedLabel = React.useMemo(() => {
    if (!lastSyncedAt) return '––';
    return lastSyncedAt.toLocaleTimeString('mn-MN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [lastSyncedAt]);

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  const statusBadge = hotelApproved
    ? {
        label: 'Баталгаажсан',
        className: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
      }
    : {
        label: 'Шалгагдаж байна',
        className: 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
      };

  return (
    <TooltipProvider delayDuration={150}>
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col gap-4 px-4 py-4 md:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
                <span>Property onboarding</span>
                <span className="hidden h-1.5 w-1.5 rounded-full bg-muted-foreground/50 md:inline-flex" />
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
                  <IconSparkles className="h-3 w-3" />
                  {completedSteps} / {steps.length} алхам биелсэн
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">
                    {hotelInfo?.propertyName || 'Зочид буудлын бүртгэл'}
                  </h1>
                  <p className="truncate text-sm text-muted-foreground">
                    {hotelInfo?.companyName || 'Компанийн мэдээлэл бэлэн болоогүй байна'}
                  </p>
                </div>
                <Badge className={cn('rounded-full px-3 py-1 text-xs font-medium', statusBadge.className)}>
                  {statusBadge.label}
                </Badge>
                {hotelInfo?.groupName ? (
                  <Badge variant="outline" className="rounded-full border-dashed px-3 text-xs text-muted-foreground">
                    {hotelInfo.groupName}
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {viewOptions.map((option) => {
                const Icon = option.icon;
                const active = option.id === view;
                return (
                  <Button
                    key={option.id}
                    variant={active ? 'default' : 'secondary'}
                    className={cn(
                      'h-11 justify-start gap-2 rounded-xl px-4 text-sm shadow-sm transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border/70 bg-background/80 text-foreground hover:bg-muted'
                    )}
                    onClick={() => setView(option.id)}
                    disabled={loading && !active}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium leading-none">{option.label}</span>
                      <span className="text-[11px] text-muted-foreground/80">{option.description}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-4 shadow-sm sm:px-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-background text-base font-semibold text-primary">
                  {progress}%
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-xs font-medium uppercase text-muted-foreground">Дэвшил</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{currentStep?.label ?? 'Алхам тодорхойгүй'}</span>
                    {currentStep ? (
                      <Badge variant="outline" className="rounded-full border-dashed px-2 text-[11px] text-muted-foreground">
                        Алхам {currentStep.index} / {steps.length}
                      </Badge>
                    ) : null}
                  </div>
                  {currentStep ? (
                    <p className="max-w-xl text-xs text-muted-foreground">{currentStep.description}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Явцын мэдээлэл дутуу байна.</p>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-[220px]">
                <Progress value={progress} className="h-2 rounded-full" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {completedSteps} алхам амжилттай биелсэн.
                </p>
              </div>

              <Separator orientation="vertical" className="hidden h-12 bg-border/60 md:block" />

              <div className="flex flex-col gap-2 min-w-[180px]">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-2 rounded-full border-border/70"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                    >
                      <IconRefresh className={cn('h-4 w-4 transition-transform', isRefreshing && 'animate-spin')} />
                      Шинэчлэх
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Шинэчилсэн цаг: {syncedLabel}
                  </TooltipContent>
                </Tooltip>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <IconInfoCircle className="h-3.5 w-3.5" />
                  <span>
                    {isRefreshing || loading ? 'Мэдээллийг шинэчилж байна…' : `Сүүлд: ${syncedLabel}`}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="bg-border/60" />

            <div className="flex flex-wrap items-center gap-2">
              {steps.map((step) => {
                const Icon = stepIconMap[step.status];
                return (
                  <div
                    key={step.key}
                    className={cn(
                      'flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      stepStatusStyles[step.status]
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
