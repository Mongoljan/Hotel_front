'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { schemaCreateRoom } from '@/app/schema';
import { z } from 'zod';
import { toast } from 'sonner';
import { FaArrowRight, FaArrowLeft } from "react-icons/fa6";
import Cookies from 'js-cookie';
import RoomModal from './RoomModal';
import RoomListNew from './RoomListNew'






export default function RegisterRoom() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoomAdded, setIsRoomAdded]= useState(false);

  return (
    <div className="w-full">
      <RoomListNew isRoomAdded={isRoomAdded} setIsRoomAdded={setIsRoomAdded}/>
    </div>
  );
}
