'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Bed, Users, Settings } from 'lucide-react';
import RoomList from './RoomList';
import { useState } from 'react';

export default function RoomsPage() {
  const [isRoomAdded, setIsRoomAdded] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Өрөөний удирдлага</h1>
          <p className="text-muted-foreground">
            Буудлын өрөөнүүдийг бүртгэж, удирдаарай
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Өрөө нэмэх
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нийт өрөө</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Идэвхтэй өрөөнүүд
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Захиалагдсан</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Одоогийн захиалгууд
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Боломжтой</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Захиалах боломжтой
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Room List */}
      <Card>
        <CardHeader>
          <CardTitle>Өрөөнүүдийн жагсаалт</CardTitle>
          <CardDescription>
            Бүх өрөөнүүдийн мэдээлэл болон тохиргоо
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoomList isRoomAdded={isRoomAdded} setIsRoomAdded={setIsRoomAdded} />
        </CardContent>
      </Card>
    </div>
  );
}