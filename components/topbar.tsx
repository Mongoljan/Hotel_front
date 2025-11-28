import Link from "next/link"
import LanguageSwitcher from "./LanguageSwitcher"
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

export default async function Topbar() {
  const t = await getTranslations('Topbar');
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-2 flex h-10 items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">H</span>
          </div>
          <span className="font-semibold text-lg">Hotel System</span>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">
                <LogIn className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t("signIn")}</span>
              </Link>
            </Button>
            
            <Button asChild>
              <Link href="/auth/register">
                <UserPlus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{t("signUp")}</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}