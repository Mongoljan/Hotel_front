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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type FormFields = z.infer<typeof schemaLogin>;

export default function LoginForm() {
  const router = useRouter();
  const t = useTranslations('AuthLogin');
  const tErr = useTranslations('AuthErrors');
  const tMsg = useTranslations('AuthMessages');
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
    try { localStorage.removeItem('userInfo'); } catch {}

    const result = await login(data.email, data.password);

    if (!result.success) {
      const msg = (result as any).error
        || ((result as any).code ? tErr((result as any).code) : tErr('unknown'));
      setError(msg);
      toast.error(msg);
    } else {
      toast.success(tMsg('login_success'));
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="email" className="mb-1.5 block text-sm font-medium leading-5 text-gray-900 dark:text-gray-100">
          {t('email')}
        </Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          className="h-auto rounded-lg border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-none outline-none transition placeholder:text-gray-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          placeholder={t('email_placeholder')}
        />
        {errors.email && (
          <p id="email-error" className="mt-1.5 text-sm text-destructive">
            {typeof errors.email.message === 'string' ? tErr(errors.email.message as any) : ''}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password" className="mb-1.5 block text-sm font-medium leading-5 text-gray-900 dark:text-gray-100">
          {t('password')}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={isPasswordVisible ? 'text' : 'password'}
            {...register('password')}
            className="h-auto rounded-lg border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-900 shadow-none outline-none transition placeholder:text-gray-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            placeholder="Нууц үгээ оруулна уу"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-3 top-1/2 h-auto -translate-y-1/2 rounded-md p-0 text-gray-400 transition-colors hover:bg-transparent hover:text-gray-600 dark:hover:text-gray-300"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isPasswordVisible}
          >
            {isPasswordVisible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p id="password-error" className="mt-1.5 text-sm text-destructive">
            {typeof errors.password.message === 'string' ? tErr(errors.password.message as any) : ''}
          </p>
        )}
      </div>

      <div className="-mt-1 flex justify-end">
        <Link
          href="/auth/resetpassword"
          className="text-xs text-gray-500 transition-colors hover:text-primary dark:text-gray-400 dark:hover:text-primary"
        >
          {t('savePassword')}
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          className="h-10 w-full rounded-lg text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('wait')}
            </>
          ) : (
            t('signIn')
          )}
        </Button>

        <Button
          variant="outline"
          className="h-10 w-full rounded-lg border-primary text-sm font-medium text-primary transition hover:bg-primary/5 hover:text-primary"
          asChild
        >
          <Link href="/auth/register">
            {t('signUp')}
          </Link>
        </Button>
      </div>

      <div className="border-t border-gray-200 pt-4 text-center dark:border-gray-600">
        <Link
          href="/auth/superadmin-login"
          className="text-xs text-gray-500 transition-colors hover:text-primary dark:text-gray-400 dark:hover:text-primary"
        >
          {t('superadminLogin')}
        </Link>
      </div>
    </form>
  );
}
