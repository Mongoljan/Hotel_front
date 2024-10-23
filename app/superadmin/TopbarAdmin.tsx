import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";  // Import from next/navigation
import Cookies from "js-cookie";  // Import js-cookie
// import LanguageToggle from "../components/languageToggle";

export default function Topbar({ toggleSidebar, sideBarOpen, }: { toggleSidebar: () => void; sideBarOpen: boolean}) {
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
    Cookies.remove('jwtToken');  // Remove the JWT token cookie
    window.location.href = '/auth/login';  // Redirect to sign-in page (or your desired route)
  };

  return (
    <div>
      <div className="h-[50px] border-b-[1px] bg-white px-[50px] text-black flex justify-end items-center">
        <div className="mr-2">
       {/* <LanguageToggle/> */}
       </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={handleLogout}  // Attach the logout handler
            className="rounded-sm border border-solid text-xs border-blue-500 transition-colors flex items-center justify-center hover:bg-blue-500 hover:border-transparent sm:text-base h-7 sm:h-8 px-2 sm:px-2 sm:min-w-36 text-blue-500 hover:text-white"
          >
          sign_out
          </button>
          <Link
            className="rounded-sm border border-solid border-blue-500 transition-colors flex items-center justify-center hover:bg-blue-500 hover:border-transparent text-xs sm:text-base h-7 sm:h-8 px-2 sm:px-2 sm:min-w-36 text-blue-500 hover:text-white"
            href="/auth/register"
          >
       sign_up
          </Link>
        </div>
        <button onClick={toggleSidebar} className="flex ml-4 flex-col justify-center items-center mr-4">
          <span
            className={`bg-black block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${sideBarOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"}`}
          ></span>
          <span
            className={`bg-black block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${sideBarOpen ? "opacity-0" : "opacity-100"}`}
          ></span>
          <span
            className={`bg-black block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${sideBarOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"}`}
          ></span>
        </button>
      </div>
    </div>
  );
}
