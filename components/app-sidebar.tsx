'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavMain } from '@/components/nav-main';
import { OrgSwitcher } from '@/components/org-switcher';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navItems } from '@/constants/data';
import { useTranslations } from 'next-intl';
import { AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isApproved: boolean;
  userApproved: boolean;
  hotelRegistrationCompleted: boolean;
}

function SidebarStatusMessage({ isApproved, userApproved, hotelRegistrationCompleted }: { isApproved: boolean; userApproved: boolean; hotelRegistrationCompleted: boolean }) {
  const { state } = useSidebar();
  const tNav = useTranslations('Navigation');
  const isCollapsed = state === 'collapsed';

  if (isApproved && userApproved && hotelRegistrationCompleted) {
    return null;
  }

  const message = !isApproved || !userApproved
    ? tNav('waitingApproval') || 'Зөвшөөрөл хүлээгдэж байна...'
    : !hotelRegistrationCompleted
      ? tNav('completeRegistration') || 'Буудлын бүртгэлийг дуусгаснаар бүх цэс нээгдэнэ'
      : '';

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center py-3 mt-4 mx-auto">
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[250px]">
            <p className="text-xs">{message}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="px-4 py-3 mt-4 text-xs text-muted-foreground bg-muted/50 rounded-lg mx-3">
      {message}
    </div>
  );
}

export function AppSidebar({ isApproved, userApproved, hotelRegistrationCompleted, ...props }: AppSidebarProps) {
  const tNav = useTranslations('Navigation');
  const mobileSidebarTitle = tNav('sidebarMobileTitle');

  // Filter navigation items based on approval status and hotel registration completion
  const filteredNavItems = React.useMemo(() => {

    if (isApproved && userApproved && hotelRegistrationCompleted) {
      return navItems;
    } else {
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
        <SidebarStatusMessage
          isApproved={isApproved}
          userApproved={userApproved}
          hotelRegistrationCompleted={hotelRegistrationCompleted}
        />
      </SidebarContent>

      <SidebarFooter>
        <UserAvatarProfile />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}