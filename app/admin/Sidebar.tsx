import { useState } from "react";
import Link from "next/link";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { IoPersonOutline } from "react-icons/io5";
import { LuHotel } from "react-icons/lu";


export default function Sidebar( ){
  const [isHotelMenuOpen, setHotelMenuOpen] = useState(false);

  const toggleHotelMenu = () => {
    setHotelMenuOpen(!isHotelMenuOpen);
  };

  return (
    <div className="p-4 h-full bg-white text-black">
      {/* <div className="text-xl font-bold mb-8">My Sidebar</div> */}
      <nav className="flex flex-col gap-4">
        <Link
          className="rounded-lg items-center px-4 py-2 flex hover:bg-blue-500 hover:text-white transition-colors"
          href="/admin/dashboard"
        >

<MdOutlineSpaceDashboard className="mr-2 text-[24px]" />
          Admin dashboard 

        </Link>

        <Link
          className="rounded-lg items-center px-4  flex py-2 hover:bg-blue-500 hover:text-white transition-colors"
          href="/admin/register"
        >
          <IoPersonOutline className="mr-2 text-[24px]" />
Register staff

        </Link>
        <Link
          className="rounded-lg items-center flex  px-4 py-2 hover:bg-blue-500 hover:text-white transition-colors"
          href="/admin/register_hotel"
        >
          <LuHotel className="mr-2 text-[24px]" />
Register hotel

        </Link>
      
      </nav>
    </div>
  );
}
