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
  const [isMounted, setIsMounted] = useState(false);
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);

  // ✅ Initially unknown state
  const [isSidebarVisible, setSidebarVisible] = useState<boolean>(false);
  const [forceHideSidebar, setForceHideSidebar] = useState<boolean>(false);
useEffect(() => {
  setIsMounted(true);

  const tryUntilSet = () => {
    const value = localStorage.getItem("proceed");

    if (value === "2") {
      setSidebarVisible(true);
      setForceHideSidebar(false);
      return true;
    } else {
      return false;
    }
  };

  // try once immediately
  if (tryUntilSet()) return;

  // retry a few times (since RegisterHotel might set 'proceed' after a delay)
  const intervalId = setInterval(() => {
    if (tryUntilSet()) {
      clearInterval(intervalId);
    }
  }, 200);

  // stop after 3 seconds
  setTimeout(() => clearInterval(intervalId), 3000);

  return () => clearInterval(intervalId);
}, []);


  // ✅ Listen for localStorage changes (multi-tab updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "proceed") {
        const value = e.newValue;
        if (value === "2") {
          setSidebarVisible(true);
          setForceHideSidebar(false);
        } else {
          setSidebarVisible(false);
          setForceHideSidebar(true);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ Fetch hotel info
  useEffect(() => {
    const fetchHotelInfo = async () => {
      try {
        const stored = localStorage.getItem("userInfo");
        const hotelId = stored ? JSON.parse(stored)?.hotel : null;
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
  }, []);

  const toggleSidebar = () => {
    if (!forceHideSidebar) {
      setSidebarVisible((prev) => !prev);
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
