import { WavyBackground } from "@/components/ui/wavy-background";
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
  
  const data: SystemInfo[] = await response.json();
  console.log(data);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 justify-center row-start-2 items-center sm:items-start">
        <div className="text-4xl font-bold text-foreground">{t('home')}</div>
        {data.map((item) => (
          <div key={item.id} className="text-center">
            <div className="text-lg text-foreground border border-border rounded-lg p-4">
              {item.system_name}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
