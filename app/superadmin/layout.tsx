
import MainLayout from "./admin_layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  // title: "Уран бүтээлч хөлслөх вэбсайт",
  // description: "",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{}>;
};

export default async function AdminLayout({
  children,
}: Readonly<Props>) {


  return (
    <MainLayout >
      {children}
    </MainLayout>
  );
}
