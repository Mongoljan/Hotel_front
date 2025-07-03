'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { schemaCreateRoom } from '@/app/schema';
import { z } from 'zod';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowRight, FaArrowLeft } from "react-icons/fa6";
import RoomModal from './RoomModal';
import RoomList from './RoomList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BedDouble, Plus } from 'lucide-react';

export default function RegisterRoom() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoomAdded, setIsRoomAdded] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BedDouble className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Room Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your hotel rooms and availability</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Room</span>
        </button>
      </div>

      {/* Room List */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BedDouble className="h-5 w-5 text-blue-500" />
            <span>All Rooms</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RoomList isRoomAdded={isRoomAdded} setIsRoomAdded={setIsRoomAdded} />
        </CardContent>
      </Card>

      {/* Room Modal */}
      <RoomModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        roomToEdit={null}
        isRoomAdded={isRoomAdded}
        setIsRoomAdded={setIsRoomAdded}
      />

      <ToastContainer />
    </div>
  );
}
