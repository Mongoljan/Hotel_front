'use client';

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function TopbarAuth() {
  const tLogin = useTranslations("AuthLogin");
  const tTop = useTranslations("TopbarAuth");
  const pathname = usePathname();
  const isRegisterPage = pathname.startsWith("/auth/register");
  const authHref = isRegisterPage ? "/auth/login" : "/auth/register";
  const authLabel = isRegisterPage ? tLogin("signIn") : tLogin("signUp");

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-800/95">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
              <span className="text-base font-bold leading-none">H</span>
            </div>
            <span className="truncate text-xl font-bold leading-7 text-gray-900 dark:text-white">
              {tTop("title")}
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <Link
              className="hidden h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md sm:inline-flex"
              href={authHref}
            >
              {authLabel}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
