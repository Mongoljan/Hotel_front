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
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        {/* <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl">Hotel Admin</span>
              <span className="text-sm text-muted-foreground">Management System</span>
            </div>
          </div>
        </div> */}

        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-cyrillic">{t('signIn')}</CardTitle>
            <CardDescription className="text-cyrillic">
              {t('subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          {tFooter('copyright', { year })}
        </div>
      </div>
    </div>
  );
}
