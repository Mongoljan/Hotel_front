'use client';

import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { BreadcrumbHeader } from '@/components/breadcrumb-header';
import { useAuth } from '@/hooks/useAuth';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user } = useAuth();
  
  // Check if hotel registration (6 steps) is completed
  const [hotelRegistrationCompleted, setHotelRegistrationCompleted] = React.useState(false);
  
  React.useEffect(() => {
    const checkHotelCompletion = async () => {
      if (!user?.hotel) {
        setHotelRegistrationCompleted(false);
        return;
      }

      try {
        // Check if property details exist (indicates 6-step completion)
        const res = await fetch(
          `https://dev.kacc.mn/api/property-details/?property=${user.hotel}`,
          { cache: 'no-store' }
        );
        const details = await res.json();
        const isCompleted = Array.isArray(details) && details.length > 0;
        setHotelRegistrationCompleted(isCompleted);
      } catch (err) {
        console.error('Error checking hotel completion:', err);
        setHotelRegistrationCompleted(false);
      }
    };

    checkHotelCompletion();
  }, [user?.hotel]);
  
  console.log('SidebarLayout - user state:', {
    user,
    hotelApproved: user?.hotelApproved,
    userApproved: user?.approved,
    hotelRegistrationCompleted
  });
  
  return (
    <SidebarProvider>
      <AppSidebar 
        isApproved={user?.hotelApproved || false}
        userApproved={user?.approved || false}
        hotelRegistrationCompleted={hotelRegistrationCompleted}
      />
      <main className="flex-1 flex flex-col w-full">
        <BreadcrumbHeader />
        <div className="flex-1 px-1 md:px-1.5 lg:px-2 xl:px-3 2xl:px-4 py-4 md:py-5 lg:py-6 max-w-screen-2xl mx-auto w-full">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}