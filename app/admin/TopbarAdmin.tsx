'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { HiArrowRightOnRectangle } from "react-icons/hi2";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from 'next-intl';
import UserProfileToggle from "@/components/UserProfileToggle";
import { useEffect, useState } from "react";

interface HotelInfo {
  CompanyName: string;
  PropertyName: string;
  is_approved: boolean;
}


export default function Topbar({

  toggleSidebar,
  sideBarOpen,
  userApproved,
  isApproved,
  hotelInfo,
  forceHideSidebar
}: {
  toggleSidebar: () => void;
  sideBarOpen: boolean;
  userApproved: boolean;
  isApproved: boolean;
  hotelInfo: HotelInfo | null;
  forceHideSidebar: boolean;
}) {
  const [groupName, setGroupName] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Topbar');

  const changeLanguage = (newLang: string) => {
    const segments = pathname.split('/').filter(Boolean);
    if (['en', 'mn'].includes(segments[0])) {
      segments[0] = newLang;
    } else {
      segments.unshift(newLang);
    }
    router.push(`/${segments.join('/')}`);
  };

  const handleLogout = () => {
    Object.keys(Cookies.get()).forEach(cookieName => {
      Cookies.remove(cookieName);
    });
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
    window.location.href = '/auth/login';
  };
  useEffect(() => {
  const stored = JSON.parse(localStorage.getItem('propertyBasicInfo') || '{}');
  // console.log(stored);
  if (stored.part_of_group && stored.group_name) {
    setGroupName(stored.group_name);
  }
}, []);

// console.log(groupName);
  return (
    <div>
      <div className="h-[50px] backdrop-blur-md opacity-[50] border-b-[1px] border-primary border-opacity-30 bg-white px-[50px] text-black flex justify-between items-center">
        {/* Left Side */}
        {!forceHideSidebar ? (
          <div className="mr-2 flex">
            <button onClick={toggleSidebar} className="flex ml-4 flex-col justify-center items-center mr-4">
              <span className={`bg-primary block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${sideBarOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"}`} />
              <span className={`bg-primary block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${sideBarOpen ? "opacity-0" : "opacity-100"}`} />
              <span className={`bg-primary block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${sideBarOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"}`} />
            </button>
            <div className="text-black font-semibold text-xl">
              Буудлын админ
            </div>
          </div>
        ) : (
          <div className="text-black font-semibold text-xl ml-6">
            Буудлын админ
          </div>
        )}
       


        {/* Right Side */}\
        <div className="flex gap-x-6 items-center">
          {/* Hotel Info */}
                {groupName && (
  <div className="text-right hidden sm:flex sm:flex-col items-end">
    <p className="leading-tight font-medium text-black">Груп:</p>  <p className="text-sm text-soft leading-tight">{groupName}</p>
  </div>
)}
          {hotelInfo && (
            <div className="text-right hidden sm:flex sm:gap-x-4 items-center">
              <div>
                <p className="leading-tight font-medium text-black">{hotelInfo.CompanyName}</p>
                <p className="text-sm text-soft leading-tight">{hotelInfo.PropertyName}</p>
              </div>
            </div>
          )}
     

          {/* Language + Profile */}
          <div className="flex gap-2 items-center">
            <LanguageSwitcher />
            <UserProfileToggle userApproved={userApproved} />
          </div>
        </div>
      </div>
    </div>
  );
}
