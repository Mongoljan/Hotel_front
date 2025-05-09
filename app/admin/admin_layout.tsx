'use client';

import { useEffect, useState } from "react";
import Topbar from "./TopbarAdmin";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);

    // Load hotel approval status
    const fetchApprovalStatus = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const hotelId = userInfo?.hotel;

        if (!hotelId) return;

        const res = await fetch(`https://dev.kacc.mn/api/properties/${hotelId}`);
        if (!res.ok) throw new Error("Failed to fetch hotel info");

        const hotel = await res.json();
        setIsApproved(hotel?.is_approved === true);
      } catch (err) {
        console.error("Error fetching approval status:", err);
      }
    };

    fetchApprovalStatus();
  }, []);

  const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);

  if (!isMounted) return null; // Prevent hydration mismatch

  return (
    <>
      <div className="fixed top-0 left-0 z-[100] right-0">
        <Topbar toggleSidebar={toggleSidebar} sideBarOpen={isSidebarVisible} />
      </div>
      <div className="relative flex">
        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 transition-transform duration-500 ease-in-out transform bg-gray-100 shadow-lg w-60 h-screen ${
            isSidebarVisible ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar isApproved={isApproved} />
        </div>

        {/* Main content */}
        <div
          className={`flex-grow mt-[50px] bg-white transition-all duration-700 ease-in-out ${
            isSidebarVisible ? "ml-60" : "ml-0"
          }`}
        >
          {children}
        </div>
      </div>
    </>
  );
}
