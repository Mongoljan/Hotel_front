// app/[locale]/layout.tsx (or wherever your layout is)
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, getLocale } from "next-intl/server";
// import localFont from "next/font/local";
import "./globals.css";
import Topbar from "@/components/topbar";
import { ReactNode } from "react";
import { cookies } from "next/headers"; // ✅ use next/headers for server-side cookies
import { Inter, PT_Sans } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const ptSans = PT_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-cyrillic",
  weight: ["400", "700"],
  display: "swap",
});

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();
  let messages;

  try {
    messages = await getMessages();
  } catch (error) {
    console.error(`Error loading translations for locale "${locale}":`, error);
    notFound();
  }

  // ✅ Get user-related cookies (server-side)
  const cookieStore = await cookies();
  const userName = cookieStore.get("userName")?.value;
  const userEmail = cookieStore.get("userEmail")?.value;

  const isLoggedIn = !!cookieStore.get("token"); // check if token exists

  return (
    <html lang={locale} className="h-full">
      <body className={`${inter.variable} ${ptSans.variable} antialiased font-sans h-full min-h-screen bg-background text-foreground`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
