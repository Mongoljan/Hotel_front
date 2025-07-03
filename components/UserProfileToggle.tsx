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
import { useAuth } from "@/hooks/useAuth";

export default function UserProfileToggle() {
  const { user, logout, isUserApproved } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logout('/auth/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative h-9 w-9">
          <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="border-primary font-bold border-[2px] bg-white text-black text-[18px]">
                {user.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>

          {!isUserApproved && (
            <div
              title="Хэрэглэгч баталгаажаагүй"
              className="absolute -top-[5px] -right-[2px] bg-red text-white text-[14px] font-bold px-[6px] py-[1px] rounded-full shadow-sm leading-none z-10"
            >
              !
            </div>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
            <p className="text-xs leading-none text-muted truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="leading-none font-semibold text-sm">
              {isUserApproved ? (
                <span className="text-green-600">Хэрэглэгч баталгаажсан</span>
              ) : (
                <span className="text-red">! Хэрэглэгч баталгаажаагүй</span>
              )}
            </p>
          </div>
        </DropdownMenuLabel>

        {user.position && (
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Албан тушаал</p>
              <p className="text-xs leading-none text-muted truncate">{user.position}</p>
            </div>
          </DropdownMenuLabel>
        )}

        {user.email && (
          <DropdownMenuItem>
            <div className="text-muted">{user.email}</div>
          </DropdownMenuItem>
        )}

        {user.contact_number && (
          <DropdownMenuItem>
            <div className="text-muted">{user.contact_number}</div>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Гарах
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
