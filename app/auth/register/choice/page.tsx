import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Choose Registration Type - MyHotels",
  description: "Select your registration type",
};

export default function RegistrationChoicePage() {
  return (
    <div className="flex justify-center items-center min-h-screen py-8">
      <div className="w-full max-w-lg mx-auto">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Бүртгүүлэх
          </h1>
          <p className="text-muted-foreground">
            Буудлын удирдлагын системд нэгдэхийн тулд төрлөө сонгоно уу
          </p>
        </div>

        <div className="grid gap-4">
          {/* Hotel Registration */}
          <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer group">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Буудал бүртгэх</CardTitle>
                  <CardDescription>
                    Шинэ буудал бүртгэж системд нэгдэх
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/auth/register">
                  Буудал бүртгэх
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Employee Registration */}
          <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer group">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ажилтан нэмэх</CardTitle>
                  <CardDescription>
                    Бүртгэгдсэн буудалд шинэ ажилтан нэмэх
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/register/2">
                  Ажилтан нэмэх
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-6">
          Аль хэдийн бүртгэлтэй юу?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Нэвтрэх
          </Link>
        </div>

        {/* Features */}
        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-medium text-center text-muted-foreground">
            Системийн давуу талууд
          </h3>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span>Захиалгын удирдлага</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span>Өрөөний төлөв хянах</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span>Санхүүгийн тайлан</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span>Хэрэглэгчийн удирдлага</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 