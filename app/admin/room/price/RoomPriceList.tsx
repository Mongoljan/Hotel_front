"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getClientBackendToken } from "@/utils/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Edit, 
  Trash2, 
  Plus,
  DollarSign,
  Calendar,
  Users
} from 'lucide-react';
import { toast } from 'react-toastify';

interface AllData {
  room_types: { id: number; name: string; is_custom: boolean }[];
  room_category: { id: number; name: string; is_custom: boolean }[];
}

interface PriceEntry {
  id: number;
  base_price: number;
  single_person_price: number | null;
  half_day_price: number | null;
  hotel: number;
  room_type: number;
  room_category: number;
}

interface RoomRow {
  id: number;
  roomNumber: number;
  room_type: number;
  room_category: number;
  type: string;
  category: string;
  basePrice: number | null;
  singlePrice: number | null;
  halfDayPrice: number | null;
  numberOfRoomsToSell: number;
}

interface RoomModalProps {
  isRoomAdded: boolean;
  setIsRoomAdded: (value: boolean) => void;
}

export default function RoomPriceList({ isRoomAdded, setIsRoomAdded }: RoomModalProps) {
  const [rows, setRows] = useState<RoomRow[]>([]);
  const [lookup, setLookup] = useState<AllData>({ room_types: [], room_category: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({
    room_type: 0,
    room_category: 0,
    base_price: 0,
    single_person_price: 0,
    half_day_price: 0
  });

  const hotel = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('userInfo') || '{}').hotel
    : 0;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = await getClientBackendToken();
        if (!token) throw new Error("Token not found");

        const lookupCache = localStorage.getItem("roomLookup");
        const roomsCache = localStorage.getItem("roomData");
        const priceCache = localStorage.getItem(`roomPrices_${hotel}`);

        if (lookupCache && roomsCache && priceCache && !isRoomAdded) {
          setLookup(JSON.parse(lookupCache));
          const roomsData = JSON.parse(roomsCache);
          const prices: PriceEntry[] = JSON.parse(priceCache);
          setRows(buildRows(JSON.parse(lookupCache), roomsData, prices));
          setLoading(false);
          return;
        }

        const [allRes, roomsRes, pricesRes] = await Promise.all([
          fetch(`https://dev.kacc.mn/api/all-data/`),
          fetch(`https://dev.kacc.mn/api/roomsNew/?token=${token}`),
          fetch(`https://dev.kacc.mn/api/room-prices?hotel=${hotel}`)
        ]);
        if (!allRes.ok || !roomsRes.ok || !pricesRes.ok) throw new Error("Fetch failed");

        const allData = await allRes.json() as AllData;
        const roomsData = await roomsRes.json();
        const prices: PriceEntry[] = await pricesRes.json();

        localStorage.setItem("roomLookup", JSON.stringify(allData));
        localStorage.setItem("roomData", JSON.stringify(roomsData));
        localStorage.setItem(`roomPrices_${hotel}`, JSON.stringify(prices));

        setLookup(allData);
        setRows(buildRows(allData, roomsData, prices));
      } catch (e) {
        console.error("RoomPriceList fetch error:", e);
      } finally {
        setLoading(false);
        if (isRoomAdded) setIsRoomAdded(false);
      }
    };
    fetchData();
  }, [isRoomAdded, hotel]);

  const buildRows = (
    allData: AllData,
    rooms: any[],
    prices: PriceEntry[]
  ): RoomRow[] => {
    const priceMap = new Map(prices.map(p => [`${p.room_type}-${p.room_category}`, p]));
    return rooms.map((r) => {
      const key = `${r.room_type}-${r.room_category}`;
      const price = priceMap.get(key);
      return {
        id: r.room_number,
        roomNumber: r.room_number,
        room_type: r.room_type,
        room_category: r.room_category,
        type: allData.room_types.find(t => t.id === r.room_type)?.name ?? `Type ${r.room_type}`,
        category: allData.room_category.find(c => c.id === r.room_category)?.name ?? `Category ${r.room_category}`,
        basePrice: price?.base_price ?? null,
        singlePrice: price?.single_person_price ?? null,
        halfDayPrice: price?.half_day_price ?? null,
        numberOfRoomsToSell: r.number_of_rooms_to_sell,
      };
    });
  };

  const options = useMemo(() => {
    const map = new Map<string, { label: string; count: number; room_type: number; room_category: number }>();
    rows.forEach(r => {
      const key = `${r.room_type}-${r.room_category}`;
      if (!map.has(key)) {
        map.set(key, {
          label: `${r.type} – ${r.category}`,
          count: 1,
          room_type: r.room_type,
          room_category: r.room_category
        });
      } else {
        map.get(key)!.count++;
      }
    });
    return Array.from(map.values()).map(o => ({
      ...o,
      label: `${o.label} (${o.count} rooms)`,
      value: `${o.room_type}-${o.room_category}`,
    }));
  }, [rows]);

  const createPrice = async () => {
    try {
      const token = await getClientBackendToken();
      if (!token) throw new Error("Token not found");
      
      const response = await fetch("https://dev.kacc.mn/api/room-prices/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotel, ...form }),
      });
      
      if (!response.ok) throw new Error('Failed to create price');
      
      // Clear cache to force re-fetch
      localStorage.removeItem(`roomPrices_${hotel}`);
      setOpenAdd(false);
      setIsRoomAdded(true);
      toast.success('Өрөөний үнэ амжилттай нэмэгдлээ');
    } catch (err) {
      console.error('Create price failed:', err);
      toast.error('Өрөөний үнэ нэмэж чадсангүй');
    }
  };
  
  const handleDelete = async (priceId: number) => {
    if (!confirm('Та энэ үнийг устгахыг хүсэж байна уу?')) return;
    
    try {
      const token = await getClientBackendToken();
      if (!token) throw new Error('Token missing');
      
      const response = await fetch(
        `https://dev.kacc.mn/api/room-prices/${priceId}/?token=${token}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) throw new Error('Failed to delete price');
      
      toast.success('Үнэ амжилттай устгагдлаа');
      localStorage.removeItem(`roomPrices_${hotel}`);
      setIsRoomAdded(true);
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Үнэ устгаж чадсангүй');
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-8">
        <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold text-foreground">Үнэ байхгүй</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Эхний үнийг нэмээд эхэлцгээе
        </p>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Өрөөний үнэ нэмэх
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Өрөөний үнэ нэмэх</DialogTitle>
              <DialogDescription>
                Өрөөний төрөл болон ангиллын дагуу үнэ тогтоох
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="room-group">Өрөөний бүлэг</Label>
                <Select
                  value={`${form.room_type}-${form.room_category}`}
                  onValueChange={(value) => {
                    const [rt, rc] = value.split('-').map(Number);
                    setForm(f => ({ ...f, room_type: rt, room_category: rc }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Өрөөний бүлэг сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="base-price">Үндсэн үнэ</Label>
                <Input
                  id="base-price"
                  type="number"
                  placeholder="Үндсэн үнэ оруулах"
                  onChange={e => setForm(f => ({ ...f, base_price: Number(e.target.value) }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="single-price">Ганц хүний үнэ</Label>
                <Input
                  id="single-price"
                  type="number"
                  placeholder="Ганц хүний үнэ оруулах"
                  onChange={e => setForm(f => ({ ...f, single_person_price: Number(e.target.value) }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="half-day-price">Хагас өдрийн үнэ</Label>
                <Input
                  id="half-day-price"
                  type="number"
                  placeholder="Хагас өдрийн үнэ оруулах"
                  onChange={e => setForm(f => ({ ...f, half_day_price: Number(e.target.value) }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenAdd(false)}>
                Цуцлах
              </Button>
              <Button onClick={createPrice}>Хадгалах</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Өрөөний үнэ</h2>
          <p className="text-muted-foreground">
            Өрөөний төрөл болон ангиллын дагуу үнэ удирдлага
          </p>
        </div>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Өрөөний үнэ нэмэх
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Өрөөний үнэ нэмэх</DialogTitle>
              <DialogDescription>
                Өрөөний төрөл болон ангиллын дагуу үнэ тогтоох
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="room-group">Өрөөний бүлэг</Label>
                <Select
                  value={`${form.room_type}-${form.room_category}`}
                  onValueChange={(value) => {
                    const [rt, rc] = value.split('-').map(Number);
                    setForm(f => ({ ...f, room_type: rt, room_category: rc }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Өрөөний бүлэг сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="base-price">Үндсэн үнэ</Label>
                <Input
                  id="base-price"
                  type="number"
                  placeholder="Үндсэн үнэ оруулах"
                  onChange={e => setForm(f => ({ ...f, base_price: Number(e.target.value) }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="single-price">Ганц хүний үнэ</Label>
                <Input
                  id="single-price"
                  type="number"
                  placeholder="Ганц хүний үнэ оруулах"
                  onChange={e => setForm(f => ({ ...f, single_person_price: Number(e.target.value) }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="half-day-price">Хагас өдрийн үнэ</Label>
                <Input
                  id="half-day-price"
                  type="number"
                  placeholder="Хагас өдрийн үнэ оруулах"
                  onChange={e => setForm(f => ({ ...f, half_day_price: Number(e.target.value) }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenAdd(false)}>
                Цуцлах
              </Button>
              <Button onClick={createPrice}>Хадгалах</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Өрөөний дугаар</TableHead>
              <TableHead>Төрөл</TableHead>
              <TableHead>Ангилал</TableHead>
              <TableHead>Үндсэн үнэ</TableHead>
              <TableHead>Ганц хүний үнэ</TableHead>
              <TableHead>Хагас өдрийн үнэ</TableHead>
              <TableHead>Борлуулах өрөө</TableHead>
              <TableHead className="text-right">Үйлдэл</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              // Group rows by room type and category to find price
              const priceKey = `${row.room_type}-${row.room_category}`;
              const priceEntry = options.find(opt => opt.value === priceKey);
              
              return (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{row.roomNumber}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline">{row.type}</Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline">{row.category}</Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{row.basePrice ? `${row.basePrice.toLocaleString()}₮` : '-'}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{row.singlePrice ? `${row.singlePrice.toLocaleString()}₮` : '-'}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{row.halfDayPrice ? `${row.halfDayPrice.toLocaleString()}₮` : '-'}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={row.numberOfRoomsToSell > 0 ? "default" : "secondary"}>
                      {row.numberOfRoomsToSell}
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
                        onClick={() => handleDelete(row.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Нийт {rows.length} үнийн мэдээлэл
      </div>
    </div>
  );
}
