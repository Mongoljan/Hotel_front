"use client";
import { useState, useEffect } from "react";
import Menu from "@/components/menu";
import Link from "next/link";
import Topbar from "@/components/topbar";
interface MenuConfig {
  showAdminDashboard: boolean;
  showAdminSettings: boolean;
  showSettings: boolean;
  showContact: boolean;
  showProfile: boolean;
  showUserMenu: boolean;
}

export default function Home() {
  const [menuConfig, setMenuConfig] = useState<MenuConfig>(() => {
    if (typeof window !== "undefined") {
      const savedConfig = localStorage.getItem("menuConfig");
      return savedConfig
        ? JSON.parse(savedConfig)
        : {
            showAdminDashboard: false,
            showAdminSettings: false,
            showSettings: false,
            showContact: false,
            showProfile: false,
            showUserMenu: false,
          };
    }
    return {
      showAdminDashboard: false,
      showAdminSettings: false,
      showSettings: false,
      showContact: false,
      showProfile: false,
      showUserMenu: false,
    };
  });

  const [savedMessage, setSavedMessage] = useState(false);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setMenuConfig((prevConfig) => ({
      ...prevConfig,
      [name]: checked,
    }));
  };

  useEffect(() => {
    localStorage.setItem("menuConfig", JSON.stringify(menuConfig));
  }, [menuConfig]);

  const handleSave = () => {
    localStorage.setItem("menuConfig", JSON.stringify(menuConfig));
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
    }, 3000);
  };

  return (
    <>
    <Topbar/>
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Menu {...menuConfig} />
        <div className="text-[40px]">Нүүр хуудас</div>
        <div>Админ</div>

        <div className="flex flex-col gap-4 mt-4">
          {Object.keys(menuConfig).map((key) => (
            <label key={key}>
              <input
                type="checkbox"
                name={key}
                checked={menuConfig[key as keyof MenuConfig]}
                onChange={handleCheckboxChange}
              />
              {key.replace("show", "").replace(/([A-Z])/g, " $1").trim()} харуулах
            </label>
          ))}
        </div>

        <button
          className="bg-blue-500 text-white p-2 rounded w-full mt-4"
          onClick={handleSave}
        >
          Save Configuration
        </button>
        <Link href="/#">Гарах</Link>

        {savedMessage && (
          <div className="text-green-500 mt-4">Амжилттай хадгаллаа.</div>
        )}
      </main>
    </div>
    </>
  );
}
