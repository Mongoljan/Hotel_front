'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface UserInfo {
  name?: string;
  email?: string;
  hotel?: number;
  position?: string;
}

export default function UserProfileToggle() {
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (stored) {
      try {
        setUserInfo(JSON.parse(stored));
      } catch {
        console.warn("Invalid userInfo in localStorage");
      }
    }
  }, []);

  const handleLogout = () => {
    Object.keys(Cookies.get()).forEach((cookieName) => {
      Cookies.remove(cookieName);
    });
    localStorage.clear();
    router.push("/auth/login");
  };

  if (!userInfo?.email && !userInfo?.name) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/user.png" alt="User" />
            <AvatarFallback className="border-primary opaicty-[50] border-[2px] bg-white text-[16px]">{userInfo.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userInfo.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{userInfo.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
          <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{"Албан тушаал"}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{userInfo.position}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>New Team</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

