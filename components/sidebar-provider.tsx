'use client';

import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { BreadcrumbHeader } from '@/components/breadcrumb-header';
import { useAuth } from '@/hooks/useAuth';

const HOTEL_REGISTRATION_COMPLETE_EVENT = 'hotel-registration-complete';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user } = useAuth();

  const [hotelRegistrationCompleted, setHotelRegistrationCompleted] = React.useState(false);

  React.useEffect(() => {
    const checkHotelCompletion = async () => {
      if (!user?.hotel || !user?.id) {
        setHotelRegistrationCompleted(false);
        return;
      }

      const cacheKey = `hotelCompletion_${user.id}_${user.hotel}`;
      if (localStorage.getItem(cacheKey) === 'completed') {
        setHotelRegistrationCompleted(true);
        return;
      }

      try {
        const [detailsRes, imagesRes] = await Promise.all([
          fetch(`https://dev.kacc.mn/api/property-details/?property=${user.hotel}`, { cache: 'no-store' }),
          fetch(`https://dev.kacc.mn/api/property-images/?property=${user.hotel}`, { cache: 'no-store' }),
        ]);

        const details = detailsRes.ok ? await detailsRes.json() : [];
        const images = imagesRes.ok ? await imagesRes.json() : [];
        const hasDetails = Array.isArray(details) && details.length > 0;
        const hasImages = Array.isArray(images) && images.length > 0;
        const isCompleted = hasDetails && hasImages;

        if (isCompleted) {
          localStorage.setItem(cacheKey, 'completed');
        }

        setHotelRegistrationCompleted(isCompleted);
      } catch (err) {
        console.error('Error checking hotel completion:', err);
        setHotelRegistrationCompleted(false);
      }
    };

    checkHotelCompletion();

    const onStorage = (event: StorageEvent) => {
      if (event.key?.startsWith('hotelCompletion_')) {
        checkHotelCompletion();
      }
    };

    const onRegistrationComplete = () => checkHotelCompletion();

    window.addEventListener('storage', onStorage);
    window.addEventListener(HOTEL_REGISTRATION_COMPLETE_EVENT, onRegistrationComplete);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(HOTEL_REGISTRATION_COMPLETE_EVENT, onRegistrationComplete);
    };
  }, [user?.hotel, user?.id]);

  return (
    <SidebarProvider>
      <AppSidebar 
        isApproved={user?.hotelApproved || false}
        userApproved={user?.approved || false}
        hotelRegistrationCompleted={hotelRegistrationCompleted}
        userType={user?.user_type || 0}
      />
      <main className="flex-1 flex flex-col w-full">
        <BreadcrumbHeader />
        <div className="flex-1 px-3 py-3 md:px-4 md:py-4 lg:px-4 lg:py-4 xl:px-5 xl:py-5 2xl:px-6 2xl:py-6 w-full">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}