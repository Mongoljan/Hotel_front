// app/[locale]/layout.tsx (or wherever your layout is)
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, getLocale } from 'next-intl/server';
// import localFont from "next/font/local";
import "./globals.css";
import Topbar from "@/components/topbar";
import { ReactNode } from "react";
import { cookies } from 'next/headers'; // ✅ use next/headers for server-side cookies
import { Commissioner } from "next/font/google";


const commissioner = Commissioner({
  subsets: ["latin"],
  variable: "--font-commissioner",
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
  const cookieStore = cookies();
  const userName = cookieStore.get('userName')?.value;
  const userEmail = cookieStore.get('userEmail')?.value;

  const isLoggedIn = !!cookieStore.get('token'); // check if token exists

  return (
    <html lang={locale}>
<body className={`${commissioner.variable} antialiased font-sans`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* <Topbar   /> */}
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
