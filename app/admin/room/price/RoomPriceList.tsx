"use client";

import React, { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import {
  DataGrid, GridColDef, GridToolbar, GridValidRowModel
} from "@mui/x-data-grid";
import {
  CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem
} from "@mui/material";

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

interface RoomRow extends GridValidRowModel {
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
    const [tableWidth, setTableWidth] = useState(window.innerWidth * 0.7);
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
        const token = Cookies.get("token");
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
    const token = Cookies.get("token");
    if (!token) throw new Error("Token not found");
    await fetch("https://dev.kacc.mn/api/room-prices/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotel, ...form }),
    });
    // Clear cache to force re-fetch
    localStorage.removeItem(`roomPrices_${hotel}`);
    setOpenAdd(false);
    setIsRoomAdded(true);
  };

  const columns: GridColDef<RoomRow>[] = [
    { field: "roomNumber", headerName: "Room Number", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "basePrice", headerName: "Base Price", flex: 1 },
    { field: "singlePrice", headerName: "Single Person Price", flex: 1 },
    { field: "halfDayPrice", headerName: "Half Day Price", flex: 1 },
    { field: "numberOfRoomsToSell", headerName: "Rooms for Sale", flex: 1 },
  ];

  return (
    <>
      <div className="w-full">

       
        <div
       
         style={{ width: tableWidth , height: 500 }}
         >
                  <div className="flex justify-between mb-4">
          <h1 className="text-lg font-semibold">Өрөөний үнэ</h1>
          <Button onClick={() => setOpenAdd(true)} variant="contained" color="primary">
            + Өрөөний үнэ нэмэх
          </Button>
        </div>
  {loading ? (
    <div className="flex items-center justify-center h-full">
      <CircularProgress />
    </div>
  ) : (
    <>
      <div className="mb-2 font-semibold ">
        Room prices({rows.length})
      </div>

      <DataGrid
        className="overflow-y-auto" 
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        // autoPageSize={false}
        
        pageSizeOptions={[5, 10, 20, 50]}
        pagination
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 300 },
          },
        }}
        sx={{
          // border: '2px solid #FACC15',
          padding:"10px",
          borderRadius: 2,
        }}
      />
    </>
  )}
</div>

        </div>
    
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Нэмэх Үнийн Мэдээлэл</DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label="Available Room Group"
            value={`${form.room_type}-${form.room_category}`}
            fullWidth
            onChange={e => {
              const [rt, rc] = e.target.value.split('-').map(Number);
              setForm(f => ({ ...f, room_type: rt, room_category: rc }));
            }}
          >
            {options.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Base Price"
            type="number"
            fullWidth
            onChange={e => setForm(f => ({ ...f, base_price: Number(e.target.value) }))}
          />
          <TextField
            margin="dense"
            label="Single Person Price"
            type="number"
            fullWidth
            onChange={e => setForm(f => ({ ...f, single_person_price: Number(e.target.value) }))}
          />
          <TextField
            margin="dense"
            label="Half Day Price"
            type="number"
            fullWidth
            onChange={e => setForm(f => ({ ...f, half_day_price: Number(e.target.value) }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={createPrice} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
