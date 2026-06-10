'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PatternFormat } from 'react-number-format';
import { schemaRegistrationEmployee2 } from '@/app/schema';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';
import { registerHotelAndEmployeeAction } from '../registerHotelAndEmployeeAction';
import { getEmployeePositions, EmployeePosition } from '@/lib/api';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RegistrationStepIndicator from '../RegistrationStepIndicator';
import { saveRegistrationHotelNames } from '@/utils/registrationHotelNames';

type FormFields = z.infer<typeof schemaRegistrationEmployee2>;

export default function RegisterEmployee() {
  const t = useTranslations('RegisterStaff');
  const tErr = useTranslations('AuthErrors');
  const tMsg = useTranslations('AuthMessages');
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [positions, setPositions] = useState<EmployeePosition[]>([]);

  const saved = typeof window !== 'undefined' ? localStorage.getItem('employeeFormData') : null;
  const parsedDefaults: Partial<FormFields> = saved ? JSON.parse(saved) : {};
  if (parsedDefaults.contact_number != null) {
    parsedDefaults.contact_number = String(parsedDefaults.contact_number);
    if (parsedDefaults.contact_number.startsWith('976')) {
      parsedDefaults.contact_number = parsedDefaults.contact_number.slice(3);
    }
  }

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaRegistrationEmployee2),
    mode: 'onChange',
    defaultValues: {
      contact_person_name: '',
      position: 10,
      contact_number: '',
      email: '',
      password: '',
      confirmPassword: '',
      user_type: 2,
      ...parsedDefaults,
    },
  });

  const { handleSubmit, setValue, watch, setError } = form;

  const watchedPassword = watch('password', '');
  const watchedConfirm = watch('confirmPassword', '');
  const hasMinLength = watchedPassword.length >= 8;
  const hasComplexity =
    /[a-zA-Z]/.test(watchedPassword) &&
    /[0-9]/.test(watchedPassword) &&
    /[@$!%*;?&#]/.test(watchedPassword);
  const passwordsMatch = watchedConfirm.length > 0 && watchedPassword === watchedConfirm;

  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem('employeeFormData', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    setValue('user_type', 2);
  }, [setValue]);

  useEffect(() => {
    getEmployeePositions()
      .then(setPositions)
      .catch(() => setPositions([]));
  }, []);

  const onError = (formErrors: any) => {
    toast.error(tErr('form.incomplete'));
  };

  const onSubmit: SubmitHandler<FormFields> = async (employeeData) => {
    const hotelData = JSON.parse(localStorage.getItem('hotelFormData') || '{}');


    if (!hotelData || !hotelData.register) {
      toast.error(tErr('hotel.missing'));
      return;
    }

    // ✅ Normalize phone number
    employeeData.contact_number = `976${employeeData.contact_number.replace(/\s/g, '')}`;
    const result = await registerHotelAndEmployeeAction(hotelData, employeeData);
    if (result.success) {
      if (result.hotelId) {
        saveRegistrationHotelNames(
          result.hotelId,
          {
            property_name_mn: hotelData.PropertyName || '',
            property_name_en: hotelData.PropertyName_en || '',
          },
          hotelData.register
        );
      }

      toast.success(tMsg('register_success_redirect'));

      setTimeout(() => {
        Object.keys(Cookies.get()).forEach((cookieName) => Cookies.remove(cookieName));
        localStorage.removeItem('hotelFormData');
        localStorage.removeItem('employeeFormData');
        router.push('/auth/login');
      }, 1500);
    } else {
      const errMsg = result.error || tErr('register.failed');
      const errLower = errMsg.toLowerCase();
      if (
        errLower.includes('email') ||
        errLower.includes('already') ||
        errMsg.includes('бүртгэлтэй')
      ) {
        setError('email', { message: t('email_already_registered') });
      }
      toast.error(errMsg);
    }
  };

  return (
    <div className="flex justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl ">
      <RegistrationStepIndicator currentStep={2} />
      <Card className="w-full">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-cyrillic">{t('staff_info')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
              <FormField
                control={form.control}
                name="contact_person_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('name')} <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('title')} <span className="text-destructive">*</span></FormLabel>
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('select_position')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem key={pos.id} value={String(pos.id)}>
                            {pos.name_mn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('phone_number')} <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">+976</span>
                        <PatternFormat
                          format="#### ####"
                          allowEmptyFormatting
                          mask="_"
                          value={field.value || ''}
                          onValueChange={({ value }) => field.onChange(value)}
                          onBlur={field.onBlur}
                          customInput={Input}
                          placeholder="9512 9418"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')} <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('password')} <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={isPasswordVisible ? 'text' : 'password'}
                          className="pr-11"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                          tabIndex={-1}
                          aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                        >
                          {isPasswordVisible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('password_again')} <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={isConfirmPasswordVisible ? 'text' : 'password'}
                          className="pr-11"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                          onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                          tabIndex={-1}
                          aria-label={isConfirmPasswordVisible ? 'Hide password' : 'Show password'}
                        >
                          {isConfirmPasswordVisible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                      hasMinLength ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}
                  >
                    {hasMinLength && (
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{t('passwordMinCharsRule')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                      hasComplexity ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}
                  >
                    {hasComplexity && (
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{t('passwordComplexityRule')}</span>
                </div>
                {watchedConfirm.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                        passwordsMatch ? 'border-primary bg-primary' : 'border-red-400 bg-red-400'
                      }`}
                    >
                      {passwordsMatch ? (
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${passwordsMatch ? 'text-gray-500' : 'text-red-500'}`}>
                      {passwordsMatch ? t('passwordMatchOk') : t('passwordMismatch')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="flex-1"
                >
                  <Link href="/auth/register">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('back')}
                  </Link>
                </Button>

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex-1"
                >
                  {t('next')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
