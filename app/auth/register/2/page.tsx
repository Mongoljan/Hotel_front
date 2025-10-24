'use client';

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft, ArrowRight, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PatternFormat } from 'react-number-format';
import { schemaRegistrationEmployee2 } from '@/app/schema';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';
import { registerHotelAndEmployeeAction } from '../registerHotelAndEmployeeAction';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type FormFields = z.infer<typeof schemaRegistrationEmployee2>;

export default function RegisterEmployee() {
  const t = useTranslations('RegisterStaff');
  const tErr = useTranslations('AuthErrors');
  const tMsg = useTranslations('AuthMessages');
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const saved = typeof window !== 'undefined' ? localStorage.getItem('employeeFormData') : null;
  const parsedDefaults: Partial<FormFields> = saved ? JSON.parse(saved) : {};

  const form = useForm<FormFields>({
    resolver: zodResolver(schemaRegistrationEmployee2),
    defaultValues: {
      contact_person_name: '',
      position: '',
      contact_number: '',
      email: '',
      password: '',
      confirmPassword: '',
      user_type: 2,
      ...parsedDefaults,
    },
  });

  const { handleSubmit, setValue, watch } = form;

  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem('employeeFormData', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    setValue('user_type', 2);
  }, [setValue]);

  const onError = (formErrors: any) => {
    console.log('Validation errors:', formErrors);
    toast.error(tErr('form.incomplete'));
  };

  const onSubmit: SubmitHandler<FormFields> = async (employeeData) => {
    console.log('=== FORM SUBMISSION DEBUG ===');
    const hotelData = JSON.parse(localStorage.getItem('hotelFormData') || '{}');
    console.log('Hotel Data:', hotelData);
    console.log('Employee Data:', employeeData);

    if (!hotelData || !hotelData.register) {
      console.log('ERROR: Missing hotel data');
      toast.error(tErr('hotel.missing'));
      return;
    }

    // ✅ Normalize phone number
    employeeData.contact_number = `976${employeeData.contact_number.replace(/\s/g, '')}`;
    console.log('Normalized phone:', employeeData.contact_number);

    console.log('Calling registerHotelAndEmployeeAction...');
    const result = await registerHotelAndEmployeeAction(hotelData, employeeData);
    console.log('Registration result:', result);

    if (result.success) {
      toast.success(tMsg('register_success_redirect'));

      setTimeout(() => {
        Object.keys(Cookies.get()).forEach((cookieName) => Cookies.remove(cookieName));
        localStorage.removeItem('hotelFormData');
        localStorage.removeItem('employeeFormData');
        router.push('/auth/login');
      }, 1500);
    } else {
      toast.error(result.error || tErr('register.failed'));
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">

      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <UserPlus className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{t('staff_info')}</CardTitle>
          <CardDescription>
            Employee registration information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
              <FormField
                control={form.control}
                name="contact_person_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('name')}</FormLabel>
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
                    <FormLabel>{t('title')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('phone_number')}</FormLabel>
                    <FormControl>
                      <PatternFormat
                        format="#### ####"
                        allowEmptyFormatting
                        mask="_"
                        value={field.value || ''}
                        onValueChange={({ value }) => field.onChange(value)}
                        customInput={Input}
                        placeholder="9512 9418"
                      />
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
                    <FormLabel>{t('email')}</FormLabel>
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
                    <FormLabel>{t('password')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={isPasswordVisible ? 'text' : 'password'}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        >
                          {isPasswordVisible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
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
                    <FormLabel>{t('password_again')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={isConfirmPasswordVisible ? 'text' : 'password'}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                        >
                          {isConfirmPasswordVisible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
  );
}
