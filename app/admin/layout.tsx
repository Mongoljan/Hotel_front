// app/[lang]/(admin)/layout.tsx
import { cookies } from "next/headers";
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
  const cookieStore = cookies();
  const userApproved = cookieStore.get("user_approved")?.value === "true";

  return (
    <MainLayout userApproved={userApproved}>
      {children}
    </MainLayout>
  );
}
