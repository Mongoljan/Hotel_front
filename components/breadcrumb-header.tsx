'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UserProfileToggle from '@/components/UserProfileToggle';
import { NewBookingSheet } from '@/components/NewBookingSheet';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { useAuth } from '@/hooks/useAuth';
import { useHotelRegistrationCompleted } from '@/hooks/useHotelRegistrationCompleted';
import { useTranslations } from 'next-intl';
import { Bell, Clock, Plus, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { PAGE_CONTAINER_CLASS } from '@/lib/layout';

const routeI18nKeys: Record<string, string> = {
  '/admin': 'dashboard',
  '/admin/dashboard': 'dashboard',
  '/admin/reception': 'reception',
  '/admin/bookings': 'bookings',
  '/admin/housekeeping': 'housekeeping',
  '/admin/room-blocks': 'roomBlocks',
  '/admin/billing': 'billing',
  '/admin/guest-registration': 'guestRegistration',
  '/admin/support': 'support',
  '/admin/hotel': 'hotelInfo',
  '/admin/room': 'rooms',
  '/admin/room/price': 'roomPrice',
  '/admin/room/price-settings': 'priceSettings',
  '/admin/policies': 'policies',
  '/admin/corporate': 'corporate',
  '/admin/additional-services': 'additionalServices',
  '/admin/currency': 'currencyPayment',
  '/admin/payment-config': 'paymentTools',
  '/admin/users': 'userSettings',
  '/admin/internal-rules': 'internalRules',
};

const routeParentKeys: Record<string, string> = {
  '/admin/hotel': 'settings',
  '/admin/room': 'settings',
  '/admin/room/price': 'settings',
  '/admin/room/price-settings': 'settings',
  '/admin/policies': 'settings',
  '/admin/corporate': 'settings',
  '/admin/additional-services': 'settings',
  '/admin/currency': 'settings',
  '/admin/payment-config': 'settings',
  '/admin/users': 'settings',
  '/admin/internal-rules': 'settings',
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function BreadcrumbHeader() {
  const pathname = usePathname();
  const { user, sessionTimeRemaining, refreshSession, isRefreshing } = useAuth();
  const { hotelRegistrationCompleted } = useHotelRegistrationCompleted();
  const tNav = useTranslations('Navigation');
  const [newBookingOpen, setNewBookingOpen] = useState(false);

  const isStaffUser = user?.user_type === 3 || user?.user_type === 4;
  const isApproved = user?.approved;
  const hideSettingsBreadcrumb = isStaffUser && !isApproved;

  const showHotelFullTopbar =
    pathname === '/admin/hotel' &&
    Boolean(user?.approved && user?.hotelApproved && hotelRegistrationCompleted);

  const buildBreadcrumbs = () => {
    const result: { name: string; path: string; isLast: boolean }[] = [];

    if (hideSettingsBreadcrumb && pathname === '/admin/hotel') {
      result.push({
        name: tNav('waitingApproval') || 'Зөвшөөрөл хүлээгдэж байна',
        path: pathname,
        isLast: true,
      });
      return result;
    }

    const parentKey = routeParentKeys[pathname];

    if (parentKey) {
      result.push({
        name: tNav(parentKey),
        path: '#',
        isLast: false,
      });
    }

    const currentKey = routeI18nKeys[pathname];
    if (currentKey) {
      result.push({
        name: tNav(currentKey),
        path: pathname,
        isLast: true,
      });
    } else {
      const segments = pathname.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1] || 'dashboard';
      result.push({
        name: lastSegment,
        path: pathname,
        isLast: true,
      });
    }

    return result;
  };

  const breadcrumbs = buildBreadcrumbs();

  const isSessionLow = sessionTimeRemaining !== null && sessionTimeRemaining < 300;
  const isSessionCritical = sessionTimeRemaining !== null && sessionTimeRemaining < 60;

  const handleRefresh = async () => {
    if (isRefreshing) return;
    const result = await refreshSession();
    if (result.success) {
      toast.success('Session шинэчлэгдлээ', {
        description: '60 минутын дотор дахин шинэчилнэ үү',
        duration: 3000,
      });
    } else {
      toast.error('Session шинэчлэхэд алдаа гарлаа', {
        description: result.error || 'Дахин оролдоно уу',
        duration: 4000,
      });
    }
  };

  return (
    <>
      <header className="flex h-14 md:h-16 w-full shrink-0 items-center bg-card transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-14">
        <div className={cn('flex w-full items-center justify-between gap-4 py-3', PAGE_CONTAINER_CLASS)}>
          <div className="flex items-center gap-2 min-w-0">
            <SidebarTrigger className="-ml-1 shrink-0 md:hidden" />
            <Separator orientation="vertical" className="mr-2 h-5 hidden sm:block md:hidden" />
            <Breadcrumb>
              <BreadcrumbList className="flex-wrap gap-1">
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={`${breadcrumb.path}-${index}`} className="flex items-center">
                    {index > 0 && <BreadcrumbSeparator className="hidden md:block mx-1" />}
                    <BreadcrumbItem className="hidden md:block">
                      {breadcrumb.isLast ? (
                        <BreadcrumbPage className="text-cyrillic text-2xl font-medium leading-none text-foreground">
                          {breadcrumb.name}
                        </BreadcrumbPage>
                      ) : breadcrumb.path === '#' ? (
                        <span className="text-muted-foreground text-cyrillic text-2xl font-medium leading-none">
                          {breadcrumb.name}
                        </span>
                      ) : (
                        <BreadcrumbLink
                          href={breadcrumb.path}
                          className="text-cyrillic text-2xl font-medium leading-none text-muted-foreground"
                        >
                          {breadcrumb.name}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {showHotelFullTopbar && (
              <>
                <Button
                  type="button"
                  onClick={() => setNewBookingOpen(true)}
                  className="h-9 rounded-full bg-primary-gradient hover:brightness-[0.96] text-primary-foreground px-4 text-sm font-medium shadow-sm"
                >
                  <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/25">
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  {tNav('newBooking')}
                </Button>

                <button
                  type="button"
                  className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
                  aria-label={tNav('newBooking')}
                  onClick={() => setNewBookingOpen(true)}
                >
                  <Bell className="h-4 w-4 transition-opacity group-hover:opacity-0" />
                  <Plus className="absolute h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={2.5} />
                </button>
              </>
            )}

            {sessionTimeRemaining !== null && (
              <TooltipProvider>
                <div className="flex items-center gap-1">
                  <div
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-1.5 rounded-l-md text-sm font-medium',
                      isSessionCritical
                        ? 'bg-destructive/10 text-destructive animate-pulse'
                        : isSessionLow
                          ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500'
                          : 'bg-muted/50 text-muted-foreground'
                    )}
                  >
                    
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline tabular-nums">{formatTime(sessionTimeRemaining)}</span>
                    <span className="sm:hidden tabular-nums">{Math.floor(sessionTimeRemaining / 60)}м</span>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={cn(
                          'flex items-center justify-center px-2 py-1.5 rounded-r-md text-sm font-medium transition-colors',
                          isSessionCritical
                            ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                            : isSessionLow
                              ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500/20'
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted',
                          isRefreshing && 'cursor-not-allowed opacity-70'
                        )}
                      >
                        <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Session сунгах</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            )}

            <ThemeSwitcher />
            <LanguageSwitcher />
            <Separator orientation="vertical" className="hidden h-5 md:block" />
            <UserProfileToggle
              userApproved={user?.approved || false}
              hotelApproved={user?.hotelApproved || false}
            />
          </div>
        </div>
      </header>

      <NewBookingSheet open={newBookingOpen} onOpenChange={setNewBookingOpen} />
    </>
  );
}
