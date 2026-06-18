"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Globe, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { usePathname, useRouter } from "@/i18n/navigation";

const languages = [
  { code: "mn", name: "Mongol" },
  { code: "en", name: "English" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Language");
  const [isPending, startTransition] = useTransition();

  const switchLanguage = (lang: string) => {
    if (lang === locale) return;

    startTransition(async () => {
      document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`;
      try {
        await router.replace(pathname, { locale: lang, scroll: false });
      } finally {
        router.refresh();
      }
    });
  };

  const currentLanguage = languages.find((lang) => lang.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 gap-1.5 rounded-lg border border-gray-300 bg-white px-3 text-gray-800 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          aria-label={t("switch")}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="text-sm font-medium tracking-wide">
            {(currentLanguage?.code ?? locale).toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => switchLanguage(language.code)}
            className="flex cursor-pointer items-center justify-between"
          >
            <span className="text-sm">{language.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {language.code.toUpperCase()}
              </span>
              {locale === language.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
