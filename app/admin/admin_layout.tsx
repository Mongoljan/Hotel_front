'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoadingPage } from "@/components/ui/loading";
import { SidebarLayout } from "@/components/sidebar-provider";
import { useTranslations } from 'next-intl';


export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const t = useTranslations('Loading');
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <LoadingPage title={t('initializing')} description={t('setting_up_dashboard')} />
    );
  }

  return (
    <SidebarLayout>
      {children}
    </SidebarLayout>
  );
}
