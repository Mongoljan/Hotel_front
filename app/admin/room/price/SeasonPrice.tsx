"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getClientBackendToken } from "@/utils/auth";
import { useAuth } from "@/hooks/useAuth";
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
  ChevronDown,
  ChevronRight,
  Plus,
  DollarSign,
  Calendar,
  Users,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';

// Interfaces
interface AllData {
  room_types: { id: number; name: string; is_custom: boolean }[];
  bed_types: { id: number; name: string; is_custom: boolean }[];
  room_category: { id: number; name: string; is_custom: boolean }[];
}

interface RoomData {
  room_number: number;
  room_type: number;
  room_category: number;
  room_size: string;
  bed_type: number;
  is_Bathroom: boolean;
  number_of_rooms: number;
  number_of_rooms_to_sell: number;
  room_Description: string;
  smoking_allowed: boolean;
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

interface SeasonalPrice {
  id: number;
  room_price: number;
  start_date: string;
  end_date: string;
  price: number;
}

interface FlattenRow {
  id: string;
  isGroup: boolean;
  groupKey?: string;
  type: string;
  category: string;
  roomNumber: string;
  size: string;
  bedType: string;
  wc: string;
  numberOfRooms: number;
  numberOfRoomsToSell: number;
  basePrice?: number;
  seasonalPrice?: string;
}

export default function SeasonPrice() {
  const { user } = useAuth();
  const hotel = user?.hotel || "0";

  const [lookup, setLookup] = useState<AllData | null>(null);
  const [rawRooms, setRawRooms] = useState<RoomData[]>([]);
  const [roomPrices, setRoomPrices] = useState<PriceEntry[]>([]);
  const [seasonalPrices, setSeasonalPrices] = useState<SeasonalPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const [seasonModalOpen, setSeasonModalOpen] = useState(false);
  const [seasonForm, setSeasonForm] = useState({
    room_price: 0,
    start_date: "",
    end_date: "",
    price: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await getClientBackendToken();
      if (!token) throw new Error("Token not found");
      
      const [lookupRes, roomRes, priceRes, seasonalRes] = await Promise.all([
        fetch("https://dev.kacc.mn/api/all-data/"),
        fetch(`https://dev.kacc.mn/api/roomsNew/?token=${token}`),
        fetch(`https://dev.kacc.mn/api/room-prices?hotel=${hotel}`),
        fetch(`https://dev.kacc.mn/api/seasonal-prices?hotel=${hotel}`),
      ]);

      const [lookupJson, roomJson, priceJson, seasonalJson] = await Promise.all([
        lookupRes.json(),
        roomRes.json(),
        priceRes.json(),
        seasonalRes.json(),
      ]);

      localStorage.setItem("lookup", JSON.stringify(lookupJson));
      localStorage.setItem("rooms", JSON.stringify(roomJson));
      localStorage.setItem(`prices_${hotel}`, JSON.stringify(priceJson));
      localStorage.setItem(`seasonal_${hotel}`, JSON.stringify(seasonalJson));

      setLookup(lookupJson);
      setRawRooms(roomJson);
      setRoomPrices(priceJson);
      setSeasonalPrices(seasonalJson);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error('Өгөгдөл ачааллахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hotel || hotel === "0") {
      return;
    }
    
    const lookupCache = localStorage.getItem("lookup");
    const roomsCache = localStorage.getItem("rooms");
    const pricesCache = localStorage.getItem(`prices_${hotel}`);
    const seasonalCache = localStorage.getItem(`seasonal_${hotel}`);

    if (lookupCache && roomsCache && pricesCache && seasonalCache) {
      setLookup(JSON.parse(lookupCache));
      setRawRooms(JSON.parse(roomsCache));
      setRoomPrices(JSON.parse(pricesCache));
      setSeasonalPrices(JSON.parse(seasonalCache));
      setLoading(false);
    } else {
      fetchData();
    }
  }, [hotel]);

  const rows: FlattenRow[] = useMemo(() => {
    if (!lookup || !rawRooms || !Array.isArray(rawRooms)) {
      return [];
    }

    const typeMap = new Map(lookup.room_types.map(t => [t.id, t.name]));
    const catMap = new Map(lookup.room_category.map(c => [c.id, c.name]));
    const bedMap = new Map(lookup.bed_types.map(b => [b.id, b.name]));

    const priceMap = new Map<string, PriceEntry>();
    roomPrices.forEach(p => {
      const key = `${p.room_type}-${p.room_category}`;
      priceMap.set(key, p);
    });

    const seasonalMap = new Map<number, SeasonalPrice[]>();
    seasonalPrices.forEach(sp => {
      if (!seasonalMap.has(sp.room_price)) seasonalMap.set(sp.room_price, []);
      seasonalMap.get(sp.room_price)!.push(sp);
    });

    const grouped = new Map<string, {
      type: string;
      category: string;
      price?: PriceEntry;
      seasonal?: SeasonalPrice[];
      rooms: RoomData[];
    }>();

    if (Array.isArray(rawRooms)) {
      rawRooms.forEach(r => {
        const key = `${r.room_type}-${r.room_category}`;
        if (!grouped.has(key)) {
          const price = priceMap.get(key);
          grouped.set(key, {
            type: typeMap.get(r.room_type) || `Type ${r.room_type}`,
            category: catMap.get(r.room_category) || `Category ${r.room_category}`,
            price,
            seasonal: price ? seasonalMap.get(price.id) : [],
            rooms: [],
          });
        }
        grouped.get(key)!.rooms.push(r);
      });
    } else {
      console.warn("Invalid or missing rawRooms data:", rawRooms);
    }
    
    const result: FlattenRow[] = [];
    grouped.forEach((grp, key) => {
      const seasonStr = grp.seasonal
        ?.map(s => `${s.price} (${s.start_date}–${s.end_date})`)
        .join(", ") || "";

      result.push({
        id: key,
        isGroup: true,
        type: grp.type,
        category: grp.category,
        roomNumber: `(${grp.rooms.length} rooms)`,
        size: "",
        bedType: "",
        wc: "",
        numberOfRooms: grp.rooms.reduce((acc, r) => acc + r.number_of_rooms, 0),
        numberOfRoomsToSell: grp.rooms.reduce((acc, r) => acc + r.number_of_rooms_to_sell, 0),
        basePrice: grp.price?.base_price,
        seasonalPrice: seasonStr,
      });

      if (expanded.has(key)) {
        grp.rooms.forEach(r => {
          result.push({
            id: `${key}-${r.room_number}`,
            isGroup: false,
            groupKey: key,
            type: "",
            category: "",
            roomNumber: r.room_number.toString(),
            size: `${r.room_size} m²`,
            bedType: bedMap.get(r.bed_type) || `Bed ${r.bed_type}`,
            wc: r.is_Bathroom ? "Yes" : "No",
            numberOfRooms: r.number_of_rooms,
            numberOfRoomsToSell: r.number_of_rooms_to_sell,
          });
        });
      }
    });

    return result;
  }, [lookup, rawRooms, roomPrices, seasonalPrices, expanded]);

  const createSeasonal = async () => {
    try {
      const response = await fetch("https://dev.kacc.mn/api/seasonal-prices/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotel, ...seasonForm }),
      });
      
      if (!response.ok) throw new Error('Failed to create seasonal price');
      
      // Clear cache and reload
      localStorage.removeItem(`seasonal_${hotel}`);
      setSeasonModalOpen(false);
      setSeasonForm({ room_price: 0, start_date: "", end_date: "", price: 0 });
      fetchData();
      toast.success('Сезоны үнэ амжилттай нэмэгдлээ');
    } catch (err) {
      console.error('Create seasonal price failed:', err);
      toast.error('Сезоны үнэ нэмэж чадсангүй');
    }
  };
  
