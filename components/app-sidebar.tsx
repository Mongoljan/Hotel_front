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
import { USER_TYPES } from '@/lib/userTypes';
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
  userType: number;
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

  const tooltipMessage = !isApproved || !userApproved
    ? tNav('waitingApprovalTooltip') || 'Зөвшөөрөл авсны дараа цэсүүд харагдана. Админы зөвшөөрлийг түр хүлээнэ үү.'
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
            <p className="text-xs">{tooltipMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="px-4 py-3 mt-4 text-xs text-muted-foreground bg-muted/50 rounded-lg mx-3 cursor-help">
            {message}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[250px]">
          <p className="text-xs">{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AppSidebar({ isApproved, userApproved, hotelRegistrationCompleted, userType, ...props }: AppSidebarProps) {
  const tNav = useTranslations('Navigation');
  const mobileSidebarTitle = tNav('sidebarMobileTitle');

  // Filter navigation items based on approval status, hotel registration completion, and user role
  const filteredNavItems = React.useMemo(() => {
    // Reception (4) and Manager (3) who are NOT approved: show no navigation (they see StaffWaitingView)
    const isStaffUser = userType === USER_TYPES.RECEPTION || userType === USER_TYPES.MANAGER;
    if (isStaffUser && (!isApproved || !userApproved)) {
      // Staff users waiting for approval - no menu needed, they see StaffWaitingView
      return [];
    }

    // Owner who is not approved or registration not completed: show only hotel info
    if (!isApproved || !userApproved || !hotelRegistrationCompleted) {
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

    // Reception (4): Cannot see Settings submenu at all
    if (userType === USER_TYPES.RECEPTION) {
      return navItems.filter(item => item.i18nKey !== 'settings');
    }

    // Manager (3): Same as Owner but cannot see Users menu item
    if (userType === USER_TYPES.MANAGER) {
      return navItems.map(item => {
        if (item.i18nKey === 'settings' && item.items) {
          return {
            ...item,
            items: item.items.filter(subItem => subItem.url !== '/admin/users'),
          };
        }
        return item;
      });
    }

    // Owner (2) and others: Full access
    return navItems;
  }, [isApproved, userApproved, hotelRegistrationCompleted, userType]);

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