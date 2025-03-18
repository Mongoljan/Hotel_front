'use client';

import React, { useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridValidRowModel,
} from '@mui/x-data-grid';
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add, ExpandMore, ExpandLess, Edit } from '@mui/icons-material';

// Define the Room type
interface Room extends GridValidRowModel {
  id: string | number;
  roomNumber: string;
  type: string;
  size?: string;
  bedType?: string;
  rank?: string;
  persons?: number;
  kids?: number;
  wc?: string;
  basePrice?: number;
  singlePersonPrice?: number;
  halfDayPrice?: number;
}

// Sample initial data
const initialRooms: Room[] = [
  { id: 1, roomNumber: '101', type: 'Deluxe', size: '30', bedType: 'King', rank: 'A', persons: 2, kids: 1, wc: 'Yes', basePrice: 100, singlePersonPrice: 80, halfDayPrice: 50 },
  { id: 2, roomNumber: '102', type: 'Deluxe', size: '32', bedType: 'King', rank: 'A', persons: 2, kids: 1, wc: 'Yes', basePrice: 110, singlePersonPrice: 90, halfDayPrice: 55 },
  { id: 3, roomNumber: '201', type: 'Suite', size: '40', bedType: 'Queen', rank: 'S', persons: 3, kids: 2, wc: 'Yes', basePrice: 150, singlePersonPrice: 120, halfDayPrice: 75 },
];

export default function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  // Toggle type expansion
  const toggleTypeExpansion = (type: string) => {
    setExpandedTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  // Define columns for DataGrid
  const columns: GridColDef<Room>[] = [
    { field: 'roomNumber', headerName: 'Room Number', flex: 1 },
    { field: 'type', headerName: 'Type', width: 150 },
    { field: 'size', headerName: 'Size (m²)', width: 100 },
    { field: 'bedType', headerName: 'Bed Type', width: 120 },
    { field: 'rank', headerName: 'Rank', width: 80 },
    { field: 'persons', headerName: 'Persons', width: 100 },
    { field: 'kids', headerName: 'Kids', width: 100 },
    { field: 'wc', headerName: 'WC', width: 80 },
    { field: 'basePrice', headerName: 'Base Price', width: 150, valueGetter: (params: any) => params.row?.basePrice ?? 0 },
    { field: 'singlePersonPrice', headerName: 'Single Person Price', width: 200, valueGetter: (params: any) => params.row?.singlePersonPrice ?? 0 },
    { field: 'halfDayPrice', headerName: 'Half Day Price', width: 150, valueGetter: (params: any) => params.row?.halfDayPrice ?? 0 },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between">
        <h1>Room Management</h1>
        <Button variant="contained" color="primary" startIcon={<Add />}>
          Add Room
        </Button>
      </div>

      <div style={{ marginTop: '1rem', height: 500 }}>
        <DataGrid rows={rooms} columns={columns} getRowId={(row) => row.id} autoHeight />
      </div>
    </div>
  );
}