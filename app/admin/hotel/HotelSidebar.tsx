'use client';

import * as React from 'react';
import {
  IconChecklist,
  IconCircleCheck,
  IconClockHour4,
  IconHelp,
  IconHomeCog,
  IconInfoCircle,
  IconMail,
  IconPhone,
} from '@tabler/icons-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useHotelOnboarding } from './hotel-onboarding-context';

const statusStyles: Record<string, string> = {
  complete: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
  current: 'bg-primary/10 text-primary border border-primary/20',
  upcoming: 'bg-muted text-muted-foreground border border-border/60'
};

const statusIconMap = {
  complete: IconCircleCheck,
  current: IconClockHour4,
  upcoming: IconInfoCircle
};

const quickActions = [
  {
    label: 'Дэлгэрэнгүй мэдээлэл',
    description: 'Өрөө болон үйлчилгээний мэдээллээ шинэчилнэ үү',
    href: '#hotel-details',
    icon: IconHomeCog
  },
  {
    label: 'Өргөдлийн явц',
    description: 'Бүртгэлийн явцыг толгойлж хянах',
    href: '#onboarding-status',
    icon: IconChecklist
  }
];

export function HotelSidebar() {
  const { hotelInfo, hotelApproved, steps, progress, lastSyncedAt, refresh, loading } = useHotelOnboarding();

  const statusBadge = hotelApproved ? {
    label: 'Баталгаажсан',
    className: 'bg-emerald-500/10 text-emerald-600'
  } : {
    label: 'Шалгагдаж байна',
    className: 'bg-amber-500/10 text-amber-600'
  };

  const syncedAtLabel = lastSyncedAt
    ? lastSyncedAt.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
    : '––';

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar">
      <SidebarHeader className="space-y-3 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase text-muted-foreground">Property onboarding</span>
          <h2 className="text-lg font-semibold leading-tight">
            {hotelInfo?.propertyName || 'Байрлал сонгож байна'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {hotelInfo?.companyName || 'Тохиргооны мэдээлэл оруулаагүй байна'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn('rounded-full px-3 py-1 text-xs font-medium', statusBadge.className)}>
            {statusBadge.label}
          </Badge>
          {hotelInfo?.groupName ? (
            <Badge variant="outline" className="rounded-full border-dashed px-3 text-xs text-muted-foreground">
              {hotelInfo.groupName}
            </Badge>
          ) : null}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Ahиц</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 overflow-hidden rounded-full" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="py-0">
          <SidebarGroupLabel>Төлөвийн тойм</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {steps.map((step) => {
                const Icon = statusIconMap[step.status];
                return (
                  <SidebarMenuItem key={step.key} className="flex-col items-start gap-2">
                    <div className={cn('flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm shadow-sm transition-colors', statusStyles[step.status])}>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-xs font-semibold">
                          {step.index}
                        </span>
                        <span className="font-medium">{step.label}</span>
                      </div>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        <SidebarGroup>
          <SidebarGroupLabel>Түргэн үйлдэл</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild tooltip={item.label} className="gap-3 rounded-xl border border-dashed border-border/70 bg-background/80 text-left shadow-sm">
                    <a href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="space-y-3 border-t border-border/60 px-4 py-5">
        <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Сүүлд шинэчилсэн</span>
            <span className="font-medium text-foreground">{syncedAtLabel}</span>
          </div>
          <Separator className="my-2" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 text-xs"
            disabled={loading}
            onClick={() => refresh().catch(() => null)}
          >
            <IconInfoCircle className="h-4 w-4" />
            Шинэчлэх
          </Button>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
          <p className="flex items-center gap-2 font-medium text-primary">
            <IconHelp className="h-4 w-4" /> Тусламж хэрэгтэй байна уу?
          </p>
          <p className="mt-2 text-muted-foreground">
            Манай баг таныг бүртгэлийн явцад дэмжихэд бэлэн байна.
          </p>
          <div className="mt-3 grid gap-2">
            <Button variant="secondary" size="sm" className="h-8 gap-2 justify-start text-left">
              <IconPhone className="h-4 w-4" /> 7000-0000
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-2 justify-start text-left">
              <IconMail className="h-4 w-4" /> support@hotel.mn
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
