"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { DataGrid, GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import { CircularProgress, IconButton } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RoomModal from "./RoomModal";

// Lookup data types
interface AllData {
  room_types: { id: number; name: string; is_custom: boolean }[];
  bed_types: { id: number; name: string; is_custom: boolean }[];
  room_category: { id: number; name: string; is_custom: boolean }[];
}

// Raw room data
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

// Flattened row for DataGrid
interface FlattenRow extends GridValidRowModel {
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
  description: string;
  smokingAllowed: string;
}

interface RoomManagementProps {
  isRoomAdded: boolean;
  setIsRoomAdded: (value: boolean) => void;
}

export default function RoomManagement({ isRoomAdded, setIsRoomAdded }: RoomManagementProps) {
  const [rawRooms, setRawRooms] = useState<RoomData[]>([]);
  const [lookup, setLookup] = useState<AllData>({ room_types: [], bed_types: [], room_category: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [tableWidth, setTableWidth] = useState(window.innerWidth * 0.7);

  const hotel = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('userInfo') || '{}').hotel
    : 0;

  // Fetch lookups and raw rooms
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        if (!token) throw new Error("Token not found");

        const [allRes, roomsRes] = await Promise.all([
          fetch("https://dev.kacc.mn/api/all-data/"),
          fetch(`https://dev.kacc.mn/api/roomsNew/?token=${token}`),
        ]);
        if (!allRes.ok || !roomsRes.ok) throw new Error("Failed to fetch data");

        const allData = (await allRes.json()) as AllData;
        const roomsData = (await roomsRes.json()) as RoomData[];
        setLookup(allData);
        setRawRooms(roomsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        if (isRoomAdded) setIsRoomAdded(false);
      }
    }
    fetchData();
  }, [isRoomAdded, setIsRoomAdded]);

  // Group raw data by type+category
  const groups = React.useMemo(() => {
    const typeMap = new Map(lookup.room_types.map(t => [t.id, t.name]));
    const categoryMap = new Map(lookup.room_category.map(c => [c.id, c.name]));
    const map = new Map<string, { type: string; category: string; rooms: RoomData[] }>();
    rawRooms.forEach(r => {
      const key = `${r.room_type}-${r.room_category}`;
      if (!map.has(key)) map.set(key, { type: typeMap.get(r.room_type) || `Type ${r.room_type}`, category: categoryMap.get(r.room_category) || `Category ${r.room_category}`, rooms: [] });
      map.get(key)!.rooms.push(r);
    });
    return map;
  }, [rawRooms, lookup]);

  // Build flattened rows with expand controls
  const rows: FlattenRow[] = [];
  groups.forEach((grp, key) => {
    // group row
    const groupRow: FlattenRow = {
      id: key,
      isGroup: true,
      type: grp.type,
      category: grp.category,
      roomNumber: `(${grp.rooms.length} rooms)`,
      size: "",
      bedType: "",
      wc: "",
      numberOfRooms: grp.rooms.reduce((sum, r) => sum + r.number_of_rooms, 0),
      numberOfRoomsToSell: grp.rooms.reduce((sum, r) => sum + r.number_of_rooms_to_sell, 0),
      description: "",
      smokingAllowed: "",
    };
    rows.push(groupRow);
    if (expanded.has(key)) {
      grp.rooms.forEach(r => {
        const childRow: FlattenRow = {
          id: `${key}-${r.room_number}`,
          isGroup: false,
          groupKey: key,
          type: '', // indent visually
          category: '',
          roomNumber: String(r.room_number),
          size: `${r.room_size} m²`, 
          bedType: lookup.bed_types.find(b => b.id === r.bed_type)?.name || `Bed ${r.bed_type}`,
          wc: r.is_Bathroom ? "Yes" : "No",
          numberOfRooms: r.number_of_rooms,
          numberOfRoomsToSell: r.number_of_rooms_to_sell,
          description: r.room_Description,
          smokingAllowed: r.smoking_allowed ? "Yes" : "No",
        };
        rows.push(childRow);
      });
    }
  });

  // Columns with custom expand cell renderer
  const columns: GridColDef<FlattenRow>[] = [
    {
      field: 'roomNumber',
      headerName: 'Room Number',
      flex: 1,
      renderCell: (params) => {
        if (params.row.isGroup) {
          const key = params.row.id;
          return (
            <IconButton size="small" onClick={() => {
              const newSet = new Set(expanded);
              if (newSet.has(key)) newSet.delete(key);
              else newSet.add(key);
              setExpanded(newSet);
            }}>
              {expanded.has(key) ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </IconButton>
          );
        }
        return <span style={{ paddingLeft: 24 }}>{params.value}</span>;
      }
    },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
    { field: 'size', headerName: 'Size', flex: 1 },
    { field: 'bedType', headerName: 'Bed Type', flex: 1 },
    { field: 'wc', headerName: 'Bathroom', flex: 1 },
    { field: 'numberOfRooms', headerName: 'Total Rooms', flex: 1 },
    { field: 'numberOfRoomsToSell', headerName: 'Rooms for Sale', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
    { field: 'smokingAllowed', headerName: 'Smoking Allowed', flex: 1 },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4">
        <h1 className="text-lg font-semibold">Өрөө бүртгэл</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 hover:bg-blue-300 rounded-md text-white px-4 py-2 transition">
          + Өрөө нэмэх
        </button>
      </div>

      <RoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isRoomAdded={isRoomAdded} setIsRoomAdded={setIsRoomAdded} />

      <div className="overflow-auto" style={{ width: tableWidth, height: 500 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <CircularProgress />
          </div>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={row => row.id}
            pageSizeOptions={[5, 10, 20]}
            autoPageSize
          />
        )}
      </div>
    </div>
  );
}