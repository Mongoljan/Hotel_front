import MainLayout from "./admin_layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  // title: "Уран бүтээлч хөлслөх вэбсайт",
  // description: "",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function AdminLayout({
  children,
  params,
}: Readonly<Props>) {
  const { lang } = await params;


  return (
    <MainLayout >
      {children}
    </MainLayout>
  );
}
