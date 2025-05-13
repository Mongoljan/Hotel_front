'use client';

import { useEffect, useState } from "react";
import Topbar from "./TopbarAdmin";
import Sidebar from "./Sidebar";

interface HotelInfo {
  pk: number;
  register: string;
  CompanyName: string;
  PropertyName: string;
  location: string;
  property_type: number;
  phone: string;
  mail: string;
  is_approved: boolean;
  created_at: string;
}

export default function Layout({
  children,
  userApproved,
}: {
  children: React.ReactNode;
  userApproved: boolean;
}) {
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);
  const [forceHideSidebar, setForceHideSidebar] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const hotelId = userInfo?.hotel;
    const email = userInfo?.email;

    const proceedKey = `proceed_${email}`;

    const checkProceedValue = () => {
      const storedValue = localStorage.getItem(proceedKey);
      if (storedValue !== "2") {
        setForceHideSidebar(true);
        setSidebarVisible(false);
      } else {
        setForceHideSidebar(false);
      }
    };

    checkProceedValue();

    const fetchHotelInfo = async () => {
      try {
        if (!hotelId) return;

        const res = await fetch(`https://dev.kacc.mn/api/properties/${hotelId}`);
        if (!res.ok) throw new Error("Failed to fetch hotel info");

        const hotel = await res.json();
        setHotelInfo(hotel);
      } catch (err) {
        console.error("Error fetching hotel info:", err);
      }
    };

    fetchHotelInfo();

    // 👇 Listen to localStorage changes (useful for multi-tab behavior)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === proceedKey) {
        checkProceedValue();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleSidebar = () => {
    if (!forceHideSidebar) {
      setSidebarVisible(!isSidebarVisible);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <div className="fixed top-0 left-0 z-[100] right-0">
        <Topbar
          toggleSidebar={toggleSidebar}
          sideBarOpen={isSidebarVisible}
          userApproved={userApproved}
          isApproved={hotelInfo?.is_approved === true}
          hotelInfo={hotelInfo}
          forceHideSidebar={forceHideSidebar}
        />
      </div>

      <div className="relative flex">
        {!forceHideSidebar && (
          <div
            className={`fixed top-0 left-0 transition-transform duration-500 ease-in-out transform bg-gray-100 shadow-lg w-60 h-screen ${
              isSidebarVisible ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar
              isApproved={hotelInfo?.is_approved === true}
              userApproved={userApproved}
            />
          </div>
        )}

        <div
          className={`flex-grow mt-[50px] bg-white transition-all duration-700 ease-in-out ${
            !forceHideSidebar && isSidebarVisible ? "ml-60" : "ml-0"
          }`}
        >
          {children}
        </div>
      </div>
    </>
  );
}
