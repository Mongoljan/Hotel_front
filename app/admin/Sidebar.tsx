import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { IoPersonOutline } from "react-icons/io5";
import { LuHotel } from "react-icons/lu";

export default function Sidebar() {
  const [isHotelMenuOpen, setHotelMenuOpen] = useState(false);

  const toggleHotelMenu = () => {
    setHotelMenuOpen(!isHotelMenuOpen);
  };

  const pathname = usePathname();
  const navItems = [
    { href: "/admin/dashboard", icon: <MdOutlineSpaceDashboard />, label: "Admin dashboard" },
    { href: "/admin/register", icon: <IoPersonOutline />, label: "Register staff" },
    { href: "/admin/register_hotel", icon: <LuHotel />, label: "Register hotel" },
  ];

  return (
    <div className="p-4 h-full pt-[50px]  bg-[#4b91e2]  text-blue-200">
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg   items-center px-4 py-4 flex transition-colors ${
              pathname === item.href
                ? " text-white font-bold"
                : " hover:text-white  "
            }`}
          >
         <div className="text-2xl">   {item.icon}</div> 
            <span className="ml-2">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
