import { WavyBackground } from "../../components/ui/wavy-background";
import "../globals.css";
import Topbar from "./TopbarAuth";
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



export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${inter.variable} ${ptSans.variable} antialiased font-sans min-h-screen`}>
      <Topbar/>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
