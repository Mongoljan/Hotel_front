import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, getLocale } from 'next-intl/server';
import localFont from "next/font/local";
import "./globals.css";
import Topbar from "@/components/topbar";
import { ReactNode } from "react";
import Cookies from "js-cookie";
import { getTranslations } from "next-intl/server";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
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

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* <Topbar /> */}
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
