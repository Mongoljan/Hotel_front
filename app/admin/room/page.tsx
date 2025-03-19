'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { schemaCreateRoom } from '@/app/schema';
import { z } from 'zod';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowRight, FaArrowLeft } from "react-icons/fa6";
import Cookies from 'js-cookie';
import RoomModal from './RoomModal';
import RoomList from './RoomList'






export default function RegisterRoom() {

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex   h-full  rounded-[12px] max-w-full p-10">
  
<RoomList/>



    </div>
  );
}
