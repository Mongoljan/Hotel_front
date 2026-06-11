'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, MapPin, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const DefaultLocation = { lat: 47.918873, lng: 106.917017 }; // Ulaanbaatar center
const DefaultZoom = 12;

// Must be defined outside component to avoid recreating array on each render
const LIBRARIES: ['places'] = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function RegisterHotel3({ onNext, onBack }: Props) {
  const [location, setLocation] = useState(DefaultLocation);
  const [mapCenter, setMapCenter] = useState(DefaultLocation);
  const [zoom, setZoom] = useState(DefaultZoom);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const t = useTranslations("3GoogleMap");
  const { user } = useAuth();

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  // Load saved location from UserStorage
  useEffect(() => {
    if (!user?.id) return;
    
    const propertyDataStr = UserStorage.getItem<string>('propertyData', user.id);
    const stored = propertyDataStr ? JSON.parse(propertyDataStr) : {};
    
    if (stored.step3?.location) {
      setLocation(stored.step3.location);
      setMapCenter(stored.step3.location);
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

  const onAutocompleteLoad = useCallback((ac: google.maps.places.Autocomplete) => {
    setAutocomplete(ac);
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const newLoc = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setLocation(newLoc);
        setMapCenter(newLoc);
        setZoom(16);
        toast.success(t('location_updated'));
      }
    }
  }, [autocomplete, t]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setLocation(newLocation);
      toast.success(t('location_updated'));
    }
  }, [t]);

  const handleNext = () => {
    if (!user?.id) {
      toast.error(t('user_info_missing') || 'User information missing');
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
    
    toast.success(t('location_saved'));
    onNext();
  };

  if (loadError) {
    return (
      <div className="flex justify-center items-center">
        <Card className="w-full max-w-[440px] md:max-w-[600px]">
          <CardContent className="pt-6">
            <div className="text-center text-red-500">
              <p>{t('error_loading_map')}</p>
              <p className="text-sm mt-2">{loadError.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4">
      <Card className="w-full max-w-[640px]">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
           
            {t("title")}
          </CardTitle>
          
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {/* Search box — always rendered; uses Google Places Autocomplete when maps API is loaded */}
            {isLoaded ? (
              <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder={t('search_placeholder') || 'Газар, хаягаар хайх...'}
                    className="pl-9 h-10"
                    aria-label={t('search_placeholder') || 'Газар хайх'}
                  />
                </div>
              </Autocomplete>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  disabled
                  placeholder={t('loading_map') || 'Газрын зургийг ачааллаж байна...'}
                  className="pl-9 h-10"
                />
              </div>
            )}

            {/* Google Map */}
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
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
              <div className="w-full h-[400px] bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm">{t('loading_map')}</p>
                </div>
              </div>
            )}

            {/* Current Location Display */}
            {/* <div className="bg-muted/40 border border-border p-2.5 rounded-lg">
              <h4 className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {t("selected_location")}
              </h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span className="text-muted-foreground">{t("latitude")}:</span>
                <span className="font-medium">{location.lat.toFixed(6)}</span>
                <span className="text-muted-foreground">{t("longitude")}:</span>
                <span className="font-medium">{location.lng.toFixed(6)}</span>
              </div>
            </div> */}

            <div className="flex gap-3 pt-3">
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
