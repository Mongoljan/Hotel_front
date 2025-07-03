'use client';

import Link from "next/link"
import LanguageSwitcher from "./LanguageSwitcher"
import { ThemeToggle } from "./theme-toggle"
import UserProfileToggle from "./UserProfileToggle"
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { SidebarToggle } from "./ui/sidebar-toggle";

export default function Topbar() {
  const t = useTranslations('Topbar');
  const { data: session, status } = useSession();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-full max-w-screen-2xl items-center px-6">
        {/* Left side - Logo and burger menu */}
        <div className="mr-4 flex items-center space-x-3">
          {session && <SidebarToggle />}
          
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">MyHotels</span>
          </Link>
        </div>

        {/* Right side navigation */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-1">
            <ThemeToggle />
            <LanguageSwitcher />
            
            {status === "loading" ? (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </div>
            ) : session ? (
              <UserProfileToggle />
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">
                    {t("signIn")}
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/register">
                    {t("signUp")}
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}