// import { getDictionary } from "../dictionaries";
import MainLayout from "./admin_layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  // title: "Уран бүтээлч хөлслөх вэбсайт",
  // description: "",
};

type Props = {
  children: React.ReactNode;
  params: { lang: string };
};

export default async function AdminLayout({
  children,
  params: { lang },
}: Readonly<Props>) {
  // const dict = await getDictionary(lang);

  return (
    <MainLayout  >
      {children}
    </MainLayout>
  );
}
