'use client';

import * as React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OrgSwitcher() {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <div className="flex items-center gap-2.5 px-1 py-1">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        M
      </div>
      <span className="truncate text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
        MyRoom.mn
      </span>
      <button
        type="button"
        onClick={toggleSidebar}
        className={cn(
          'ml-auto flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-muted group-data-[collapsible=icon]:hidden'
        )}
        aria-label="Toggle sidebar"
      >
        <ChevronLeft
          className={cn('size-4 transition-transform', isCollapsed && 'rotate-180')}
        />
      </button>
    </div>
  );
}
