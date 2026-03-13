'use client';

import { type LucideIcon } from 'lucide-react';
import { NavItem, NavSection, dashboardItem, navSections } from '@/constants/data';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

interface NavMainProps {
  items?: NavItem[];
  sections?: NavSection[];
  dashboardNav?: NavItem;
}

function NavItemComponent({ item, pathname, tNav }: { item: NavItem; pathname: string; tNav: (key: string) => string }) {
  const Icon = item.icon;
  const isActive = pathname === item.url;
  const hasSubItems = item.items && item.items.length > 0;

  if (hasSubItems) {
    return (
      <Collapsible asChild defaultOpen={item.isActive} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.i18nKey ? tNav(item.i18nKey) : item.title}>
              <Icon size={16} />
              <span className="text-cyrillic truncate group-data-[collapsible=icon]:hidden">{item.i18nKey ? tNav(item.i18nKey) : item.title}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items!.map((subItem) => {
                const SubIcon = subItem.icon;
                const isSubActive = pathname === subItem.url;
                return (
                  <SidebarMenuSubItem key={subItem.url}>
                    <SidebarMenuSubButton asChild isActive={isSubActive}>
                      <Link href={subItem.url}>
                        <SubIcon size={14} />
                        <span className="text-cyrillic truncate">{subItem.i18nKey ? tNav(subItem.i18nKey) : subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={item.i18nKey ? tNav(item.i18nKey) : item.title} isActive={isActive} asChild>
        <Link href={item.url}>
          <Icon size={16} />
          <span className="text-cyrillic truncate flex-1 group-data-[collapsible=icon]:hidden">{item.i18nKey ? tNav(item.i18nKey) : item.title}</span>
          {item.badge && item.badge > 0 && (
            <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs bg-primary text-primary-foreground group-data-[collapsible=icon]:hidden">
              {item.badge}
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NavMain({ items, sections, dashboardNav }: NavMainProps) {
  const pathname = usePathname();
  const tNav = useTranslations('Navigation');

  // Use new structure if sections provided, otherwise fallback to legacy items
  const useSections = sections || navSections;

  return (
    <>
      {/* Dashboard - standalone at top (only if provided) */}
      {dashboardNav && (
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip={dashboardNav.i18nKey ? tNav(dashboardNav.i18nKey) : dashboardNav.title} 
                isActive={pathname === dashboardNav.url} 
                asChild
                className={pathname === dashboardNav.url ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : ''}
              >
                <Link href={dashboardNav.url}>
                  <dashboardNav.icon size={16} />
                  <span className="text-cyrillic truncate group-data-[collapsible=icon]:hidden">{dashboardNav.i18nKey ? tNav(dashboardNav.i18nKey) : dashboardNav.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      )}

      {/* Grouped sections */}
      {useSections.map((section) => (
        <SidebarGroup key={section.i18nKey}>
          <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider truncate">
            {tNav(section.i18nKey)}
          </SidebarGroupLabel>
          <SidebarMenu>
            {section.items.map((item) => (
              <NavItemComponent key={item.url} item={item} pathname={pathname} tNav={tNav} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}