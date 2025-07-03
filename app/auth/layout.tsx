import { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "MyHotels - Authentication",
  description: "Login or register to access your hotel management dashboard",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
