'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import RoomPriceList from './RoomPriceList';

export default function RoomPriceManagement() {
  const [isRoomAdded, setIsRoomAdded] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Өрөөний үнийн удирдлага</h1>
          <p className="text-muted-foreground">
            Өрөөний төрөл болон ангиллын дагуу үндсэн үнэ тогтоох
          </p>
        </div>
        <Button onClick={() => setOpenAddDialog(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Өрөөний үнэ нэмэх
        </Button>
      </div>

      {/* Room Price List */}
      <Card>
        <CardContent>
          <RoomPriceList 
            isRoomAdded={isRoomAdded} 
            setIsRoomAdded={setIsRoomAdded}
            openAdd={openAddDialog}
            setOpenAdd={setOpenAddDialog}
          />
        </CardContent>
      </Card>
    </div>
  );
}