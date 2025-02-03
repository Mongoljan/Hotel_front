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
    { href: "/admin/dashboard", icon: <MdOutlineSpaceDashboard />, label: "Dashboard" },
    { href: "/admin/register", icon: <IoPersonOutline />, label: "Register staff" },
    { href: "/admin/register_hotel", icon: <LuHotel />, label: "Register hotel" },
  ];

  return (
    <div className="p-2 h-full pt-[100px] bg-white text-sidebar-accent-foreground  border-primary border-solid border-[1px]  border-opacity-30  ">
      <nav className="flex flex-col gap-4 font-normal">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg    items-center px-2 py-2 flex transition-colors ${
              pathname === item.href
                ? "   bg-background"
                : " hover:bg-background "
            }`}
          >
         <div className="text-lg">   {item.icon}</div> 
            <span className="ml-2 text-[14px]">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
