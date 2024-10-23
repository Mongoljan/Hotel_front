'use client';
import Link from "next/link";
import { useState } from "react";
import Menu from "@/components/menu";
import Topbar from "@/components/topbar";

export default function Home() {
  // State to manage checkboxes
  const [menuConfig, setMenuConfig] = useState({
    showAdminDashboard: false,
    showAdminSettings: false,
    showSettings: false,
    showContact: false,
    showProfile: false,
    showUserMenu: false,
  });

  // Handler to update menu visibility
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setMenuConfig((prevConfig) => ({
      ...prevConfig,
      [name]: checked,
    }));
  };

  return (
    <>
    <Topbar/>
    <div className=" grid grid-rows-[20px_1fr_20px] bg-[#E5F0FD] text-black items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">

        <div className="text-[40px]">Нүүр хуудас</div>

       
        {/* Checkbox controls for the menu */}
        <div className="flex flex-col gap-4 mt-4">
          <label>
            <input
              type="checkbox"
              name="showAdminDashboard"
              checked={menuConfig.showAdminDashboard}
              onChange={handleCheckboxChange}
            />
            Админы хуудас харуулах
          </label>
          <label>
            <input
              type="checkbox"
              name="showAdminSettings"
              checked={menuConfig.showAdminSettings}
              onChange={handleCheckboxChange}
            />
            Админы тохиргоо харуулах
          </label>
          <label>
            <input
              type="checkbox"
              name="showSettings"
              checked={menuConfig.showSettings}
              onChange={handleCheckboxChange}
            />
            Тохиргоо харуулах
          </label>
          <label>
            <input
              type="checkbox"
              name="showContact"
              checked={menuConfig.showContact}
              onChange={handleCheckboxChange}
            />
            Холбоо барих харуулах
          </label>
          <label>
            <input
              type="checkbox"
              name="showProfile"
              checked={menuConfig.showProfile}
              onChange={handleCheckboxChange}
            />
            Хувийн мэдээлэл харуулах
          </label>
          <label>
            <input
              type="checkbox"
              name="showUserMenu"
              checked={menuConfig.showUserMenu}
              onChange={handleCheckboxChange}
            />
            Хэрэглэгчийн цэс харуулах
          </label>
        </div>
      </main>

      {/* Pass the state to Menu */}
      <Menu
        showAdminDashboard={menuConfig.showAdminDashboard}
        showAdminSettings={menuConfig.showAdminSettings}
        showSettings={menuConfig.showSettings}
        showContact={menuConfig.showContact}
        showProfile={menuConfig.showProfile}
        showUserMenu={menuConfig.showUserMenu}
      />
    </div>
    </>
  );
}
