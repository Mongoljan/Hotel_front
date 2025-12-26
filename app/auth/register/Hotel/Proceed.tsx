'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, Clock, Building, MapPin, Phone, Mail, Calendar, Star, User, CreditCard } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type PropertyType = {
  id: number;
  name_en: string;
  name_mn: string;
};

type HotelDataType = {
  pk: number;
  register: string;
  CompanyName: string;
  PropertyName: string;
  location: string;
  property_type: number;
  phone: string;
  mail: string;
  is_approved: boolean;
  created_at: string;
};

interface PropertyBasicInfo {
  property_name_mn?: string;
  property_name_en?: string;
  total_hotel_rooms?: number;
  star_rating?: number;
}

type ProceedProps = {
  proceed?: number;
  setProceed?: (value: number) => void;
  setView?: (view: 'proceed' | 'register') => void;
  hotelId?: string | number | null;
  onContinue?: () => void;
  hotelApproved?: boolean;
  basicInfo?: PropertyBasicInfo | null;
  getPropertyTypeName?: (id: number) => string;
};

const Proceed: React.FC<ProceedProps> = ({ 
  proceed,
  setProceed,
  setView,
  hotelId, 
  onContinue, 
  hotelApproved, 
  basicInfo,
  getPropertyTypeName 
}) => {
  const t = useTranslations('Proceed');
  const tLoading = useTranslations('Loading');
  const tError = useTranslations('Error');
  const locale = useLocale();
  const { user } = useAuth();
  const [hotelData, setHotelData] = useState<HotelDataType | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const currentHotelId = hotelId || user?.hotel;
      if (!currentHotelId) {
        setError(tError('hotelIdMissing'));
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch hotel data and property types in parallel
        const [hotelResponse, combinedResponse] = await Promise.all([
          fetch(`https://dev.kacc.mn/api/properties/${currentHotelId}`),
          fetch('https://dev.kacc.mn/api/combined-data/')
        ]);

        if (!hotelResponse.ok) {
          throw new Error(`Failed to fetch hotel data: ${hotelResponse.status}`);
        }

        if (!combinedResponse.ok) {
          throw new Error(`Failed to fetch property types: ${combinedResponse.status}`);
        }

        const hotelData = await hotelResponse.json();
        const combinedData = await combinedResponse.json();

        setHotelData(hotelData);
        setPropertyTypes(combinedData.property_types || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(tError('failedToLoadHotelInfo'));
        toast.error(tError('failedToLoadHotelInfo'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [hotelId, user?.hotel]);

  // Smart property type display with dynamic text based on API and locale
  const getSmartPropertyTypeDisplay = (propertyTypeId: number): string => {
    const propertyType = propertyTypes.find(pt => pt.id === propertyTypeId);
    if (!propertyType) return '—';

    // If it's a hotel type, show hotel-specific registration text
    const isHotel = propertyType.name_en.toLowerCase().includes('hotel') || 
                   propertyType.name_mn.includes('зочид буудал');

    if (isHotel) {
      return locale === 'mn' ? 'зочид буудал бүртгэлийн' : 'hotel registration';
    }
    
    // For other property types, show generic property registration text
    return locale === 'mn' ? 'үл хөдлөх хөрөнгийн бүртгэл' : 'property registration';
  };

  const getPropertyTypeDisplay = (propertyTypeId: number): string => {
    if (getPropertyTypeName) {
      return getPropertyTypeName(propertyTypeId);
    }
    
    const propertyType = propertyTypes.find(pt => pt.id === propertyTypeId);
    return locale === 'mn' ? (propertyType?.name_mn || '—') : (propertyType?.name_en || '—');
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString(locale === 'mn' ? 'mn-MN' : 'en-US');
    } catch {
      return dateString;
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else if (setView) {
      setView('register');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">{tLoading('loadingHotelInfo')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !hotelData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border-destructive/50">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-destructive/10 p-4 mb-6">
              <Building className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-lg text-destructive mb-2">
              {tError('errorLoadingHotelInfo')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{error || tLoading('hotelDataNotFound')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = basicInfo?.property_name_mn || hotelData.PropertyName || '—';
  const propertyTypeLabel = getSmartPropertyTypeDisplay(hotelData.property_type);
  const propertyTypeName = getPropertyTypeDisplay(hotelData.property_type);
  const isApproved = hotelApproved !== undefined ? hotelApproved : hotelData.is_approved;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">{t('title')}</h2>
        <Badge 
          variant={isApproved ? "default" : "secondary"} 
          className={isApproved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}
        >
          {isApproved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              {t('4')}
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 mr-2" />
              {t('pendingApproval')}
            </>
          )}
        </Badge>
      </div>

      {/* Simple Info Grid */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">{t('1')}:</span>
              <p className="font-medium">{hotelData.CompanyName}</p>
            </div>
            <div>
              <span className="text-gray-600">{t('2')}:</span>
              <p className="font-medium">{hotelData.phone}</p>
            </div>
            <div>
              <span className="text-gray-600">{t('3')}:</span>
              <p className="font-medium">{hotelData.mail}</p>
            </div>
            <div>
              <span className="text-gray-600">{t('4')}:</span>
              <p className="font-medium">{isApproved ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Status Message inside card */}
          {!isApproved && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  {t('tooltip_wait_approval')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Continue Button */}
      {isApproved && (
        <div className="flex justify-center">
          <Button onClick={handleContinue} className="px-8">
            {t('5')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Proceed;