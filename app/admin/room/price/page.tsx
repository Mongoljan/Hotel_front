'use client';

import React, { useState } from 'react';
import RoomPriceList from './RoomPriceList';
import SeasonPrice from './SeasonPrice';


export default function RoomManagement() {

  const [isRoomAdded, setIsRoomAdded]= useState(false);
  // Define columns for DataGrid
 

  return (
    <div className="p-10">
     <RoomPriceList isRoomAdded={isRoomAdded} setIsRoomAdded={setIsRoomAdded }/>
     <div className="py-10"></div>
     <SeasonPrice />
    </div>
  );
}