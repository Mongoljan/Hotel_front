'use client';

import { useEffect, useMemo, useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EditMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMapLoaded: boolean;
  googleMap: string;
  onGoogleMapChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function EditMapDialog({
  open,
  onOpenChange,
  isMapLoaded,
  googleMap,
  onGoogleMapChange,
  onSave,
  isSaving,
}: EditMapDialogProps) {
  const DEFAULT_LOCATION = { lat: 47.918873, lng: 106.917017 };

  const extractCoordinates = (url: string | null | undefined): { lat: number; lng: number } | null => {
    if (!url) return null;

    const qMatch = url.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (qMatch?.[1] && qMatch?.[2]) {
      return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    }

    const atMatch = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (atMatch?.[1] && atMatch?.[2]) {
      return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    }

    const embedMatch = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    if (embedMatch?.[1] && embedMatch?.[2]) {
      return { lat: parseFloat(embedMatch[1]), lng: parseFloat(embedMatch[2]) };
    }

    return null;
  };

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number }>(DEFAULT_LOCATION);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(DEFAULT_LOCATION);

  useEffect(() => {
    if (!open) return;
    const initialLocation = extractCoordinates(googleMap) || DEFAULT_LOCATION;
    setSelectedLocation(initialLocation);
    setMapCenter(initialLocation);
  }, [open]);

  const generatedGoogleMapUrl = useMemo(() => {
    return `https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`;
  }, [selectedLocation.lat, selectedLocation.lng]);

  useEffect(() => {
    if (!open) return;
    onGoogleMapChange(generatedGoogleMapUrl);
  }, [generatedGoogleMapUrl, onGoogleMapChange, open]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    setSelectedLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    setSelectedLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" preventOutsideClose hideCloseButton>
        <DialogHeader>
          <DialogTitle>Google Map засах</DialogTitle>
          <DialogDescription>
            Газрын зураг дээр дарж байршлаа дахин сонгоно уу.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {isMapLoaded ? (
            <div className="h-[420px] w-full rounded-md overflow-hidden border">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={15}
                onClick={handleMapClick}
                options={{
                  streetViewControl: false,
                  mapTypeControl: true,
                  fullscreenControl: true,
                }}
              >
                <Marker
                  position={selectedLocation}
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                />
              </GoogleMap>
            </div>
          ) : (
            <div className="h-[420px] w-full rounded-md border bg-muted flex items-center justify-center text-sm text-muted-foreground">
              Газрын зураг ачаалж байна...
            </div>
          )}
          <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p>Сонгосон координат: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</p>
            <p className="break-all">Хадгалагдах холбоос: {generatedGoogleMapUrl}</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Болих
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Хадгалж байна...' : 'Хадгалах'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
