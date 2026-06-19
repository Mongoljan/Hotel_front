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
import { registerEmployeeAction } from './RegisterEmployeeAction';
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
import { cn } from '@/lib/utils';

type FormFields = z.infer<typeof schemaRegistrationEmployee2>;

const registerInputClass =
  "h-auto rounded-lg font-medium border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-none outline-none transition placeholder:font-normal placeholder:text-gray-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500";

const registerInputErrorClass =
  "border-destructive focus-visible:ring-destructive";

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

  useEffect(() => {
    const hotelId = localStorage.getItem('registeredHotelId');
    if (!hotelId) {
      toast.error(tErr('hotel.missing'));
      router.replace('/auth/register');
    }
  }, [router, tErr]);

  const onError = (formErrors: any) => {
    toast.error(tErr('form.incomplete'));
  };

  const onSubmit: SubmitHandler<FormFields> = async (employeeData) => {
    const hotelData = JSON.parse(localStorage.getItem('hotelFormData') || '{}');
    const hotelId = localStorage.getItem('registeredHotelId');

    if (!hotelData?.register || !hotelId) {
      toast.error(tErr('hotel.missing'));
      router.replace('/auth/register');
      return;
    }

    employeeData.contact_number = `976${employeeData.contact_number.replace(/\s/g, '')}`;

    const result = await registerEmployeeAction({
      contact_person_name: employeeData.contact_person_name,
      position: employeeData.position,
      contact_number: employeeData.contact_number,
      email: employeeData.email,
      password: employeeData.password,
      user_type: employeeData.user_type,
      hotel: Number(hotelId),
    });

    if (result.success) {
      saveRegistrationHotelNames(
        Number(hotelId),
        {
          property_name_mn: hotelData.PropertyName || '',
          property_name_en: hotelData.PropertyName_en || '',
        },
        hotelData.register
      );

      toast.success(tMsg('register_success_redirect'));

      setTimeout(() => {
        Object.keys(Cookies.get()).forEach((cookieName) => Cookies.remove(cookieName));
        localStorage.removeItem('hotelFormData');
        localStorage.removeItem('employeeFormData');
        localStorage.removeItem('registeredHotelId');
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
    <div className="bg-background pb-12">
      <div className="flex justify-center p-4 pt-10 md:p-8 md:pt-12">
        <div className="w-full max-w-2xl space-y-6">
          <RegistrationStepIndicator currentStep={2} />
          <Card className="border shadow-sm">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight text-cyrillic">{t('staff_info')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="contact_person_name"
                    render={({ field, fieldState }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-cyrillic">{t('name')} <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input className={cn(registerInputClass, fieldState.error && registerInputErrorClass)} {...field} />
                        </FormControl>
                        <FormMessage className="text-xs text-destructive" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field, fieldState }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-cyrillic">{t('title')} <span className="text-destructive">*</span></FormLabel>
                        <Select
                          value={field.value ? String(field.value) : undefined}
                          onValueChange={(value) => field.onChange(Number(value))}
                        >
                          <FormControl>
                            <SelectTrigger className={cn("h-auto w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-none outline-none transition focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary dark:border-gray-600 dark:bg-gray-700", fieldState.error && registerInputErrorClass)}>
                              <SelectValue placeholder={<span className="text-gray-400 dark:text-gray-500">{t('select_position')}</span>} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {positions.map((pos) => (
                              <SelectItem key={pos.id} value={String(pos.id)} className="text-gray-900 dark:text-gray-100">
                                {pos.name_mn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs text-destructive" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_number"
                    render={({ field, fieldState }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-cyrillic">{t('phone_number')} <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div
                            className={cn(
                              'flex items-center rounded-lg border bg-white shadow-none outline-none transition focus-within:ring-2 dark:border-gray-600 dark:bg-gray-700',
                              fieldState.error
                                ? 'border-destructive focus-within:ring-destructive'
                                : 'border-gray-300 focus-within:border-transparent focus-within:ring-primary'
                            )}
                          >
                            <span className="shrink-0 pl-4 text-sm font-medium text-gray-900 dark:text-gray-100 select-none">+976</span>
                            <PatternFormat
                              format="#### ####"
                              allowEmptyFormatting
                              mask="_"
                              value={field.value || ''}
                              onValueChange={({ value }) => field.onChange(value)}
                              onBlur={field.onBlur}
                              customInput={Input}
                              className="min-w-0 flex-1 border-0 bg-transparent px-2 py-2.5 text-sm font-medium text-gray-900 shadow-none outline-none placeholder:font-normal placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 dark:bg-transparent dark:text-gray-100 dark:placeholder:text-gray-500"
                              placeholder="9512 9418"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-destructive" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-cyrillic">{t('email')} <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input type="email" className={cn(registerInputClass, fieldState.error && registerInputErrorClass)} {...field} />
                        </FormControl>
                        <FormMessage className="text-xs text-destructive" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-cyrillic">{t('password')} <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={isPasswordVisible ? 'text' : 'password'}
                              className={cn(registerInputClass, "pr-11", fieldState.error && registerInputErrorClass)}
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
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
                        <FormMessage className="text-xs text-destructive" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field, fieldState }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-cyrillic">{t('password_again')} <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={isConfirmPasswordVisible ? 'text' : 'password'}
                              className={cn(registerInputClass, "pr-11", fieldState.error && registerInputErrorClass)}
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
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
                        <FormMessage className="text-xs text-destructive" />
                      </FormItem>
                    )}
                  />

              <div className="flex flex-col gap-0.5 pt-2">
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
                  <span className="text-xs text-gray-500">{t('passwordMinCharsRule')}</span>
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
                  <span className="text-xs text-gray-500">{t('passwordComplexityRule')}</span>
                </div>
              {watchedConfirm.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                        passwordsMatch ? 'border-primary bg-primary' : 'border-gray-300'
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
                    <span className="text-xs text-gray-500">
                      {passwordsMatch ? t('passwordMatchOk') : t('passwordMismatch')}
                    </span>
                  </div>
                )}
              </div>

                  <div className="flex gap-20 pt-8">
                    <Button variant="outline" className="w-full rounded-lg h-11" asChild>
                      <Link href="/auth/register" className="flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" /> {t('back')}
                      </Link>
                    </Button>

                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="w-full rounded-lg h-11"
                    >
                      <div className="flex items-center">
                        {t('next')} <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
