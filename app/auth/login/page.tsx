import { Metadata } from "next";
import LoginForm from "./LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Login - MyHotels",
  description: "Sign in to your hotel management account",
};

export default function LoginPage() {
  return (
    <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 min-h-screen">
      {/* Left side - Hero section */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            className="mr-2 h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          MyHotels
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Энэхүү систем нь манай буудлын удирдлагыг илүү хялбар, 
              үр дүнтэй болгосон. Бүх үйл ажиллагааг нэг дороос хянах 
              боломжтой болсон."
            </p>
            <footer className="text-sm">Батбаяр, Хангай буудлын захирал</footer>
          </blockquote>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="lg:p-8 p-4">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px]">
          <Card className="border shadow-xl bg-background">
            <CardHeader className="space-y-1 text-center pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Нэвтрэх
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Буудлын удирдлагын системд нэвтэрнэ үү
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <LoginForm />
              
              <div className="text-center text-sm text-muted-foreground mt-6 pt-4 border-t">
                Бүртгэл байхгүй байна уу?{" "}
                <a
                  href="/auth/register"
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Бүртгүүлэх
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
