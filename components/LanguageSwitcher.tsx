"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";

const languages = [
  { code: "mn", name: "Монгол", flag: "🇲🇳" },
  { code: "en", name: "English", flag: "🇺🇸" },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const [locale, setLocale] = useState("mn");
  const [isChanging, setIsChanging] = useState(false);

  const switchLanguage = (lang: string) => {
    if (lang === locale) return;
    
    setIsChanging(true);
    setLocale(lang);
    document.cookie = `NEXT_LOCALE=${lang}; path=/`;
    
    setTimeout(() => {
      router.refresh();
      setIsChanging(false);
    }, 300);
  };

  const currentLanguage = languages.find(lang => lang.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <Globe className={`h-4 w-4 transition-transform ${isChanging ? 'animate-spin' : ''}`} />
          <span className="sr-only">Switch language</span>
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
