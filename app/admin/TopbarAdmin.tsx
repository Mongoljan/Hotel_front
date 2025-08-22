'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from 'next-intl';
import UserProfileToggle from "@/components/UserProfileToggle";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Menu, Building2, Users } from "lucide-react";

interface HotelInfo {
  CompanyName: string;
  PropertyName: string;
  is_approved: boolean;
}

export default function Topbar({
  toggleSidebar,
  sideBarOpen,
  userApproved,
  isApproved,
  hotelInfo,
  forceHideSidebar
}: {
  toggleSidebar: () => void;
  sideBarOpen: boolean;
  userApproved: boolean;
  isApproved: boolean;
  hotelInfo: HotelInfo | null;
  forceHideSidebar: boolean;
}) {
  const [groupName, setGroupName] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Topbar');
  const { logout } = useAuth();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('propertyBasicInfo') || '{}');
    if (stored.part_of_group && stored.group_name) {
      setGroupName(stored.group_name);
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left Side - Logo & Menu */}
        <div className="flex items-center space-x-4">
          {!forceHideSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-9 w-9 p-0 hover:bg-accent"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}
          
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-none text-foreground">Hotel Admin</span>
              <span className="text-xs text-muted-foreground leading-none">Management System</span>
            </div>
          </div>
        </div>

        {/* Right Side - Hotel Info & Actions */}
        <div className="flex items-center space-x-4">
          {/* Hotel Information */}
          <div className="hidden md:flex items-center space-x-4">
            {groupName && (
              <div className="flex items-center space-x-3 rounded-md bg-muted/50 px-3 py-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="text-right">
                  <p className="text-xs font-medium text-muted-foreground">Group</p>
                  <p className="text-sm font-medium text-foreground">{groupName}</p>
                </div>
              </div>
            )}
            
            {hotelInfo && (
              <>
                {groupName && <Separator orientation="vertical" className="h-8 bg-border" />}
                <div className="flex items-center space-x-3 rounded-md bg-muted/50 px-3 py-1.5">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{hotelInfo.CompanyName}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-muted-foreground">{hotelInfo.PropertyName}</p>
                      <Badge 
                        variant={hotelInfo.is_approved ? "default" : "secondary"}
                        className={`text-xs ${
                          hotelInfo.is_approved 
                            ? "bg-green-100 text-green-800 hover:bg-green-100" 
                            : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                        }`}
                      >
                        {hotelInfo.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <Separator orientation="vertical" className="h-8 bg-border" />

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            <UserProfileToggle userApproved={userApproved} />
          </div>
        </div>
      </div>
    </header>
  );
}
