'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, GoogleMap, Marker } from '@react-google-maps/api';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { Province } from '../types';

interface SoumDistrict {
  id: number;
  name: string;
  code: number;
}

export interface EditLocationData {
  province_city: string;
  soum: string;
  district: string;
  total_floor_number: string;
  detailed_address: string;
  google_map: string;
}

interface EditLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editLocation: EditLocationData;
  onEditLocationChange: (data: EditLocationData) => void;
  provinces: Province[];
  filteredSoums: SoumDistrict[];
  onProvinceChange: (value: string) => void;
  isMapLoaded: boolean;
  onSave: () => void;
  isSaving: boolean;
}

const SHEET_WIDTH = 480;
const DEFAULT_LOCATION = { lat: 47.918873, lng: 106.917017 };

function extractCoordinates(url: string | null | undefined): { lat: number; lng: number } | null {
  if (!url) return null;
  const qMatch = url.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (qMatch?.[1] && qMatch?.[2]) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  const atMatch = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch?.[1] && atMatch?.[2]) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  const embedMatch = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (embedMatch?.[1] && embedMatch?.[2]) return { lat: parseFloat(embedMatch[1]), lng: parseFloat(embedMatch[2]) };
  return null;
}

export function EditLocationDialog({
  open,
  onOpenChange,
  editLocation,
  onEditLocationChange,
  provinces,
  filteredSoums,
  onProvinceChange,
  isMapLoaded,
  onSave,
  isSaving,
}: EditLocationDialogProps) {
  const t = useTranslations('SixStepInfo');
  const tAddr = useTranslations('2ConfirmAddress');

  const [draftLocation, setDraftLocation] = useState<EditLocationData>(editLocation);
  const lastSavedRef = useRef<EditLocationData>(editLocation);
  const [mapLocation, setMapLocation] = useState(DEFAULT_LOCATION);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const changed =
      editLocation.province_city !== lastSavedRef.current.province_city ||
      editLocation.soum !== lastSavedRef.current.soum ||
      editLocation.district !== lastSavedRef.current.district ||
      editLocation.total_floor_number !== lastSavedRef.current.total_floor_number ||
      editLocation.detailed_address !== lastSavedRef.current.detailed_address ||
      editLocation.google_map !== lastSavedRef.current.google_map;

    if (changed) {
      setDraftLocation(editLocation);
      lastSavedRef.current = editLocation;
    }
  }, [editLocation]);

  useEffect(() => {
    onEditLocationChange(draftLocation);
  }, [draftLocation, onEditLocationChange]);

  useEffect(() => {
    if (!open) return;
    const coords = extractCoordinates(draftLocation.google_map) || DEFAULT_LOCATION;
    setMapLocation(coords);
  }, [open, draftLocation.google_map]);

  const generatedMapUrl = useMemo(
    () => `https://www.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}`,
    [mapLocation.lat, mapLocation.lng]
  );

  useEffect(() => {
    if (!open) return;
    if (draftLocation.google_map !== generatedMapUrl) {
      setDraftLocation((prev) => ({ ...prev, google_map: generatedMapUrl }));
    }
  }, [generatedMapUrl, open]);

  const onPlaceChanged = useCallback(() => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (place.geometry?.location) {
      const newLoc = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setMapLocation(newLoc);
    }
  }, [autocomplete]);

  const addressMinOk = draftLocation.detailed_address.trim().length >= 20;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        fallbackTitle={t('locationSheetTitle')}
        className="flex h-full flex-col gap-0 p-0 sm:max-w-none"
        style={{ width: SHEET_WIDTH, maxWidth: SHEET_WIDTH }}
      >
        <SheetHeader className="border-b px-5 py-4 space-y-0">
          <SheetTitle className="text-base font-semibold">{t('locationSheetTitle')}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <div className="space-y-2">
            <Label>{tAddr('province_label')}</Label>
            <Select
              value={draftLocation.province_city}
              onValueChange={(value) => {
                setDraftLocation({ ...draftLocation, province_city: value, soum: '' });
                onProvinceChange(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={tAddr('province_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((prov) => (
                  <SelectItem key={prov.id} value={String(prov.id)}>{prov.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{tAddr('soum_label')}</Label>
            <Select
              value={draftLocation.soum}
              onValueChange={(value) => setDraftLocation({ ...draftLocation, soum: value })}
              disabled={!draftLocation.province_city || filteredSoums.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={tAddr('soum_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {filteredSoums.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{tAddr('district_label')}</Label>
            <Input
              type="number"
              min={1}
              value={draftLocation.district}
              onChange={(e) => setDraftLocation({ ...draftLocation, district: e.target.value })}
              placeholder={tAddr('district_placeholder')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('detailedAddressLabel')}</Label>
            <Textarea
              value={draftLocation.detailed_address}
              onChange={(e) => setDraftLocation({ ...draftLocation, detailed_address: e.target.value })}
              placeholder={t('detailedAddressPlaceholder')}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">{t('addressMinHint')}</p>
          </div>

          <div className="space-y-2">
            <Label>{t('googleMapLinkLabel')}</Label>
            {isMapLoaded ? (
              <Autocomplete onLoad={setAutocomplete} onPlaceChanged={onPlaceChanged}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder={t('googleMapSearchPlaceholder')} />
                </div>
              </Autocomplete>
            ) : (
              <Input disabled placeholder={t('mapLoading')} />
            )}
            <div className="h-[200px] rounded-lg overflow-hidden border">
              {isMapLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mapLocation}
                  zoom={15}
                  onClick={(e) => {
                    if (!e.latLng) return;
                    setMapLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                  }}
                  options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
                >
                  <Marker
                    position={mapLocation}
                    draggable
                    onDragEnd={(e) => {
                      if (!e.latLng) return;
                      setMapLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                    }}
                  />
                </GoogleMap>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground bg-muted/40">
                  {t('mapLoading')}
                </div>
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="border-t px-5 py-4 flex-row gap-3 sm:justify-end">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {t('close')}
          </Button>
          <Button
            className="flex-1 bg-[#84CC16] hover:bg-[#73b512] text-white"
            onClick={onSave}
            disabled={isSaving || !addressMinOk}
          >
            {isSaving ? t('saving') : t('save')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
