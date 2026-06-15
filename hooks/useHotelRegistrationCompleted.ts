'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';

const HOTEL_REGISTRATION_COMPLETE_EVENT = 'hotel-registration-complete';

export function useHotelRegistrationCompleted() {
  const { user } = useAuth();
  const [hotelRegistrationCompleted, setHotelRegistrationCompleted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkHotelCompletion = useCallback(async () => {
    if (!user?.hotel || !user?.id) {
      setHotelRegistrationCompleted(false);
      setIsChecking(false);
      return;
    }

    const cacheKey = `hotelCompletion_${user.id}_${user.hotel}`;
    if (localStorage.getItem(cacheKey) === 'completed') {
      setHotelRegistrationCompleted(true);
      setIsChecking(false);
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
    } finally {
      setIsChecking(false);
    }
  }, [user?.hotel, user?.id]);

  useEffect(() => {
    setIsChecking(true);
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
  }, [checkHotelCompletion]);

  return { hotelRegistrationCompleted, isChecking };
}
