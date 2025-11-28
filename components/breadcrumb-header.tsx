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

const routeI18nKeys: Record<string, string> = {
  '/admin': 'dashboard',
  '/admin/dashboard': 'dashboard',
  '/admin/bookings': 'bookings',
  '/admin/room': 'rooms',
  '/admin/room/price': 'roomPrice',
  '/admin/billing': 'billing',
  '/admin/support': 'support',
  '/admin/hotel': 'hotelInfo',
  '/admin/policies': 'policies',
  '/admin/corporate': 'corporate',
  '/admin/permissions': 'permissions',
};

export function BreadcrumbHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const tNav = useTranslations('Navigation');
  
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const key = routeI18nKeys[path];
    // Fix admin route to go to dashboard instead
    const finalPath = path === '/admin' ? '/admin/dashboard' : path;
    return {
      name: key ? tNav(key) : segment,
      path: finalPath,
      isLast: index === pathSegments.length - 1
    };
  });

  return (
    <header className="flex h-10 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-9 border-b">
      <div className="flex items-center justify-between w-full px-1 md:px-1.5 lg:px-2 xl:px-3 2xl:px-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={`${breadcrumb.path}-${index}`} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                  <BreadcrumbItem className="hidden md:block">
                    {breadcrumb.isLast ? (
                      <BreadcrumbPage className="text-cyrillic">{breadcrumb.name}</BreadcrumbPage>
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
        
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Separator orientation="vertical" className="hidden h-6 md:block" />
          <UserProfileToggle 
            userApproved={user?.approved || false}
            hotelApproved={user?.hotelApproved || false}
          />
        </div>
      </div>
    </header>
  );
}