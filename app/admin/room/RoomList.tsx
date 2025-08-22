'use client';

import React, { useEffect, useState } from 'react';
import { getClientBackendToken } from '@/utils/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Edit, 
  Trash2, 
  Wifi, 
  Users, 
  Bed,
  Square,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

interface RoomData {
  id: number;
  hotel: number;
  room_number: number;
  room_type: number;
  room_category: number;
  room_size: string;
  bed_type: number;
  is_Bathroom: boolean;
  room_Facilities: number[];
  bathroom_Items: number[];
  free_Toiletries: number[];
  food_And_Drink: number[];
  outdoor_And_View: number[];
  adultQty: number;
  childQty: number;
  number_of_rooms: number;
  number_of_rooms_to_sell: number;
  room_Description: string;
  smoking_allowed: boolean;
  images: any[];
}

interface RoomListProps {
  isRoomAdded: boolean;
  setIsRoomAdded: (value: boolean) => void;
}

export default function RoomList({ isRoomAdded, setIsRoomAdded }: RoomListProps) {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      try {
        const token = await getClientBackendToken();
        if (!token) throw new Error('Token not found');

        const response = await fetch(`https://dev.kacc.mn/api/roomsNew/?token=${token}`);
        if (!response.ok) throw new Error('Failed to fetch rooms');

        const data = await response.json();
        setRooms(data);
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
        toast.error('Failed to load rooms');
      } finally {
        setLoading(false);
        if (isRoomAdded) setIsRoomAdded(false);
      }
    }

    fetchRooms();
  }, [isRoomAdded, setIsRoomAdded]);

  const handleDelete = async (roomId: number) => {
    if (!confirm('Та энэ өрөөг устгахыг хүсэж байна уу?')) return;

    try {
      const token = await getClientBackendToken();
      if (!token) throw new Error('Token missing');

      const response = await fetch(
        `https://dev.kacc.mn/api/roomsNew/${roomId}/?token=${token}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete room');

      toast.success('Өрөө амжилттай устгагдлаа');
      setIsRoomAdded(true);
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Өрөө устгаж чадсангүй');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-8">
        <Bed className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold text-foreground">Өрөө байхгүй</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Эхний өрөөгөө нэмээд эхэлцгээе
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Өрөөний дугаар</TableHead>
              <TableHead>Хэмжээ</TableHead>
              <TableHead>Хүний тоо</TableHead>
              <TableHead>Орны тоо</TableHead>
              <TableHead>Онцлог</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Үйлдэл</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <Square className="h-4 w-4 text-muted-foreground" />
                    <span>{room.room_number}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant="outline">{room.room_size} м²</Badge>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{room.adultQty + room.childQty}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span>{room.bed_type === 1 ? 'Ганц' : 'Давхар'}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {room.room_Facilities?.includes(1) && (
                      <div title="WiFi">
                        <Wifi className="h-4 w-4 text-blue-500" />
                      </div>
                    )}
                    {room.is_Bathroom && (
                      <div title="Угаалгын өрөөтэй">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                    {room.smoking_allowed ? (
                      <div title="Тамхи татах боломжтой">
                        <CheckCircle className="h-4 w-4 text-orange-500" />
                      </div>
                    ) : (
                      <div title="Тамхи хориотой">
                        <XCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant={room.number_of_rooms_to_sell > 0 ? "default" : "secondary"}>
                    {room.number_of_rooms_to_sell > 0 ? "Боломжтой" : "Захиалагдсан"}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(room.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Нийт {rooms.length} өрөө
      </div>
    </div>
  );
}