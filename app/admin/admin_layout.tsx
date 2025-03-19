'use client'

import { useEffect, useState } from "react";
import Topbar from "./TopbarAdmin";
import Sidebar from "./Sidebar";

export default function Layout({ children,}: { children: React.ReactNode; }) {
  const [isSidebarVisible, setSidebarVisible] = useState(true);
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
      <div className="fixed top-0 left-0 z-[100] right-0">

      <Topbar toggleSidebar={toggleSidebar} sideBarOpen={isSidebarVisible}  />

</div>
      <div className="relative flex">
        {/* Sidebar */}
        <div
          className={`fixed top-0  left-0  transition-transform duration-500 ease-in-out transform bg-gray-100 shadow-lg w-60 h-screen
          ${isSidebarVisible ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Sidebar   />
        </div>

        {/* Main content */}
        <div
          className={`flex-grow mt-[50px] bg-white  transition-all duration-700 ease-in-out ${isSidebarVisible ? "ml-60" : "ml-0"}`}
        >
          {children}
        </div>
      </div>
    </>
  );
}
