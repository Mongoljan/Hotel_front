'use client';

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
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import { Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Map routes to their i18n keys
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
  '/admin/users': 'userSettings',
  '/admin/internal-rules': 'internalRules',
};

// Map routes to their parent menu i18n key (for nested items under collapsible menus)
const routeParentKeys: Record<string, string> = {
  // Routes under "Тохиргоо" (settings)
  '/admin/hotel': 'settings',
  '/admin/room': 'settings',
  '/admin/room/price': 'settings',
  '/admin/room/price-settings': 'settings',
  '/admin/policies': 'settings',
  '/admin/corporate': 'settings',
  '/admin/additional-services': 'settings',
  '/admin/currency': 'settings',
  '/admin/users': 'settings',
  '/admin/internal-rules': 'settings',
};

// Format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function BreadcrumbHeader() {
  const pathname = usePathname();
  const { user, sessionTimeRemaining, refreshSession, isRefreshing } = useAuth();
  const tNav = useTranslations('Navigation');
  
  // Build smart breadcrumbs based on menu hierarchy
  const buildBreadcrumbs = () => {
    const result: { name: string; path: string; isLast: boolean }[] = [];
    
    // Check if this route has a parent menu
    const parentKey = routeParentKeys[pathname];
    
    if (parentKey) {
      // Add the parent menu item (e.g., "Тохиргоо")
      result.push({
        name: tNav(parentKey),
        path: '#', // Parent is not clickable (it's a dropdown)
        isLast: false
      });
    }
    
    // Add the current page
    const currentKey = routeI18nKeys[pathname];
    if (currentKey) {
      result.push({
        name: tNav(currentKey),
        path: pathname,
        isLast: true
      });
    } else {
      // Fallback: use path segment as name
      const segments = pathname.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1] || 'dashboard';
      result.push({
        name: lastSegment,
        path: pathname,
        isLast: true
      });
    }
    
    return result;
  };
  
  const breadcrumbs = buildBreadcrumbs();

  // Determine if session is low (less than 5 minutes)
  const isSessionLow = sessionTimeRemaining !== null && sessionTimeRemaining < 300;
  const isSessionCritical = sessionTimeRemaining !== null && sessionTimeRemaining < 60;

  const handleRefresh = async () => {
    if (isRefreshing) return;
    const result = await refreshSession();
    if (result.success) {
      toast.success('Session шинэчлэгдлээ', {
        description: '30 минутын дараа дахин шинэчлэнэ үү',
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
    <header className="flex h-14 md:h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-10 border-b">
      <div className="flex items-center justify-between w-full px-4 md:px-4 lg:px-5 xl:px-6 2xl:px-8 py-3 md:py-2 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4 hidden sm:block" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={`${breadcrumb.path}-${index}`} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                  <BreadcrumbItem className="hidden md:block">
                    {breadcrumb.isLast ? (
                      <BreadcrumbPage className="text-cyrillic">{breadcrumb.name}</BreadcrumbPage>
                    ) : breadcrumb.path === '#' ? (
                      <span className="text-muted-foreground text-cyrillic">{breadcrumb.name}</span>
                    ) : (
                      <BreadcrumbLink href={breadcrumb.path} className="text-cyrillic">
                        {breadcrumb.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          {/* Session Timer with Refresh Button */}
          {sessionTimeRemaining !== null && (
            <TooltipProvider>
              <div className="flex items-center gap-1">
                {/* Timer Display */}
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-l-md text-xs font-medium",
                    isSessionCritical 
                      ? "bg-destructive/10 text-destructive animate-pulse" 
                      : isSessionLow 
                        ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500" 
                        : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline tabular-nums">{formatTime(sessionTimeRemaining)}</span>
                  <span className="sm:hidden tabular-nums">{Math.floor(sessionTimeRemaining / 60)}м</span>
                </div>
                
                {/* Refresh Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className={cn(
                        "flex items-center justify-center px-2 py-1.5 rounded-r-md text-xs font-medium transition-colors",
                        isSessionCritical 
                          ? "bg-destructive/10 text-destructive hover:bg-destructive/20" 
                          : isSessionLow 
                            ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500/20" 
                            : "bg-muted/50 text-muted-foreground hover:bg-muted",
                        isRefreshing && "cursor-not-allowed opacity-70"
                      )}
                    >
                      <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Session сунгах</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          )}
          
          <LanguageSwitcher />
          <Separator orientation="vertical" className="hidden h-5 md:block" />
          <UserProfileToggle 
            userApproved={user?.approved || false}
            hotelApproved={user?.hotelApproved || false}
          />
        </div>
      </div>
    </header>
  );
}