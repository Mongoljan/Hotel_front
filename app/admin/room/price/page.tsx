'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import RoomPriceList from './RoomPriceList';
import SeasonPrice from './SeasonPrice';

export default function RoomPriceManagement() {
  const [isRoomAdded, setIsRoomAdded] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Өрөөний үнийн удирдлага</h1>
        <p className="text-muted-foreground">
          Өрөөний үнэ болон сезоны үнэ удирдаарай
        </p>
      </div>

      {/* Room Price List */}
      <Card>
        <CardHeader>
          <CardTitle>Өрөөний үнэ</CardTitle>
          <CardDescription>
            Өрөөний төрөл болон ангиллын дагуу үндсэн үнэ тогтоох
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoomPriceList isRoomAdded={isRoomAdded} setIsRoomAdded={setIsRoomAdded} />
        </CardContent>
      </Card>

      <Separator />

      {/* Seasonal Price */}
      <Card>
        <CardHeader>
          <CardTitle>Сезоны үнэ</CardTitle>
          <CardDescription>
            Тусгай үеийн үнэ тогтоох болон удирдах
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SeasonPrice />
        </CardContent>
      </Card>
    </div>
  );
}