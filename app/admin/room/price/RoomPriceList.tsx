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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { toast } from 'sonner';

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
  openAdd: boolean;
  setOpenAdd: (value: boolean) => void;
}

export default function RoomPriceList({ isRoomAdded, setIsRoomAdded, openAdd, setOpenAdd }: RoomModalProps) {
  const [rows, setRows] = useState<RoomRow[]>([]);
  const [prices, setPrices] = useState<PriceEntry[]>([]);
  const [lookup, setLookup] = useState<AllData>({ room_types: [], room_category: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [form, setForm] = useState({
    room_type: 0,
    room_category: 0,
    base_price: 0,
    single_person_price: 0,
    half_day_price: 0
  });
  const [editingPrice, setEditingPrice] = useState<PriceEntry | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [priceToDelete, setPriceToDelete] = useState<number | null>(null);

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
          const allData = JSON.parse(lookupCache);
          const roomsData = JSON.parse(roomsCache);
          const pricesData: PriceEntry[] = JSON.parse(priceCache);
          
          setLookup(allData);
          setPrices(pricesData); // ← CRITICAL: Set prices state from cache
          setRows(buildRows(allData, roomsData, pricesData));
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
        const pricesData: PriceEntry[] = await pricesRes.json();

        localStorage.setItem("roomLookup", JSON.stringify(allData));
        localStorage.setItem("roomData", JSON.stringify(roomsData));
        localStorage.setItem(`roomPrices_${hotel}`, JSON.stringify(pricesData));

        setLookup(allData);
        setPrices(pricesData);
        setRows(buildRows(allData, roomsData, pricesData));
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
    
    // Group rooms by type and category combination
    const combinationMap = new Map<string, { 
      room_type: number; 
      room_category: number; 
      count: number;
      roomNumbers: number[];
    }>();
    
    rooms.forEach((r) => {
      const key = `${r.room_type}-${r.room_category}`;
      if (!combinationMap.has(key)) {
        combinationMap.set(key, {
          room_type: r.room_type,
          room_category: r.room_category,
          count: 0,
          roomNumbers: []
        });
      }
      const combo = combinationMap.get(key)!;
      combo.count++;
      combo.roomNumbers.push(r.room_number);
    });
    
    // Create one row per unique combination
    return Array.from(combinationMap.values()).map((combo) => {
      const key = `${combo.room_type}-${combo.room_category}`;
      const price = priceMap.get(key);
      return {
        id: price?.id ?? 0,
        roomNumber: combo.count, // Store count instead of single room number
        room_type: combo.room_type,
        room_category: combo.room_category,
        type: allData.room_types.find(t => t.id === combo.room_type)?.name ?? `Type ${combo.room_type}`,
        category: allData.room_category.find(c => c.id === combo.room_category)?.name ?? `Category ${combo.room_category}`,
        basePrice: price?.base_price ?? null,
        singlePrice: price?.single_person_price ?? null,
        halfDayPrice: price?.half_day_price ?? null,
        numberOfRoomsToSell: combo.count,
      };
    });
  };

  // All room combinations (for display in table)
  const allOptions = useMemo(() => {
    return rows.map(r => ({
      label: `${r.type} – ${r.category} (${r.roomNumber} өрөө)`,
      value: `${r.room_type}-${r.room_category}`,
      room_type: r.room_type,
      room_category: r.room_category,
      count: r.roomNumber
    }));
  }, [rows]);

  // Only combinations WITHOUT prices (for "add new" modal)
  const availableOptions = useMemo(() => {
    return allOptions.filter(opt => {
      const row = rows.find(r => `${r.room_type}-${r.room_category}` === opt.value);
      return !row || row.id === 0; // No price exists
    });
  }, [allOptions, rows]);

  const createPrice = async () => {
    try {
      const token = await getClientBackendToken();
      if (!token) throw new Error("Token not found");
      
      const response = await fetch(
        `https://dev.kacc.mn/api/room-prices/?token=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hotel, ...form }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create price');
      }
      
      // Clear cache to force re-fetch
      localStorage.removeItem(`roomPrices_${hotel}`);
      setOpenAdd(false);
      setIsRoomAdded(true);
      toast.success('Өрөөний үнэ амжилттай нэмэгдлээ');
    } catch (err: any) {
      console.error('Create price failed:', err);
      toast.error(err.message || 'Өрөөний үнэ нэмэж чадсангүй');
    }
  };

  const handleEdit = (row: RoomRow) => {
    // Check if this row has a valid price ID
    if (!row.id || row.id === 0) {
      toast.error('Энэ өрөөний бүлэгт үнэ оноогдоогүй байна');
      return;
    }
    
    // Find the actual price entry for this room type/category combination
    // Use Number() to ensure type matching
    const priceEntry = prices.find(
      p => Number(p.room_type) === Number(row.room_type) && 
           Number(p.room_category) === Number(row.room_category)
    );
    
    if (!priceEntry) {
      console.log('Debug - Row:', { 
        room_type: row.room_type, 
        room_category: row.room_category,
        id: row.id 
      });
      console.log('Debug - Prices:', prices.map(p => ({ 
        room_type: p.room_type, 
        room_category: p.room_category,
        id: p.id 
      })));
      toast.error('Үнийн мэдээлэл олдсонгүй. Console лог шалгана уу.');
      return;
    }
    
    setForm({
      room_type: row.room_type,
      room_category: row.room_category,
      base_price: priceEntry.base_price || 0,
      single_person_price: priceEntry.single_person_price || 0,
      half_day_price: priceEntry.half_day_price || 0,
    });
    
    setEditingPrice(priceEntry);
    setOpenEdit(true);
  };

  const updatePrice = async () => {
    if (!editingPrice) return;
    
    try {
      const token = await getClientBackendToken();
      if (!token) throw new Error("Token not found");
      
      const response = await fetch(
        `https://dev.kacc.mn/api/room-prices/${editingPrice.id}/?token=${encodeURIComponent(token)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hotel, ...form }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update price');
      }
      
      localStorage.removeItem(`roomPrices_${hotel}`);
      setOpenEdit(false);
      setEditingPrice(null);
      setIsRoomAdded(true);
      toast.success('Өрөөний үнэ амжилттай шинэчлэгдлээ');
    } catch (err: any) {
      console.error('Update price failed:', err);
      toast.error(err.message || 'Өрөөний үнэ шинэчлэхэд алдаа гарлаа');
    }
  };
  
  const handleDeleteClick = (priceId: number) => {
    // Check if price exists
    if (!priceId || priceId === 0) {
      toast.error('Энэ өрөөнд үнэ оноогдоогүй байна');
      return;
    }
    
    setPriceToDelete(priceId);
    setDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!priceToDelete) return;
    
    try {
      const token = await getClientBackendToken();
      if (!token) throw new Error('Token missing');
      
      const response = await fetch(
        `https://dev.kacc.mn/api/room-prices/${priceToDelete}/?token=${token}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to delete price');
      }
      
      toast.success('Үнэ амжилттай устгагдлаа');
      localStorage.removeItem(`roomPrices_${hotel}`);
      setIsRoomAdded(true);
      setDeleteDialogOpen(false);
      setPriceToDelete(null);
    } catch (err: any) {
      console.error('Delete failed:', err);
      toast.error(err.message || 'Үнэ устгаж чадсангүй');
      setDeleteDialogOpen(false);
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
                    {availableOptions.length > 0 ? (
                      availableOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Бүх өрөөний үнэ тохируулсан байна
                      </div>
                    )}
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
    <>
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
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
                    {availableOptions.length > 0 ? (
                      availableOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        Бүх өрөөний үнэ тохируулсан байна
                      </div>
                    )}
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
              <Button 
                onClick={createPrice}
                disabled={availableOptions.length === 0}
              >
                Хадгалах
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Price Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Өрөөний үнэ засах</DialogTitle>
            <DialogDescription>
              Өрөөний үнийн мэдээллийг шинэчлэх
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Өрөөний бүлэг</Label>
              <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                {lookup.room_types.find(t => t.id === form.room_type)?.name} – {' '}
                {lookup.room_category.find(c => c.id === form.room_category)?.name}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-base-price">Үндсэн үнэ</Label>
              <Input
                id="edit-base-price"
                type="number"
                value={form.base_price}
                onChange={e => setForm(f => ({ ...f, base_price: Number(e.target.value) }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-single-price">Ганц хүний үнэ</Label>
              <Input
                id="edit-single-price"
                type="number"
                value={form.single_person_price}
                onChange={e => setForm(f => ({ ...f, single_person_price: Number(e.target.value) }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-half-day-price">Хагас өдрийн үнэ</Label>
              <Input
                id="edit-half-day-price"
                type="number"
                value={form.half_day_price}
                onChange={e => setForm(f => ({ ...f, half_day_price: Number(e.target.value) }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setOpenEdit(false);
              setEditingPrice(null);
            }}>
              Цуцлах
            </Button>
            <Button onClick={updatePrice}>Шинэчлэх</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Өрөөний тоо</TableHead>
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
              // This line is not needed anymore since row already has the price info
              
              return (
                <TableRow key={`${row.room_type}-${row.room_category}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{row.roomNumber} өрөө</span>
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(row)}
                        disabled={!row.id || row.id === 0}
                        title={!row.id || row.id === 0 ? 'Үнэ оноогдоогүй' : 'Засах'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteClick(row.id)}
                        disabled={!row.id || row.id === 0}
                        title={!row.id || row.id === 0 ? 'Үнэ оноогдоогүй' : 'Устгах'}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Үнэ устгах</AlertDialogTitle>
            <AlertDialogDescription>
              Та үнэхээр энэ өрөөний үнийг устгахыг хүсэж байна уу? Энэ үйлдэл буцалтгүй.
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
    </>
  );
}
