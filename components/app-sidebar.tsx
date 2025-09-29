'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavMain } from '@/components/nav-main';
import { OrgSwitcher } from '@/components/org-switcher';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navItems } from '@/constants/data';
import { useTranslations } from 'next-intl';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isApproved: boolean;
  userApproved: boolean;
}

export function AppSidebar({ isApproved, userApproved, ...props }: AppSidebarProps) {
  const tNav = useTranslations('Navigation');
  const mobileSidebarTitle = tNav('sidebarMobileTitle');
  // Filter navigation items based on approval status
  const filteredNavItems = React.useMemo(() => {
    if (isApproved && userApproved) {
      return navItems;
    } else {
      // Only show hotel information for non-approved users
      return navItems.filter(item => 
        item.url === '/admin/hotel' || 
        (item.items && item.items.some(subItem => subItem.url === '/admin/hotel'))
      );
    }
  }, [isApproved, userApproved]);

  return (
    <Sidebar collapsible="icon" mobileTitle={mobileSidebarTitle} {...props}>
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={filteredNavItems} />
      </SidebarContent>
      
      <SidebarFooter>
        <UserAvatarProfile />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}