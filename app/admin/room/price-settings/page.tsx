'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Calendar, Percent, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';
import { getClientBackendToken } from '@/utils/auth';
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
  const { user } = useAuth(); // Get user from auth hook
  const [priceSettings, setPriceSettings] = useState<PriceSetting[]>([]);
  const [lookup, setLookup] = useState<AllData>({ room_types: [], room_category: [] });
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<PriceSetting | null>(null);
  const [isDataRefresh, setIsDataRefresh] = useState(false);
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<number | null>(null);

  const hotel = user?.hotel ? Number(user.hotel) : 0;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get backend token for API authentication
        const token = await getClientBackendToken();
        
        if (!token) {
          console.error('❌ No backend token found');
          throw new Error("Token not found");
        }

        console.log('🔑 Token acquired, fetching data...');

        const [allRes, settingsRes, roomsRes] = await Promise.all([
          fetch(`https://dev.kacc.mn/api/all-data/`),
          fetch(`https://dev.kacc.mn/api/pricesettings/?hotel=${hotel}`),
          fetch(`https://dev.kacc.mn/api/roomsNew/?token=${token}`) // Correct endpoint with token
        ]);

        if (!allRes.ok || !settingsRes.ok) {
          console.error('❌ API fetch failed:', { allRes: allRes.ok, settingsRes: settingsRes.ok, roomsRes: roomsRes.ok });
          throw new Error("Fetch failed");
        }

        const allData = await allRes.json() as AllData;
        const settings: PriceSetting[] = await settingsRes.json();
        const rooms = roomsRes.ok ? await roomsRes.json() : [];

        console.log('✅ Fetched all-data:', allData);
        console.log('✅ Fetched price settings:', settings);
        console.log('✅ Fetched actual rooms from API:', rooms);
        console.log('🔗 Rooms API URL:', `https://dev.kacc.mn/api/roomsNew/?token=${token ? '[TOKEN]' : 'MISSING'}`);

        setLookup(allData);
        setPriceSettings(settings);
        buildRoomOptionsFromActualRooms(allData, rooms);
      } catch (e) {
        console.error("❌ Price settings fetch error:", e);
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

  const buildRoomOptionsFromActualRooms = (allData: AllData, rooms: any[]) => {
    console.log('🔍 Building room options from rooms array (length:', rooms?.length, ')');
    console.log('� First room sample:', rooms?.[0]);
    
    // Get unique room type/category combinations from ACTUAL existing rooms only
    const map = new Map<string, RoomOption>();
    
    if (!rooms || rooms.length === 0) {
      console.warn('⚠️ No rooms found - user needs to create rooms first');
      setRoomOptions([]);
      return;
    }
    
    rooms.forEach((room: any, index: number) => {
      // The API returns rooms with these fields: room_type, room_category (or category), room_numbers
      const roomTypeId = room.room_type;
      const roomCategoryId = room.room_category || room.category;
      
      if (!roomTypeId || !roomCategoryId) {
        console.warn(`⚠️ Room ${index} missing type or category:`, { 
          room_type: roomTypeId, 
          room_category: roomCategoryId,
          full_room: room 
        });
        return;
      }
      
      const key = `${roomTypeId}-${roomCategoryId}`;
      const typeName = allData.room_types.find(t => t.id === roomTypeId)?.name || `Type ${roomTypeId}`;
      const categoryName = allData.room_category.find(c => c.id === roomCategoryId)?.name || `Category ${roomCategoryId}`;
      
      // Count how many actual room numbers this entry has
      const roomCount = room.room_numbers ? room.room_numbers.split(',').length : 1;
      
      if (!map.has(key)) {
        map.set(key, {
          label: `${typeName} – ${categoryName} (${roomCount} өрөө)`,
          value: key,
          room_type: roomTypeId,
          room_category: roomCategoryId,
          count: roomCount
        });
        console.log(`✅ Added room option: ${typeName} – ${categoryName} (${roomCount} өрөө)`);
      } else {
        // Increment count if we already have this combination
        const existing = map.get(key)!;
        existing.count += roomCount;
        existing.label = `${typeName} – ${categoryName} (${existing.count} өрөө)`;
        console.log(`➕ Updated room option: ${typeName} – ${categoryName} (now ${existing.count} өрөө)`);
      }
    });
    
    const options = Array.from(map.values());
    console.log(`✅ Built ${options.length} unique room options from ${rooms.length} room entries`);
    console.log('📋 Final options:', options);
    setRoomOptions(options);
  };

  // Filter room options to only show those WITHOUT price settings
  const availableRoomOptions = roomOptions.filter(option => {
    // Check if this room combination already has a price setting
    const hasPriceSetting = priceSettings.some(
      setting => setting.room_type === option.room_type &&
                 setting.room_category === option.room_category
    );
    return !hasPriceSetting;
  });

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
      const res = await fetch(`https://dev.kacc.mn/api/pricesettings/${settingToDelete}/`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      toast.success('Тохиргоо амжилттай устгагдлаа');
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
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
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
    <div className="">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Үнийн тохиргоо</h1>
          <p className="text-muted-foreground">
            Өрөөний үнийн нэмэгдэл болон хасалт тохируулах
          </p>
        </div>
        <Button
          onClick={handleAdd}
          disabled={loading || availableRoomOptions.length === 0}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          title={availableRoomOptions.length === 0 ? 'Бүх өрөөний үнийн тохиргоо хийгдсэн байна' : 'Үнийн тохиргоо нэмэх'}
        >
          <Plus className="mr-2 h-4 w-4" />
          Нэмэх
        </Button>
      </div>

      {/* Show info when all rooms have price settings */}
      {!loading && roomOptions.length > 0 && availableRoomOptions.length === 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Мэдээлэл:</strong> Бүх өрөөний үнийн тохиргоо хийгдсэн байна. Шинэ тохиргоо нэмэхийн тулд эхлээд шинэ өрөө нэмэх эсвэл одоогийн тохиргоог устгана уу.
          </p>
        </div>
      )}

      {/* Show info when there are available room options */}
      {!loading && availableRoomOptions.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>{availableRoomOptions.length}</strong> өрөөний бүлэг үнийн тохиргоо хийх боломжтой байна
          </p>
        </div>
      )}

      <Card className="border border-border/50 shadow-sm">
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
                <Card key={setting.id} className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-shadow">
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
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(setting.id)}
                              className="text-destructive hover:text-destructive/90"
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
          roomOptions={editingSetting ? roomOptions : availableRoomOptions}
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
