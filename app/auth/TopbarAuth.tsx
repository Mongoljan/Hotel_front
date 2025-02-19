'use client'
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";  // Import from next/navigation
import Cookies from "js-cookie";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";
import { HiArrowRightOnRectangle } from "react-icons/hi2";  // Import js-cookie
// import LanguageToggle from "../components/languageToggle";
interface Topbar{
  sign_in:string;
  sign_out:string;
  sign_up:string;
}

interface HeaderDictionary {
  topbar: Topbar;
  title: string; // Adjust based on the actual structure of your dictionary
}

export default function Topbar() {
  const t = useTranslations("Controls");
  const pathname = usePathname();  // Get current path using usePathname
  const router = useRouter();      // Get router for navigation

  // Function to change the language in the current route
  const changeLanguage = (newLang: string) => {
    const segments = pathname.split('/').filter(Boolean);
    if (['en', 'mn'].includes(segments[0])) {
      segments[0] = newLang;  // Replace existing language
    } else {
      segments.unshift(newLang);  // Add new language at the start
    }
    router.push(`/${segments.join('/')}`);
  };

  // Logout handler

  return (
    <div className=" ">
<div
  className="  h-[50px] backdrop-blur-md font-semibold   opaicty-[50] border-b-[1px] border-primary border-opacity-30 bg-white px-[50px] text-black flex justify-between items-center"
>


        <div className="mr-2">
       {/* <LanguageToggle/> */}
       <div className=" text-black  text-[24px]">
        Буудлын админ 
       </div>
       </div>
       <div className="flex gap-6">
        <div className="flex gap-2 items-center">
        <Link
            className="text-black ml-[4px] hover:text-blue-300"
            href={"/auth/login"}
          >
            {t("login")}
          </Link>
        </div>
        <div className="flex gap-2 items-center">
        <Link
            className="text-black ml-[4px] hover:text-blue-300"
            href={"/auth/register"}
          >
                 {t("register")}
          </Link>
        </div>
        <LanguageSwitcher/>
       
      </div>
      </div>
    </div>
  );
}
