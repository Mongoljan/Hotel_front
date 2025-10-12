"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Construction, 
  Home, 
  ArrowLeft, 
  Wrench,
  AlertTriangle
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-border/50">
        <CardContent className="p-8 md:p-12">
          {/* Icon Section */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <div className="relative bg-primary/10 p-6 rounded-full border-4 border-primary/20">
                <Construction className="h-16 w-16 text-primary animate-bounce" />
              </div>
            </div>
          </div>

          {/* Error Code */}
          <div className="text-center mb-6">
            <h1 className="text-8xl font-bold text-primary/80 mb-2">404</h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-lg font-medium">Хуудас олдсонгүй</span>
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-2xl font-semibold text-foreground">
              Уучлаарай, энэ хуудас хараахан хөгжүүлэгдээгүй байна
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Таны хайж буй хуудас одоогоор ажиллаж эхлээгүй эсвэл хөгжүүлэлтийн 
              шатандаа байна. Бид удахгүй үүнийг хөгжүүлэх болно.
            </p>
            
            {/* English Translation */}
            <p className="text-sm text-muted-foreground/70 max-w-md mx-auto pt-4 border-t border-border/30">
              The page you are looking for is currently under development. 
              We will be working on this feature soon.
            </p>
          </div>

          {/* Under Construction Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <Wrench className="h-4 w-4 text-amber-600 animate-pulse" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-500">
                Хөгжүүлэлтийн шатандаа / Under Development
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => router.back()} 
              variant="outline"
              className="group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Буцах
            </Button>
            <Button asChild className="group">
              <Link href="/">
                <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Нүүр хуудас руу
              </Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-center text-sm text-muted-foreground">
              Хэрэв та энэ алдааг байнга харж байвал, та{" "}
              <Link 
                href="/support" 
                className="text-primary hover:underline font-medium"
              >
                дэмжлэгтэй холбогдох
              </Link>{" "}
              боломжтой.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
