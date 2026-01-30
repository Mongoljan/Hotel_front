'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconClock, IconBuilding, IconCheck } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';

interface HotelData {
  pk: number;
  CompanyName: string;
  PropertyName: string;
  phone: string;
  mail: string;
  is_approved: boolean;
}

export default function StaffWaitingView() {
  const t = useTranslations('StaffWaiting');
  const { user } = useAuth();
  const [hotelData, setHotelData] = useState<HotelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isUserApproved = user?.approved;
  const roleName = user?.user_type === 3 ? t('manager') : t('reception');

  useEffect(() => {
    const fetchHotelData = async () => {
      if (!user?.hotel) return;
      
      try {
        const res = await fetch(`https://dev.kacc.mn/api/properties/${user.hotel}`);
        if (res.ok) {
          const data = await res.json();
          setHotelData(data);
        }
      } catch (error) {
        console.error('Error fetching hotel data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotelData();
  }, [user?.hotel]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      {/* Status Icon */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
          isUserApproved 
            ? 'bg-green-100 dark:bg-green-900/30' 
            : 'bg-amber-100 dark:bg-amber-900/30'
        }`}>
          {isUserApproved ? (
            <IconCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
          ) : (
            <IconClock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isUserApproved ? t('approvedTitle') : t('pendingTitle')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('role')}: <span className="font-medium">{roleName}</span>
          </p>
        </div>

        <Badge 
          variant={isUserApproved ? "default" : "secondary"}
          className={isUserApproved 
            ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" 
            : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
          }
        >
          {isUserApproved ? t('approved') : t('pending')}
        </Badge>
      </div>

      {/* Hotel Info Card */}
      {hotelData && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <IconBuilding className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{hotelData.PropertyName}</h3>
                <p className="text-sm text-muted-foreground">{hotelData.CompanyName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('phone')}:</span>
                <p className="font-medium">{hotelData.phone}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('email')}:</span>
                <p className="font-medium truncate">{hotelData.mail}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message */}
      <Card className={isUserApproved ? "border-green-200 dark:border-green-800" : "border-amber-200 dark:border-amber-800"}>
        <CardContent className="p-4">
          <p className={`text-sm ${isUserApproved ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
            {isUserApproved ? t('approvedMessage') : t('pendingMessage')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
