'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconSparkles, IconCheck } from '@tabler/icons-react';

interface Facility {
  id: number;
  name_en: string;
  name_mn: string;
}

interface ServicesTabProps {
  facilityIds: number[];
  hotelId: number;
}

export default function ServicesTab({ facilityIds, hotelId }: ServicesTabProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const res = await fetch('https://dev.kacc.mn/api/combined-data/');
        if (res.ok) {
          const data = await res.json();
          const allFacilities = data.general_facilities || [];
          // Filter to only show facilities that are in facilityIds
          const selectedFacilities = allFacilities.filter((f: Facility) =>
            facilityIds.includes(f.id)
          );
          setFacilities(selectedFacilities);
        }
      } catch (error) {
        console.error('Error loading facilities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFacilities();
  }, [facilityIds]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Үйлчилгээний мэдээлэл ачааллаж байна...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (facilities.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Үйлчилгээний мэдээлэл хараахан нэмэгдээгүй байна
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyrillic">
            <IconSparkles className="h-5 w-5 text-primary" />
            Ерөнхий үйлчилгээ, байгууламж
          </CardTitle>
          <CardDescription>
            Зочид буудалд байгаа үйлчилгээ болон байгууламжийн жагсаалт
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {facilities.map((facility) => (
              <div
                key={facility.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-colors hover:bg-accent"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <IconCheck className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{facility.name_mn}</p>
                  <p className="text-xs text-muted-foreground">{facility.name_en}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
