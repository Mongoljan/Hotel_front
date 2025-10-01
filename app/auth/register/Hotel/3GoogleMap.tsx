'use client';

import React, { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { schemaRegistration } from '../../../schema';
import { z } from 'zod';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const DefaultLocation = { lat: 47.918873, lng: 106.917017 };
const DefaultZoom = 10;

type FormFields = z.infer<typeof schemaRegistration>;

type Props = {
  onNext: () => void;
  onBack: () => void;
};

export default function RegisterHotel2({ onNext, onBack }: Props) {
  const [location, setLocation] = useState(DefaultLocation);
  const [zoom, setZoom] = useState(DefaultZoom);
  const t = useTranslations("3GoogleMap");

  const handleNext = () => {
    toast.success(t('location_saved'));
    onNext();
  };

  return (
    <div className="flex justify-center items-center">

      <Card className="w-full max-w-[440px] md:max-w-[500px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <MapPin className="h-6 w-6" />
            {t("title")}
          </CardTitle>
          <CardDescription className="text-center">
            Select your hotel location on the map
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Google Map Placeholder */}
            <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Google Map Integration</p>
                <p className="text-xs">Map component will be implemented here</p>
              </div>
            </div>

            {/* Current Location Display */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Current Location:</h4>
              <p className="text-sm text-muted-foreground">
                Latitude: {location.lat.toFixed(6)}
              </p>
              <p className="text-sm text-muted-foreground">
                Longitude: {location.lng.toFixed(6)}
              </p>
              <p className="text-sm text-muted-foreground">
                Zoom Level: {zoom}
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
