import "../globals.css";
import Topbar from "./TopbarAuth";
import { Inter, PT_Sans } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";

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



export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <div className={`${inter.variable} ${ptSans.variable} min-h-screen font-sans antialiased`}>
        <Topbar/>
        <main>
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
