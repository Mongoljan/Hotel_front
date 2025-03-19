"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { DataGrid, GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import { CircularProgress } from "@mui/material";
import RoomModal from "./RoomModal";

// Define the Room type based on API response
interface Room extends GridValidRowModel {
  id: number;
  roomNumber: number;
  type: string;
  size: string;
  bedType: string;
  wc: string;
  numberOfRooms: number;
  numberOfRoomsToSell: number;
  description: string;
  smokingAllowed: string;
}
interface RoomModalProps {
   isRoomAdded: boolean,
   setIsRoomAdded: (value: boolean) => void;
}
// Main Component
export default function RoomManagement({isRoomAdded, setIsRoomAdded} : RoomModalProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableWidth, setTableWidth] = useState(window.innerWidth * 0.7); // Default width is 70% of the window

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          console.error("Token not found");
          return;
        }

        const response = await fetch(`https://dev.kacc.mn/api/roomsNew/?token=${token}`);
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        const mappedRooms: Room[] = data.map((room: any) => ({
          id: room.room_number,
          roomNumber: room.room_number,
          type: `Type ${room.room_type}`,
          size: `${room.room_size} m²`,
          bedType: `Bed Type ${room.bed_type}`,
          wc: room.is_Bathroom ? "Yes" : "No",
          numberOfRooms: room.number_of_rooms,
          numberOfRoomsToSell: room.number_of_rooms_to_sell,
          description: room.room_Description,
          smokingAllowed: room.smoking_allowed ? "Yes" : "No",
        }));

        setRooms(mappedRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [isRoomAdded]);
  setIsRoomAdded(false);
  

  // Adjust width dynamically when window resizes
  useEffect(() => {
    const handleResize = () => {
      setTableWidth(window.innerWidth * 0.7); // Adjust dynamically based on viewport width
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Define columns for DataGrid
  const columns: GridColDef<Room>[] = [
    { field: "roomNumber", headerName: "Room Number", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },
    { field: "size", headerName: "Size", flex: 1 },
    { field: "bedType", headerName: "Bed Type", flex: 1 },
    { field: "wc", headerName: "Bathroom", flex: 1 },
    { field: "numberOfRooms", headerName: "Total Rooms", flex: 1 },
    { field: "numberOfRoomsToSell", headerName: "Rooms for Sale", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    { field: "smokingAllowed", headerName: "Smoking Allowed", flex: 1 },
  ];

  return (
    <div className=" w-full">
      <div className="flex justify-between mb-4">
        <h1 className="text-lg font-semibold">Өрөө бүртгэл</h1>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-500 hover:bg-blue-300 rounded-md text-white px-4 py-2 transition"
        >
          + Өрөө нэмэх
        </button>
      </div>

      <RoomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}  isRoomAdded={isRoomAdded} setIsRoomAdded={setIsRoomAdded} />

      <div 
        className="overflow-auto" 
        style={{ width: `${tableWidth}px`, height: "500px" }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <CircularProgress />
          </div>
        ) : (
          <DataGrid 
            rows={rooms} 
            columns={columns} 
            getRowId={(row) => row.id} 
            pageSizeOptions={[5, 10, 20]} 
            autoPageSize
          />
        )}
      </div>
    </div>
  );
}