  const handleDeleteSeasonal = async (seasonId: number) => {
    if (!confirm('Та энэ сезоны үнийг устгахыг хүсэж байна уу?')) return;
    
    try {
      const token = await getClientBackendToken();
      if (!token) throw new Error('Token missing');
      
      const response = await fetch(
        `https://dev.kacc.mn/api/seasonal-prices/${seasonId}/?token=${token}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) throw new Error('Failed to delete seasonal price');
      
      toast.success('Сезоны үнэ амжилттай устгагдлаа');
      localStorage.removeItem(`seasonal_${hotel}`);
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Сезоны үнэ устгаж чадсангүй');
    }
  };
  
  const toggleExpanded = (groupKey: string) => {
    const newSet = new Set(expanded);
    if (newSet.has(groupKey)) {
      newSet.delete(groupKey);
    } else {
      newSet.add(groupKey);
    }
    setExpanded(newSet);
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
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold text-foreground">Сезоны үнэ байхгүй</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Эхний сезоны үнийг нэмээд эхэлцгээе
        </p>
        <Dialog open={seasonModalOpen} onOpenChange={setSeasonModalOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Сезоны үнэ нэмэх
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Сезоны үнэ нэмэх</DialogTitle>
              <DialogDescription>
                Тусгай үеийн үнэ тогтоох
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="room-price">Өрөөний үнэ</Label>
                <Select
                  value={seasonForm.room_price.toString()}
                  onValueChange={(value: string) => setSeasonForm(f => ({ ...f, room_price: Number(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Өрөөний үнэ сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomPrices.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {lookup?.room_types.find(t => t.id === p.room_type)?.name} –
                        {lookup?.room_category.find(c => c.id === p.room_category)?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="start-date">Эхлэх өдөр</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={seasonForm.start_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeasonForm(f => ({ ...f, start_date: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date">Дуусах өдөр</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={seasonForm.end_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeasonForm(f => ({ ...f, end_date: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Үнэ</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Сезоны үнэ оруулах"
                  value={seasonForm.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeasonForm(f => ({ ...f, price: Number(e.target.value) }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSeasonModalOpen(false)}>
                Цуцлах
              </Button>
              <Button onClick={createSeasonal}>Хадгалах</Button>
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
          <h2 className="text-2xl font-bold tracking-tight">Сезоны үнэ</h2>
          <p className="text-muted-foreground">
            Тусгай үеийн үнэ удирдлага
          </p>
        </div>
        <Dialog open={seasonModalOpen} onOpenChange={setSeasonModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Сезоны үнэ нэмэх
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Сезоны үнэ нэмэх</DialogTitle>
              <DialogDescription>
                Тусгай үеийн үнэ тогтоох
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="room-price">Өрөөний үнэ</Label>
                <Select
                  value={seasonForm.room_price.toString()}
                  onValueChange={(value: string) => setSeasonForm(f => ({ ...f, room_price: Number(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Өрөөний үнэ сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomPrices.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {lookup?.room_types.find(t => t.id === p.room_type)?.name} –
                        {lookup?.room_category.find(c => c.id === p.room_category)?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="start-date">Эхлэх өдөр</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={seasonForm.start_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeasonForm(f => ({ ...f, start_date: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date">Дуусах өдөр</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={seasonForm.end_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeasonForm(f => ({ ...f, end_date: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Үнэ</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Сезоны үнэ оруулах"
                  value={seasonForm.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeasonForm(f => ({ ...f, price: Number(e.target.value) }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSeasonModalOpen(false)}>
                Цуцлах
              </Button>
              <Button onClick={createSeasonal}>Хадгалах</Button>
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
              <TableHead>Сезоны үнэ</TableHead>
              <TableHead className="text-right">Үйлдэл</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  {row.isGroup ? (
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleExpanded(row.id)}
                        className="p-0 h-auto"
                      >
                        {expanded.has(row.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <span className="font-medium">{row.roomNumber}</span>
                    </div>
                  ) : (
                    <div className="pl-6">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{row.roomNumber}</span>
                      </div>
                    </div>
                  )}
                </TableCell>
                
                <TableCell>
                  {row.type && <Badge variant="outline">{row.type}</Badge>}
                </TableCell>
                
                <TableCell>
                  {row.category && <Badge variant="outline">{row.category}</Badge>}
                </TableCell>
                
                <TableCell>
                  {row.basePrice && (
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{row.basePrice.toLocaleString()}₮</span>
                    </div>
                  )}
                </TableCell>
                
                <TableCell>
                  {row.seasonalPrice ? (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{row.seasonalPrice}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                
                <TableCell className="text-right">
                  {row.isGroup && (
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteSeasonal(parseInt(row.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Нийт {rows.filter(r => r.isGroup).length} бүлэг
      </div>
    </div>
  );
}