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
  Hammer,
  Code
} from "lucide-react";

interface UnderDevelopmentProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export default function UnderDevelopment({
  title = "Энэ хуудас хөгжүүлэлтийн шатандаа байна",
  description = "Бид одоогоор энэ онцлогийг хөгжүүлж байна. Удахгүй хэрэглэх боломжтой болно.",
  showBackButton = true,
  showHomeButton = true,
}: UnderDevelopmentProps) {
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-xl border-border/50">
        <CardContent className="p-8 md:p-12">
          {/* Icon Section */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse" />
              <div className="relative bg-amber-500/10 p-6 rounded-full border-4 border-amber-500/20">
                <Construction className="h-16 w-16 text-amber-600 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {title}
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
              {description}
            </p>
          </div>

          {/* Features Coming Soon */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/30 border border-border/50">
              <Hammer className="h-8 w-8 text-amber-600 mb-2" />
              <span className="text-sm font-medium text-center">Шинэ онцлог</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/30 border border-border/50">
              <Code className="h-8 w-8 text-amber-600 mb-2" />
              <span className="text-sm font-medium text-center">Сайжруулалт</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-lg bg-muted/30 border border-border/50">
              <Wrench className="h-8 w-8 text-amber-600 mb-2 animate-pulse" />
              <span className="text-sm font-medium text-center">Тестлэгдэж байна</span>
            </div>
          </div>

          {/* Action Buttons */}
          {(showBackButton || showHomeButton) && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {showBackButton && (
                <Button 
                  onClick={() => router.back()} 
                  variant="outline"
                  className="group"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Буцах
                </Button>
              )}
              {showHomeButton && (
                <Button asChild className="group">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    Нүүр хуудас
                  </Link>
                </Button>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-center text-sm text-muted-foreground">
              Энэ онцлог хэрэгжих хугацаа:{" "}
              <span className="font-semibold text-foreground">Удахгүй</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
