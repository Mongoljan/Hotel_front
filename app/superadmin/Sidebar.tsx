import { useState } from "react";
import Link from "next/link";



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
          className="rounded-lg px-4 py-2 hover:bg-blue-500 hover:text-white transition-colors"
          href="/admin/dashboard"
        >

        </Link>
        
      </nav>
    </div>
  );
}
