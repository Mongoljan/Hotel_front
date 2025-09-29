"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, Globe, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { usePathname, useRouter } from "@/i18n/navigation";

const languages = [
  { code: "mn", name: "Монгол", flag: "🇲🇳" },
  { code: "en", name: "English", flag: "🇺🇸" },
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

  const currentLanguage = languages.find(lang => lang.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 gap-2 font-medium"
          aria-label={t("switch")}
        >
          <div className="flex items-center gap-1">
            <span aria-hidden="true" className="text-base leading-none">
              {currentLanguage?.flag ?? "🌐"}
            </span>
            <span className="hidden sm:inline text-xs text-muted-foreground">
              {currentLanguage?.name ?? locale.toUpperCase()}
            </span>
          </div>
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : (
            <Globe className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => switchLanguage(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{language.flag}</span>
              <span className="text-sm">{language.name}</span>
            </div>
            {locale === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
