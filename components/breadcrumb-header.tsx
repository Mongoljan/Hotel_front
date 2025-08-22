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
import UserProfileToggle from '@/components/UserProfileToggle';
import { useAuth } from '@/hooks/useAuth';

const routeNames: Record<string, string> = {
  '/admin': 'Admin',
  '/admin/dashboard': 'Dashboard',
  '/admin/bookings': 'Захиалгууд',
  '/admin/room': 'Өрөөнүүд',
  '/admin/room/price': 'Өрөөний үнэ',
  '/admin/billing': 'Төлбөр тооцоо',
  '/admin/support': 'Дэмжлэг',
  '/admin/hotel': 'Буудлын мэдээлэл',
  '/admin/policies': 'Бодлого',
  '/admin/corporate': 'Байгууллага',
  '/admin/permissions': 'Эрх',
};

export function BreadcrumbHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    return {
      name: routeNames[path] || segment,
      path: path,
      isLast: index === pathSegments.length - 1
    };
  });

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.path} className="flex items-center">
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
          <UserProfileToggle 
            userApproved={user?.approved || false}
            hotelApproved={user?.hotelApproved || false}
          />
        </div>
      </div>
    </header>
  );
}