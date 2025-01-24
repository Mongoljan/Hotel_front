import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";  // Import from next/navigation
import Cookies from "js-cookie";
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

export default function Topbar({ toggleSidebar, sideBarOpen, }: { toggleSidebar: () => void; sideBarOpen: boolean;}) {
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
  const handleLogout = () => {
    Object.keys(Cookies.get()).forEach(cookieName => {
      Cookies.remove(cookieName);  // Remove each cookie
    });

    window.location.href = '/auth/login';  // Redirect to sign-in page (or your desired route)
  };

  return (
    <div className=" ">
<div
  className="  h-[50px] backdrop-blur-md   opaicty-[50] border-b-[1px] border-primary/30 border-opacity-30 bg-background px-[50px] text-black flex justify-between items-center"
>


        <div className="mr-2">
       {/* <LanguageToggle/> */}
       <div className=" text-black font-semibold">
        Admin 
       </div>
       </div>
       <div className="flex">
        <div className="flex gap-2 items-center">
          <button
            onClick={handleLogout}  // Attach the logout handler
            className="rounded-sm bg-white border border-solid text-xs border-primary hover:border-blue-400 transition-colors flex items-center justify-center hover:blue-100  sm:text-base h-7 sm:h-8 px-1 sm:px-1 sm:min-w-36 text-primary hover:text-blue-500"
          >
            sign out
            <HiArrowRightOnRectangle className="ml-2 text-[24px]" />
          </button>
          {/* <Link
            className="rounded-sm border border-solid border-blue-500 transition-colors flex items-center justify-center hover:bg-blue-500 hover:border-transparent text-xs sm:text-base h-7 sm:h-8 px-2 sm:px-2 sm:min-w-36 text-blue-500 hover:text-white"
            href="/auth/register"
          >
         sign up
          </Link> */}
        </div>
        <button onClick={toggleSidebar} className="flex ml-4 flex-col justify-center items-center mr-4">
          <span
            className={`bg-primary block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${sideBarOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"}`}
          ></span>
          <span
            className={`bg-primary block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${sideBarOpen ? "opacity-0" : "opacity-100"}`}
          ></span>
          <span
            className={`bg-primary block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${sideBarOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"}`}
          ></span>
        </button>
      </div>
      </div>
    </div>
  );
}
