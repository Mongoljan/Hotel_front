'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconMapPin, IconRoad, IconBuildingEstate } from '@tabler/icons-react';

interface Address {
  id: number;
  zipCode: string;
  total_floor_number: number;
  province_city: number;
  soum: number;
  district: number;
}

interface PropertyBaseInfo {
  location: string;
  phone: string;
  mail: string;
}

interface PropertyDetail {
  google_map: string;
}

interface LocationTabProps {
  address: Address | null;
  propertyBaseInfo: PropertyBaseInfo | null;
  propertyDetail: PropertyDetail | null;
}

export default function LocationTab({ address, propertyBaseInfo, propertyDetail }: LocationTabProps) {
  return (
    <div className="space-y-6">
      {/* Address Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyrillic">
            <IconMapPin className="h-5 w-5 text-primary" />
            Хаяг, байршил
          </CardTitle>
          <CardDescription>Зочид буудлын дэлгэрэнгүй хаяг мэдээлэл</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Дэлгэрэнгүй хаяг</label>
              <p className="text-base">{propertyBaseInfo?.location || '—'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Шуудангийн индекс</label>
              <p className="text-base">{address?.zipCode || '—'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Нийт давхар</label>
              <p className="text-base">{address?.total_floor_number || '—'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Утас</label>
              <p className="text-base">{propertyBaseInfo?.phone || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Maps Card */}
      {propertyDetail?.google_map && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyrillic">
              <IconRoad className="h-5 w-5 text-primary" />
              Газрын зураг
            </CardTitle>
            <CardDescription>Google Maps дээрх байршил</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full overflow-hidden rounded-lg border">
              <iframe
                src={propertyDetail.google_map}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
            <div className="mt-4">
              <a
                href={propertyDetail.google_map}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Google Maps дээр үзэх →
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyrillic">
            <IconBuildingEstate className="h-5 w-5 text-primary" />
            Холбоо барих
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm font-medium">И-мэйл</span>
            <span className="text-sm text-muted-foreground">{propertyBaseInfo?.mail || '—'}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm font-medium">Утас</span>
            <span className="text-sm text-muted-foreground">{propertyBaseInfo?.phone || '—'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
