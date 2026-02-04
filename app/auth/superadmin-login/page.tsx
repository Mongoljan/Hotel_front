'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, User, Lock, AlertCircle, Shield } from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const t = useTranslations('SuperAdminLogin');
  const tErr = useTranslations('AuthErrors');
  const tFooter = useTranslations('Footer');
  const year = new Date().getFullYear();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/superadmin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('loginFailed'));
        toast.error(data.error || t('loginFailed'));
        return;
      }

      toast.success(data.message || t('loginSuccess'));
      
      // Redirect to superadmin dashboard
      setTimeout(() => {
        router.push('/superadmin/dashboard');
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      setError(t('networkError'));
      toast.error(t('networkError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen p-4 md:p-8">
        <div className="w-full max-w-lg space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                  <Shield className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-2xl font-bold tracking-tight">{t('title')}</span>
                  <span className="text-sm text-muted-foreground">{t('subtitle')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <Card className="border shadow-sm">
            <CardHeader className="space-y-1 text-center pb-4">
              <CardTitle className="text-3xl font-bold tracking-tight text-cyrillic">
                {t('signIn')}
              </CardTitle>
              <CardDescription className="text-cyrillic text-muted-foreground">
                {t('description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-cyrillic">{t('username')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      autoComplete="username"
                      placeholder={t('usernamePlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-cyrillic">{t('password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      type={isPasswordVisible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                      aria-pressed={isPasswordVisible}
                    >
                      {isPasswordVisible ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('wait')}
                    </>
                  ) : (
                    t('signIn')
                  )}
                </Button>

                <div className="text-center">
                  <Link 
                    href="/auth/login" 
                    className="text-sm text-primary hover:text-primary/80 underline"
                  >
                    {t('backToHotelLogin')}
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
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
