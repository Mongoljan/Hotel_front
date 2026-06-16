'use client';

import * as React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SidebarEdgeToggle() {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className={cn(
        'absolute top-10 z-30 hidden size-7 -translate-y-0 items-center justify-center rounded-full border border-primary/25 bg-primary text-primary-foreground shadow-md transition-all hover:scale-105 hover:bg-primary/90 md:flex',
        'right-0 translate-x-1/2'
      )}
      aria-label="Toggle sidebar"
    >
      <ChevronLeft
        className={cn('size-4 transition-transform duration-200', isCollapsed && 'rotate-180')}
      />
    </button>
  );
}

export function OrgSwitcher() {
  return (
    <div className="flex items-center gap-2.5 px-1 py-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        M
      </div>
      <span className="truncate text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
        MyRoom.mn
      </span>
    </div>
  );
}
