'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const DefaultLocation = { lat: 47.918873, lng: 106.917017 }; // Ulaanbaatar center
const DefaultZoom = 12;

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '8px',
};

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function RegisterHotel3({ onNext, onBack }: Props) {
  const [location, setLocation] = useState(DefaultLocation);
  const [zoom, setZoom] = useState(DefaultZoom);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const t = useTranslations("3GoogleMap");
  const { user } = useAuth();

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // Load saved location from UserStorage
  useEffect(() => {
    if (!user?.id) return;
    
    const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
    const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
    
    if (stored.step3?.location) {
      setLocation(stored.step3.location);
      if (stored.step3.zoom) {
        setZoom(stored.step3.zoom);
      }
    }
  }, [user?.id]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setLocation(newLocation);
      toast.success(t('location_updated') || 'Байршил сонгогдлоо');
    }
  }, [t]);

  const handleNext = () => {
    if (!user?.id) {
      toast.error('User information missing');
      return;
    }

    // Save location data to UserStorage
    const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
    const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
    
    // Generate Google Maps URL
    const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    
    stored.step3 = {
      location: location,
      zoom: zoom,
      googleMapsUrl: googleMapsUrl,
    };
    
    // Also save to step6 for backend submission
    stored.step6 = stored.step6 || {};
    stored.step6.google_map = googleMapsUrl;
    
    UserStorage.setItem('propertyData', JSON.stringify(stored), user.id);
    
    toast.success(t('location_saved') || 'Байршил хадгалагдлаа');
    onNext();
  };

  if (loadError) {
    return (
      <div className="flex justify-center items-center">
        <Card className="w-full max-w-[440px] md:max-w-[600px]">
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              <p>Error loading Google Maps</p>
              <p className="text-sm mt-2">{loadError.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-[440px] md:max-w-[600px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <MapPin className="h-6 w-6" />
            {t("title")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("description") || "Газрын зураг дээр дарж буудлын байршлыг сонгоно уу"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Google Map */}
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={location}
                zoom={zoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={handleMapClick}
                onZoomChanged={() => {
                  if (map) {
                    const currentZoom = map.getZoom();
                    if (currentZoom) {
                      setZoom(currentZoom);
                    }
                  }
                }}
                options={{
                  streetViewControl: false,
                  mapTypeControl: true,
                  fullscreenControl: true,
                }}
              >
                <Marker position={location} />
              </GoogleMap>
            ) : (
              <div className="w-full h-[400px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm">Loading Google Maps...</p>
                </div>
              </div>
            )}

            {/* Current Location Display */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2 text-gray-900">
                <MapPin className="h-4 w-4 text-blue-600" />
                {t("selected_location") || "Сонгосон байршил:"}
              </h4>
              <p className="text-sm text-gray-700">
                <strong>{t("latitude") || "Өргөрөг"}:</strong> {location.lat.toFixed(6)}
              </p>
              <p className="text-sm text-gray-700">
                <strong>{t("longitude") || "Уртраг"}:</strong> {location.lng.toFixed(6)}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                <strong>Google Maps URL:</strong>{' '}
                <a 
                  href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                >
                  https://www.google.com/maps?q={location.lat},{location.lng}
                </a>
              </p>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                {t("1")}
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1"
              >
                {t("2")}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
