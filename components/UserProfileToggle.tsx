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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface UserProfileToggleProps {
  userApproved: boolean;
  hotelApproved?: boolean;
}

export default function UserProfileToggle({ userApproved, hotelApproved = false }: UserProfileToggleProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (!user?.email && !user?.name) return null;

  const showWarning = !userApproved || !hotelApproved;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>

          {/* Status indicator */}
          {showWarning && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full border-2 border-background">
              <AlertCircle className="h-2 w-2 text-white" />
            </div>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div>
              <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
              <p className="text-xs leading-none text-muted-foreground mt-1">{user.email}</p>
            </div>
            
            {user.position && (
              <div>
                <p className="text-xs text-muted-foreground">Албан тушаал</p>
                <p className="text-sm">{user.position}</p>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        {/* Approval Status Section */}
        <DropdownMenuLabel className="font-normal">
          <div className="space-y-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">СТАТУС</div>
            
            {/* User Approval Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Хэрэглэгч</span>
              <div className="flex items-center space-x-1">
                {userApproved ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Баталгаажсан
                    </Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
                      Хүлээгдэж буй
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Hotel Approval Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Буудал</span>
              <div className="flex items-center space-x-1">
                {hotelApproved ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                      Баталгаажсан
                    </Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-orange-500" />
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                      Хүлээгдэж буй
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Contact Info */}
        {user.contact_number && (
          <>
            <DropdownMenuItem className="flex-col items-start">
              <div className="text-xs text-muted-foreground">Утас</div>
              <div className="text-sm">{user.contact_number}</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
          Системээс гарах
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}