'use client';

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";

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
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Set up the sidebar toggle functionality
    const handleSidebarToggle = () => {
      setSidebarOpen(prev => !prev);
    };

    // Add a global function to window for the topbar to use
    (window as any).toggleSidebar = handleSidebarToggle;

    // Cleanup
    return () => {
      delete (window as any).toggleSidebar;
    };
  }, []);

  useEffect(() => {
    const fetchHotelInfo = async () => {
      if (!user?.hotel) return;

      try {
        const res = await fetch(`https://dev.kacc.mn/api/properties/${user.hotel}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch hotel info: ${res.status}`);
        }
        const hotel = await res.json();
        setHotelInfo(hotel);
      } catch (err) {
        console.error("Error fetching hotel info:", err);
      }
    };

    if (isAuthenticated && user?.hotel) {
      fetchHotelInfo();
    }
  }, [isAuthenticated, user?.hotel]);

  if (!isMounted) return null;

  // Only render layout for authenticated users
  if (!isAuthenticated) {
    return <div className="flex items-center justify-center h-screen bg-background text-foreground">Loading...</div>;
  }

  return (
    <div className="relative flex min-h-screen bg-background pt-16">
      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 transition-transform duration-300 ease-in-out transform bg-card border-r shadow-lg w-64 h-[calc(100vh-4rem)] z-40 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div
        className={`flex-1 min-h-screen bg-background transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <main>
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden top-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
