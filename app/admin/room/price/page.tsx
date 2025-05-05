'use client';

import React, { useState } from 'react';
import RoomPriceList from './RoomPriceList';


export default function RoomManagement() {

  const [isRoomAdded, setIsRoomAdded]= useState(false);
  // Define columns for DataGrid
 

  return (
    <div className="p-6">
     <RoomPriceList isRoomAdded={isRoomAdded} setIsRoomAdded={setIsRoomAdded }/>
    </div>
  );
}