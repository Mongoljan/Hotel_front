"use client";

import { Menu } from "lucide-react";
import { Button } from "./button";

export function SidebarToggle() {
  const handleToggle = () => {
    // Use the global function set up in admin layout
    if (typeof window !== 'undefined' && (window as any).toggleSidebar) {
      (window as any).toggleSidebar();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="sidebar-toggle-btn"
      id="sidebar-toggle"
      aria-label="Toggle sidebar"
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
} 