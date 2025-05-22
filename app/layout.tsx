import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, getLocale } from 'next-intl/server';
import { Commissioner } from "next/font/google";
import { cookies } from 'next/headers';
import { ReactNode } from "react";

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

  return (
    <html lang={locale}>
      <body className={`${commissioner.variable} antialiased font-sans`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
