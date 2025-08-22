'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoadingPage } from "@/components/ui/loading";
import { SidebarLayout } from "@/components/sidebar-provider";


export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <LoadingPage title="Initializing..." description="Setting up your dashboard" />
    );
  }

  return (
    <SidebarLayout>
      {children}
    </SidebarLayout>
  );
}
