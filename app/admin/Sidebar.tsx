import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdOutlineSpaceDashboard,
  MdOutlineBedroomChild,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdOutlineAddBox,
  MdOutlineListAlt,
  MdOutlineCategory,
} from "react-icons/md";
import { IoPersonOutline } from "react-icons/io5";
import { LuHotel } from "react-icons/lu";

export default function Sidebar() {
  const [isHotelMenuOpen, setHotelMenuOpen] = useState(false);
  const [isRoomMenuOpen, setRoomMenuOpen] = useState(false); // State for Room Submenu

  const toggleRoomMenu = () => {
    setRoomMenuOpen(!isRoomMenuOpen);
  };

  const pathname = usePathname();
  const navItems = [
    { href: "/admin/hotel",  icon: <LuHotel />, label: "Буудлын бүртгэл"},
    // { href: "/admin/register", icon: <IoPersonOutline />, label: "Register staff" },
    // { href: "/admin/register_hotel", icon: <LuHotel />, label: "Буудлын бүртгэл" },
    {
      label: "Rooms",
      icon: <MdOutlineBedroomChild />,
      subMenu: [
        { href: "/admin/room", icon: <MdOutlineAddBox />, label: "Add Room" },
        { href: "/admin/room/price", icon: <MdOutlineListAlt />, label: "Rooms' price" },
        // { href: "/admin/room/categories", icon: <MdOutlineCategory />, label: "Room Categories" },
      ],
    },
  ];

  return (
    <div className="p-2 h-full pt-[100px] bg-white text-sidebar-accent-foreground border-primary border-solid border-[1px] border-opacity-30">
      <nav className="flex flex-col gap-4 font-normal">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.subMenu ? (
              // If submenu exists, render a collapsible item
              <div>
                <button
                  onClick={toggleRoomMenu}
                  className={`w-full text-left rounded-lg items-center px-2 py-2 flex justify-between transition-colors ${
                    isRoomMenuOpen ? "bg-background" : "hover:bg-background"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="text-lg">{item.icon}</div>
                    <span className="ml-2 text-[14px]">{item.label}</span>
                  </div>
                  <div className="text-lg">
                    {isRoomMenuOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                  </div>
                </button>

                {/* Submenu */}
                {isRoomMenuOpen && (
                  <div className="ml-8 mt-2 flex flex-col gap-2">
                    {item.subMenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`rounded-lg items-center px-2 py-1 flex transition-colors ${
                          pathname === subItem.href
                            ? "bg-background"
                            : "hover:bg-background"
                        }`}
                      >
                        <div className="text-lg mr-2">{subItem.icon}</div>
                        <span className="text-[14px]">{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Regular Menu Item
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg items-center px-2 py-2 flex transition-colors ${
                  pathname === item.href
                    ? "bg-background"
                    : "hover:bg-background"
                }`}
              >
                <div className="text-lg">{item.icon}</div>
                <span className="ml-2 text-[14px]">{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
