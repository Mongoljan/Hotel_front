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
import { useTranslations } from 'next-intl';
import { IoIosSettings, IoIosChatboxes } from "react-icons/io";
import { LuReceipt } from "react-icons/lu";
import { GiLockedDoor } from "react-icons/gi";
import { BsCardChecklist } from "react-icons/bs";

export default function Sidebar({ isApproved,   userApproved }: { isApproved: boolean, userApproved:boolean }) {
  const t = useTranslations('Sidebar');
  const [isRoomMenuOpen, setRoomMenuOpen] = useState(false);
  const pathname = usePathname();

  const hotelRegistrationItem = {
    href: "/admin/hotel",
    icon: <LuHotel />,
    label: t("hotelManagement"),
  };
  console.log(isApproved);

  const navItems = (isApproved && userApproved)
    ? [
        { href: "/admin/dashboard", icon: <MdOutlineSpaceDashboard />, label: "Dashboard" },
        { href: "", icon: <BsCardChecklist />, label: "Захиалгын жагсаалт" },
        { href: "", icon: <GiLockedDoor />, label: "Өрөө блок" },
        { href: "", icon: <LuReceipt />, label: "Төлбөр тооцоо" },
        { href: "", icon: <IoIosChatboxes />, label: "Асуулт хариулт" },
        {
          label: "Тохиргоо",
          icon: <IoIosSettings />,
          subMenu: [
            hotelRegistrationItem,
            { href: "/admin/room", icon: <MdOutlineAddBox />, label: "Өрөө" },
            { href: "/admin/room/price", icon: <MdOutlineListAlt />, label: "Үнэ" },
            { href: "", icon: <MdOutlineListAlt />, label: "Үйлчилгээ" },
            { href: "", icon: <MdOutlineListAlt />, label: "Гэрээ байгуулах" },
            { href: "", icon: <MdOutlineListAlt />, label: "Нөхцөл бодлого" },
            { href: "", icon: <MdOutlineListAlt />, label: "Админ эрх" },
            { href: "", icon: <MdOutlineListAlt />, label: "Буудлын профайл" },
            { href: "", icon: <MdOutlineListAlt />, label: "Хөнгөлөлт" },
            { href: "", icon: <MdOutlineListAlt />, label: "Захиалах суваг" },
          ],
        },
      ]
    : [
        {
          label: "Тохиргоо",
          icon: <IoIosSettings />,
          subMenu: [hotelRegistrationItem],
        },
      ];

  const toggleRoomMenu = () => setRoomMenuOpen(!isRoomMenuOpen);

  return (
    <div className="p-2 h-full pt-[100px] bg-white text-sidebar-accent-foreground border-primary border-solid border-[1px] border-opacity-30">
      <nav className="flex flex-col gap-4 font-normal">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.subMenu ? (
              <div>
                <button
                  onClick={toggleRoomMenu}
                  className={`w-full text-left rounded-lg items-center px-2 py-2 flex justify-between transition-colors ${
                    isRoomMenuOpen ? "bg-background" : "hover:bg-background"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="text-xl text-primary">{item.icon}</div>
                    <span className="ml-1 text-[14px]">{item.label}</span>
                  </div>
                  <div className="text-xl">
                    {isRoomMenuOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                  </div>
                </button>

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
                        <span className="text-[14px] text-dim">{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg items-center px-2 py-2 flex transition-colors ${
                  pathname === item.href
                    ? "bg-background"
                    : "hover:bg-background"
                }`}
              >
                <div className="text-xl text-primary">{item.icon}</div>
                <span className="ml-2 text-[14px]">{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
