'use client';

import { usePathname, useRouter } from 'next/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UserProfileToggle from '@/components/UserProfileToggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { useEffect, useState } from 'react';

interface HotelInfo {
  CompanyName: string;
  PropertyName: string;
  is_approved: boolean;
}

export default function Topbar({
  toggleSidebar,
  sideBarOpen,
  hotelInfo,
}: {
  toggleSidebar: () => void;
  sideBarOpen: boolean;
  hotelInfo: HotelInfo | null;
}) {
  const [groupName, setGroupName] = useState<string | null>(null);

  useEffect(() => {
    // This logic relies on data from a different part of the application flow (hotel registration)
    // and is not directly related to the user's session.
    // It is left here for now but could be a candidate for refactoring into a shared context or service.
    const stored = localStorage.getItem('propertyBasicInfo');
    if (stored) {
      const info = JSON.parse(stored);
      if (info.part_of_group && info.group_name) {
        setGroupName(info.group_name);
      }
    }
  }, []);

  return (
    <div className="h-[50px] backdrop-blur-md font-semibold border-b-[1px] border-primary border-opacity-30 bg-white px-[50px] text-black flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="flex flex-col justify-center items-center"
        >
          <span
            className={`bg-primary block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
              sideBarOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"
            }`}
          ></span>
          <span
            className={`bg-primary block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
              sideBarOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`bg-primary block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
              sideBarOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"
            }`}
          ></span>
        </button>

        <div className="text-black text-[24px]">
          Буудлын админ
        </div>
      </div>

      <div className="flex gap-x-6 items-center">
        {/* Group name if in group */}
        {groupName && (
          <div className="text-right hidden sm:flex sm:flex-col items-end">
            <p className="leading-tight font-medium text-black">Груп:</p>
            <p className="text-sm text-soft leading-tight">{groupName}</p>
          </div>
        )}

        {/* Hotel info */}
        {hotelInfo && (
          <div className="text-right hidden sm:flex sm:gap-x-4 items-center">
            <div>
              <p className="leading-tight font-medium text-black">{hotelInfo.CompanyName}</p>
              <p className="text-sm text-soft leading-tight">{hotelInfo.PropertyName}</p>
            </div>
          </div>
        )}

        {/* Language & Profile */}
        <div className="flex gap-2 items-center">
          <ThemeToggle />
          <LanguageSwitcher />
          <UserProfileToggle />
        </div>
      </div>
    </div>
  );
}
