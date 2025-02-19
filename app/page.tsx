import Topbar from "@/components/topbar";
import { getTranslations } from "next-intl/server";

interface SystemInfo {
  id: number;
  system_id: string;
  system_name: string;
  description: string;
}

export default async function Home() {
  
  const t = await getTranslations('HomePage');
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/system-info/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  const data: SystemInfo[] = await response.json();  // Note that data is now typed as an array of SystemInfo objects
  console.log(data);
  

  return (
    <>
      <Topbar />
      <div className="grid grid-rows-[20px_1fr_20px] bg-[#E5F0FD] text-black items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 justify-center row-start-2 items-center sm:items-start">
          <div className="text-[40px]">{t('home')}</div>

          {/* Display the data by mapping over the array */}
          {data.map((item) => (
            <div className="" key={item.id}>
              <div className="text-center flex justify-center border-black "> {item.system_name}</div>
            </div>
          ))}

        </main>
      </div>
    </>
  );
}
