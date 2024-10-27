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

          Admin dashboard
        </Link>
        {/* <Link
          className="rounded-lg px-4 py-2 hover:bg-blue-500 hover:text-white transition-colors"
          href="/reports"
        >
          Reports
        </Link>
      
        <div className="flex flex-col">
          <button
            className="rounded-lg px-4 py-2 hover:bg-blue-500 hover:text-white transition-colors flex justify-between items-center"
            onClick={toggleHotelMenu}
          >
            Manage Hotel
            <span className={`ml-2 transform transition-transform ease-in-out duration-400 ${isHotelMenuOpen ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>
          {isHotelMenuOpen && (
            <div className="flex flex-col ml-4 mt-2 space-y-2">
              <Link
                className="rounded-lg px-4 py-2 bg-gray-100 hover:bg-blue-500 hover:text-white transition-colors"
                href="/manage-hotel/rooms"
              >
                Rooms
              </Link>
              <Link
                className="rounded-lg px-4 py-2 bg-gray-100 hover:bg-blue-500 hover:text-white transition-colors"
                href="/manage-hotel/bookings"
              >
                Bookings
              </Link>
              <Link
                className="rounded-lg px-4 py-2 bg-gray-100 hover:bg-blue-500 hover:text-white transition-colors"
                href="/manage-hotel/staff"
              >
                Staff
              </Link>
            </div>
          )}
        </div>

        <Link
          className="rounded-lg px-4 py-2 hover:bg-blue-500 hover:text-white transition-colors"
          href="/settings"
        >
          Settings
        </Link>
        <Link
          className="rounded-lg px-4 py-2 hover:bg-blue-500 hover:text-white transition-colors"
          href="/support"
        >
          Support
        </Link> */}
        <Link
          className="rounded-lg px-4 py-2 hover:bg-blue-500 hover:text-white transition-colors"
          href="/admin/register"
        >
Register staff
        </Link>
        <Link
          className="rounded-lg px-4 py-2 hover:bg-blue-500 hover:text-white transition-colors"
          href="/admin/register_hotel"
        >
Register hotel
        </Link>
      
      </nav>
    </div>
  );
}
