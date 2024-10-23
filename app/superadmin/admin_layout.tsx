'use client'

import { useEffect, useState } from "react";
import Topbar from "./TopbarAdmin";
import Sidebar from "./Sidebar";

export default function Layout({ children,}: { children: React.ReactNode;}) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure this runs only on the client-side after the component has mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  if (!isMounted) {
    // Prevent hydration errors by returning null until the client renders the component
    return null;
  }

  return (
    <>
      {/* Topbar with the new button to toggle sidebar */}
      <Topbar toggleSidebar={toggleSidebar} sideBarOpen={isSidebarVisible}  />

      <div className="relative flex">
        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 z-50 transition-transform duration-700 ease-in-out transform bg-gray-100 shadow-lg w-80 h-screen
          ${isSidebarVisible ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Sidebar />
        </div>

        {/* Main content */}
        <div
          className={`flex-grow z-10 transition-all duration-700 ease-in-out ${isSidebarVisible ? "ml-80" : "ml-0"}`}
        >
          {children}
        </div>
      </div>
    </>
  );
}
