'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Calendar, Percent, DollarSign } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { getClientBackendToken } from '@/utils/auth';
import PriceSettingModal from './PriceSettingModal';

interface RoomType {
  id: number;
  name: string;
  is_custom: boolean;
}

interface RoomCategory {
  id: number;
  name: string;
  is_custom: boolean;
}

interface AllData {
  room_types: RoomType[];
  room_category: RoomCategory[];
}

interface Room {
  room_number: number;
  room_type: number;
  room_category: number;
  number_of_rooms_to_sell: number;
}

interface RoomOption {
  label: string;
  value: string;
  room_type: number;
  room_category: number;
  count: number;
}

interface PriceSetting {
  id: number;
  name: string;
  hotel: number;
  room_type: number;
  room_category: number;
  start_date: string;
  end_date: string;
  adjustment_type: 'ADD' | 'SUB';
  value_type: 'PERCENT' | 'AMOUNT';
  value: number;
  is_active: boolean;
}

export default function PriceSettingsPage() {
  const [priceSettings, setPriceSettings] = useState<PriceSetting[]>([]);
  const [lookup, setLookup] = useState<AllData>({ room_types: [], room_category: [] });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<PriceSetting | null>(null);
  const [isDataRefresh, setIsDataRefresh] = useState(false);
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<number | null>(null);

  const hotel = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('userInfo') || '{}').hotel
    : 0;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await getClientBackendToken();
        if (!token) {
          throw new Error("Authentication required");
        }

        const lookupCache = localStorage.getItem("roomLookup");
        const roomsCache = localStorage.getItem("roomData");
        const settingsCache = localStorage.getItem(`priceSettings_${hotel}`);

        if (lookupCache && roomsCache && settingsCache && !isDataRefresh) {
          const cachedLookup = JSON.parse(lookupCache);
          const cachedRooms = JSON.parse(roomsCache);
          const cachedSettings = JSON.parse(settingsCache);
          
          setLookup(cachedLookup);
          setRooms(cachedRooms);
          setPriceSettings(cachedSettings);
          buildRoomOptions(cachedLookup, cachedRooms);
          setLoading(false);
          return;
        }

        const [allRes, roomsRes, settingsRes] = await Promise.all([
          fetch(`https://dev.kacc.mn/api/all-data/`),
          fetch(`https://dev.kacc.mn/api/roomsNew/?token=${encodeURIComponent(token)}`),
          fetch(`https://dev.kacc.mn/api/pricesettings/?hotel=${hotel}`)
        ]);

        if (!allRes.ok || !roomsRes.ok || !settingsRes.ok) throw new Error("Fetch failed");

        const allData = await allRes.json() as AllData;
        const roomsData: Room[] = await roomsRes.json();
        const settings: PriceSetting[] = await settingsRes.json();

        localStorage.setItem("roomLookup", JSON.stringify(allData));
        localStorage.setItem("roomData", JSON.stringify(roomsData));
        localStorage.setItem(`priceSettings_${hotel}`, JSON.stringify(settings));

        setLookup(allData);
        setRooms(roomsData);
        setPriceSettings(settings);
        buildRoomOptions(allData, roomsData);
      } catch (e) {
        console.error("Price settings fetch error:", e);
        toast.error('Мэдээлэл татахад алдаа гарлаа');
      } finally {
        setLoading(false);
        if (isDataRefresh) setIsDataRefresh(false);
      }
    };
    
    if (hotel) {
      fetchData();
    }
  }, [isDataRefresh, hotel]);

  const buildRoomOptions = (allData: AllData, roomsData: Room[]) => {
    const map = new Map<string, RoomOption>();
    
    roomsData.forEach(room => {
      const key = `${room.room_type}-${room.room_category}`;
      const typeName = allData.room_types.find(t => t.id === room.room_type)?.name || `Type ${room.room_type}`;
      const categoryName = allData.room_category.find(c => c.id === room.room_category)?.name || `Category ${room.room_category}`;
      
      if (!map.has(key)) {
        map.set(key, {
          label: `${typeName} – ${categoryName}`,
          value: key,
          room_type: room.room_type,
          room_category: room.room_category,
          count: 1
        });
      } else {
        map.get(key)!.count++;
      }
    });
    
    const options = Array.from(map.values()).map(opt => ({
      ...opt,
      label: `${opt.label} (${opt.count} өрөө)`
    }));
    
    setRoomOptions(options);
  };

  const handleAdd = () => {
    setEditingSetting(null);
    setIsModalOpen(true);
  };

  const handleEdit = (setting: PriceSetting) => {
    setEditingSetting(setting);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setSettingToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!settingToDelete) return;

    try {
      const token = await getClientBackendToken();
      if (!token) {
        toast.error('Нэвтрэх эрх шаардлагатай. Дахин нэвтэрнэ үү.');
        return;
      }

      const res = await fetch(`https://dev.kacc.mn/api/pricesettings/${settingToDelete}/?token=${encodeURIComponent(token)}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      toast.success('Тохиргоо амжилттай устгагдлаа');
      localStorage.removeItem(`priceSettings_${hotel}`);
      setIsDataRefresh(true);
      setDeleteDialogOpen(false);
      setSettingToDelete(null);
    } catch (error) {
      console.error('Error deleting price setting:', error);
      toast.error('Устгахад алдаа гарлаа');
      setDeleteDialogOpen(false);
    }
  };

  const handleModalClose = (success?: boolean) => {
    setIsModalOpen(false);
    setEditingSetting(null);
    if (success) {
      localStorage.removeItem(`priceSettings_${hotel}`);
      setIsDataRefresh(true);
    }
  };

  const getRoomTypeName = (typeId: number) => {
    return lookup.room_types.find(t => t.id === typeId)?.name || `Type ${typeId}`;
  };

  const getRoomCategoryName = (catId: number) => {
    return lookup.room_category.find(c => c.id === catId)?.name || `Category ${catId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAdjustmentLabel = (type: string, valueType: string, value: number) => {
    const prefix = type === 'ADD' ? '+' : '-';
    const suffix = valueType === 'PERCENT' ? '%' : '₮';
    return `${prefix}${value}${suffix}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Үнийн тохиргоо</h1>
            <p className="text-muted-foreground">
              Өрөөний үнийн нэмэгдэл болон хасалт тохируулах
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-32 pt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Үнийн тохиргоо</h1>
          <p className="text-muted-foreground">
            Өрөөний үнийн нэмэгдэл болон хасалт тохируулах
          </p>
        </div>
        <Button 
          onClick={handleAdd} 
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Нэмэх
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {priceSettings.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-foreground">Тохиргоо байхгүй</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Эхний үнийн тохиргоог нэмэх товчийг дарж эхлүүлээрэй
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {priceSettings.map((setting) => (
                <Card key={setting.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-foreground">{setting.name}</h3>
                            <Badge 
                              variant={setting.is_active ? "default" : "secondary"}
                              className={setting.is_active ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                            >
                              {setting.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(setting)}
                              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(setting.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Өрөөний төрөл</p>
                            <p className="text-sm font-medium text-foreground">
                              {getRoomTypeName(setting.room_type)}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Ангилал</p>
                            <p className="text-sm font-medium text-foreground">
                              {getRoomCategoryName(setting.room_category)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(setting.start_date)} - {formatDate(setting.end_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {setting.value_type === 'PERCENT' ? (
                              <Percent className="h-4 w-4 text-primary" />
                            ) : (
                              <DollarSign className="h-4 w-4 text-primary" />
                            )}
                            <span className={`font-semibold ${
                              setting.adjustment_type === 'ADD' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {getAdjustmentLabel(setting.adjustment_type, setting.value_type, setting.value)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <PriceSettingModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          editData={editingSetting}
          roomOptions={roomOptions}
          lookup={lookup}
          hotelId={hotel}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Үнийн тохиргоо устгах</AlertDialogTitle>
            <AlertDialogDescription>
              Та үнэхээр энэ үнийн тохиргоог устгахыг хүсэж байна уу? Энэ үйлдэл буцалтгүй.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Устгах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
