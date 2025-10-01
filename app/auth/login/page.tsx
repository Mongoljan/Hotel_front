'use client';

import { useTranslations } from 'next-intl';
import LoginForm from './LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function LoginPage() {
  const t = useTranslations('AuthLogin');
  const tFooter = useTranslations('Footer');
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Dashboard-style Layout */}
      <div className="flex items-center justify-center min-h-screen p-4 md:p-8">
        <div className="w-full max-w-lg space-y-6">
          {/* Brand Header - Dashboard Style */}
          {/* <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                  <Building2 className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-2xl font-bold tracking-tight">Hotel Admin</span>
                  <span className="text-sm text-muted-foreground">Management System</span>
                </div>
              </div>
            </div>
          </div> */}

          {/* Login Card - Dashboard Style */}
          <Card className="border shadow-sm">
            <CardHeader className="space-y-1 text-center pb-4">
              <CardTitle className="text-3xl font-bold tracking-tight text-cyrillic">{t('signIn')}</CardTitle>
              <CardDescription className="text-cyrillic text-muted-foreground">
                {t('subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LoginForm />
            </CardContent>
          </Card>

          {/* Footer - Dashboard Style */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {tFooter('copyright', { year })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
