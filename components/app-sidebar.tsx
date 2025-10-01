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
  hotelRegistrationCompleted: boolean;
}

export function AppSidebar({ isApproved, userApproved, hotelRegistrationCompleted, ...props }: AppSidebarProps) {
  const tNav = useTranslations('Navigation');
  const mobileSidebarTitle = tNav('sidebarMobileTitle');
  
  // Filter navigation items based on approval status and hotel registration completion
  const filteredNavItems = React.useMemo(() => {
    console.log('Sidebar filtering - isApproved:', isApproved, 'userApproved:', userApproved, 'hotelRegistrationCompleted:', hotelRegistrationCompleted);
    
    if (isApproved && userApproved && hotelRegistrationCompleted) {
      console.log('All conditions met - showing full menu');
      return navItems;
    } else {
      console.log('Conditions not met - showing limited menu (hotel info only)');
      // Only show hotel information until 6-step registration is completed
      return [
        {
          title: 'Тохиргоо',
          i18nKey: 'settings',
          url: '#',
          icon: navItems.find(item => item.i18nKey === 'settings')?.icon,
          isActive: false,
          items: [
            {
              title: 'Буудлын мэдээлэл',
              i18nKey: 'hotelInfo',
              url: '/admin/hotel',
              icon: navItems.find(item => item.items?.some(subItem => subItem.url === '/admin/hotel'))?.items?.find(subItem => subItem.url === '/admin/hotel')?.icon,
            },
          ],
        },
      ];
    }
  }, [isApproved, userApproved, hotelRegistrationCompleted]);

  return (
    <Sidebar collapsible="icon" mobileTitle={mobileSidebarTitle} {...props}>
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>
      
      <SidebarContent>
        <NavMain items={filteredNavItems} />
        {(!isApproved || !userApproved || !hotelRegistrationCompleted) && (
          <div className="px-4 py-3 mt-4 text-xs text-muted-foreground bg-muted/50 rounded-lg mx-3">
            {!isApproved || !userApproved 
              ? tNav('waitingApproval') || 'Зөвшөөрөлийн хүлээгдэж байна...'
              : !hotelRegistrationCompleted 
                ? tNav('completeRegistration') || 'Буудлын бүртгэлийг дуусгаснаар бүх цэс нээгдэнэ'
                : ''
            }
          </div>
        )}
      </SidebarContent>
      
      <SidebarFooter>
        <UserAvatarProfile />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}