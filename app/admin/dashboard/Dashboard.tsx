'use client'
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';  // Import js-cookie
import CreateHotel from '../CreateHotel';


export default function AdminDashboard() {


const hotelName= Cookies.get('hotelName')

  return (
    <div className=" text-black  ">
      <h1>Admin Dashboard</h1>
      <p>Welcome, </p> {/* Display user info */}
      <div>
        added some changes
      hotel: <div className=" text-black text-[30px]"> {hotelName}</div> 
      <CreateHotel/>
        
      </div>
    </div>
  );
}
