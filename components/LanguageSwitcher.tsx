"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaGlobe } from "react-icons/fa";

export default function LanguageSwitcher() {
  const router = useRouter();
  const [locale, setLocale] = useState("mn");
  const [isSpinning, setIsSpinning] = useState(false);

  const switchLanguage = (lang: string) => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 500); // Spin animation duration

    setLocale(lang);
    document.cookie = `NEXT_LOCALE=${lang}; path=/`;
    router.refresh();
  };

  return (
    <div className="relative group">
      <button
        onClick={() => switchLanguage(locale === "mn" ? "en" : "mn")}
        className="relative flex items-center justify-center w-10 h-10 rounded-full  hover:bg-bg transition"
      >
        <FaGlobe
          className={`text-xl transition-transform text-primary ${
            isSpinning ? "animate-spin" : ""
          }`}
        />
      </button>
      <span className="absolute top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 text-sm bg-black text-white rounded opacity-0 group-hover:opacity-100 transition">
        {locale.toUpperCase()}
      </span>
    </div>
  );
}
