'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface UserInfo {
  name?: string;
  email?: string;
  hotel?: number;
  position?: string;
  contact_number?: string;
  id?: number;
}

export default function UserProfileToggle({ userApproved }: { userApproved: boolean }) {
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
  <div className="relative h-9 w-9">
    <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
      <Avatar className="h-9 w-9">
        <AvatarFallback className="border-primary font-bold border-[2px] bg-white text-black text-[18px]">
          {userInfo.name?.[0] || "U"}
        </AvatarFallback>
      </Avatar>
    </Button>

    {/* Badge outside the button */}
    {!userApproved && (
      <div
        title="Хэрэглэгч баталгаажаагүй"
        className="absolute -top-[5px]  -right-[2px] bg-red text-white text-[14px] font-bold px-[6px] py-[1px] rounded-full shadow-sm leading-none z-10"
      >
        !
      </div>
    )}
  </div>
</DropdownMenuTrigger>


      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userInfo.name || "User"}</p>
            <p className="text-xs leading-none text-muted truncate">{userInfo.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="leading-none font-semibold text-sm">
              {userApproved ? (
                <span className="text-green-600">Хэрэглэгч баталгаажсан</span>
              ) : (
                <span className="text-red">! Хэрэглэгч баталгаажаагүй</span>
              )}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Албан тушаал</p>
            <p className="text-xs leading-none text-muted truncate">{userInfo.position}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuItem>
          <div className="text-muted">{userInfo.email}</div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="text-muted">{userInfo.contact_number}</div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Гарах</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
