'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { schemaLogin } from '../../schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type FormFields = z.infer<typeof schemaLogin>;

export default function LoginForm() {
  const router = useRouter();
  const t = useTranslations('AuthLogin');
  const tErr = useTranslations('AuthErrors');
  const tMsg = useTranslations('AuthMessages');
  const tCommon = useTranslations('Common');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string>('');
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ resolver: zodResolver(schemaLogin) });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    setError('');
    // Avoid wiping all local storage; remove only auth-related residue if any
    try { localStorage.removeItem('userInfo'); } catch {}
    
    const result = await login(data.email, data.password);

    if (!result.success) {
      const msg = (result as any).code ? tErr((result as any).code) : ((result as any).error || tErr('unknown'));
      setError(msg);
      toast.error(msg);
    } else {
      toast.success(tMsg('login_success'));
      setTimeout(() => {
        router.push('/admin/hotel');
      }, 1000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-cyrillic">{t('email')}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="email"
            type="email"
            {...register('email')}
            className="pl-10"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            placeholder={t('email_placeholder')}
          />
        </div>
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {typeof errors.email.message === 'string' ? tErr(errors.email.message as any) : ''}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-cyrillic">{t('password')}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            id="password"
            type={isPasswordVisible ? 'text' : 'password'}
            {...register('password')}
            className="pl-10 pr-10"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            placeholder="••••••••"
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
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive">
            {typeof errors.password.message === 'string' ? tErr(errors.password.message as any) : ''}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <Link 
          href="/auth/resetpassword" 
          className="text-primary hover:text-primary/80 underline text-cyrillic"
        >
          {t('savePassword')}
        </Link>
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

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{tCommon('or')}</span>
        </div>
      </div>

      <Button variant="outline" className="w-full" asChild>
        <Link href="/auth/register" className="text-cyrillic">
          {t('signUp')}
        </Link>
      </Button>
    </form>
  );
}
