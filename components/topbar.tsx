import Link from "next/link"
import LanguageSwitcher from "./LanguageSwitcher"
import { getTranslations } from "next-intl/server";



export default async function Topbar() {
  const t = await getTranslations('Topbar');
  
    return(

        <>
        <div className="h-[50px] border-b-[1px]  bg-white px-[50px] text-black ">

        <div className="flex gap-4 items-center justify-end h-full ">
          <Link
            className="rounded-sm border border-solid text-xs  border-blue-500 transition-colors flex items-center justify-center hover:bg-blue-500  hover:border-transparent  sm:text-base h-8 sm:h-10 px-2 sm:px-2 sm:min-w-36 text-blue-500 hover:text-white"
            href={"/auth/login"}
          >
           {t("signIn")}
          </Link>

          <Link
            className="rounded-sm border border-solid  border-blue-500 transition-colors flex items-center justify-center hover:bg-blue-500  hover:border-transparent text-xs sm:text-base h-8 sm:h-10 px-2 sm:px-2 sm:min-w-36 text-blue-500 hover:text-white"
            href={"/auth/register"}
          >
            {t("signUp")}
          </Link>
          <LanguageSwitcher/>
        </div>

        </div>
        </>
    )


 }