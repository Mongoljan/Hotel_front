import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, getLocale } from "next-intl/server";
import { Commissioner } from "next/font/google";
import "./globals.css";
import Topbar from "@/components/topbar";
import { ReactNode } from "react";
import AuthProvider from "@/context/AuthProvider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

// ✅ use this instead

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
    <html lang={locale} suppressHydrationWarning>
      <body className={`${commissioner.variable} antialiased font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <div className="min-h-screen bg-background text-foreground">
                <Topbar />
                <main className="relative">{children}</main>
                <Toaster />
              </div>
            </NextIntlClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
