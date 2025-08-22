'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { BreadcrumbHeader } from '@/components/breadcrumb-header';
import { useAuth } from '@/hooks/useAuth';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user } = useAuth();
  
  return (
    <SidebarProvider>
      <AppSidebar 
        isApproved={user?.hotelApproved || false}
        userApproved={user?.approved || false}
      />
      <main className="flex-1 flex flex-col w-full">
        <BreadcrumbHeader />
        <div className="flex-1 p-4 md:p-6 pt-0">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}