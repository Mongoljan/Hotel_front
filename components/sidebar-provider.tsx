'use client';

import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { BreadcrumbHeader } from '@/components/breadcrumb-header';
import { useAuth } from '@/hooks/useAuth';
import { useHotelRegistrationCompleted } from '@/hooks/useHotelRegistrationCompleted';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user } = useAuth();
  const { hotelRegistrationCompleted } = useHotelRegistrationCompleted();

  return (
    <SidebarProvider>
      <AppSidebar
        isApproved={user?.hotelApproved || false}
        userApproved={user?.approved || false}
        hotelRegistrationCompleted={hotelRegistrationCompleted}
        userType={user?.user_type || 0}
      />
      <main className="flex min-w-0 w-full flex-1 flex-col bg-background">
        <BreadcrumbHeader />
        <div className="flex min-w-0 w-full flex-1 flex-col rounded-t-2xl bg-background px-4 py-4 lg:px-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
