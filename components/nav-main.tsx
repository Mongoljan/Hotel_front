'use client';

import { type LucideIcon } from 'lucide-react';
import { NavItem } from '@/constants/data';
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

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const tNav = useTranslations('Navigation');

  return (
    <SidebarGroup>
  <SidebarGroupLabel>{tNav('platform')}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.url;
          
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.i18nKey ? tNav(item.i18nKey) : item.title}
                    isActive={isActive}
                    asChild={!item.items}
                  >
                    {item.items ? (
                      <>
                        <div className="flex items-center">
                          <Icon className="mr-2" size={16} />
                          <span className="text-cyrillic">{item.i18nKey ? tNav(item.i18nKey) : item.title}</span>
                        </div>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </>
                    ) : (
                      <Link href={item.url} className="flex items-center">
                        <Icon className="mr-2" size={16} />
                        <span className="text-cyrillic">{item.i18nKey ? tNav(item.i18nKey) : item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                
                {item.items && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = pathname === subItem.url;
                        
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={isSubActive}>
                              <Link href={subItem.url} className="flex items-center">
                                <SubIcon className="mr-2" size={14} />
                                <span className="text-cyrillic">{subItem.i18nKey ? tNav(subItem.i18nKey) : subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}