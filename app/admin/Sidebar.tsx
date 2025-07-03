'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar,
  BedDouble,
  DollarSign,
  Eye,
  Settings,
  Building2,
  FileText,
  Users,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'bookingsManagement',
    href: '/admin/bookings',
    icon: Calendar,
  },
  {
    title: 'roomRegistration',
    href: '/admin/room',
    icon: BedDouble,
  },
  {
    title: 'roomPrice',
    href: '/admin/room/price',
    icon: DollarSign,
  },
  {
    title: 'topbarView',
    href: '/admin/topbar',
    icon: Eye,
  },
  {
    title: 'settings',
    icon: Settings,
    children: [
      {
        title: 'hotelInfo',
        href: '/admin/hotel',
        icon: Building2,
      },
      {
        title: 'roomRegistration',
        href: '/admin/room',
        icon: BedDouble,
      },
      {
        title: 'roomPrice',
        href: '/admin/room/price',
        icon: DollarSign,
      },
      {
        title: 'terms',
        href: '/admin/terms',
        icon: FileText,
      },
      {
        title: 'contractedOrganizations',
        href: '/admin/contracts',
        icon: Users,
      },
      {
        title: 'adminRights',
        href: '/admin/admin-rights',
        icon: Settings,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations('Sidebar');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['settings']));

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const toggleExpanded = (title: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedItems(newExpanded);
  };

  const renderSidebarItem = (item: SidebarItem, depth: number = 0) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.title);

    if (hasChildren) {
      return (
        <Collapsible
          key={item.title}
          open={isExpanded}
          onOpenChange={() => toggleExpanded(item.title)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 h-10 px-3 py-2 text-sm font-medium',
                'hover:bg-accent hover:text-accent-foreground',
                depth > 0 && 'ml-6 w-[calc(100%-1.5rem)]'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{t(item.title)}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map((child) => renderSidebarItem(child, depth + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    const active = item.href ? isActive(item.href) : false;

    return (
      <Link
        key={item.title}
        href={item.href || '#'}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors h-10',
          'hover:bg-accent hover:text-accent-foreground',
          active
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground',
          depth > 0 && 'ml-6'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{t(item.title)}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
        <Building2 className="h-6 w-6 mr-2 text-primary" />
        <div className="flex flex-col">
          <span className="text-lg font-semibold">MyHotels</span>
          <span className="text-xs text-muted-foreground">{t('adminPanel')}</span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-4">
        <nav className="space-y-1">
          {sidebarItems.map((item) => renderSidebarItem(item))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground text-center">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}
