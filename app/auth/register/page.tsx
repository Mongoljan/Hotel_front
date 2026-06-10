'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { schemaHotelRegistration2 } from '../../schema';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';

import { PatternFormat } from 'react-number-format';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCombinedData } from '@/app/hooks/useCombinedData';
import RegistrationStepIndicator from './RegistrationStepIndicator';
import { lookupEbarimt } from '@/utils/ebarimtLookup';


interface PropertyType {
  id: number;
  name_mn: string;
  name_en: string;
}

interface OwnershipType {
  id: number;
  name_mn: string;
  name_en: string;
}

type FormFields = z.infer<typeof schemaHotelRegistration2>;

function isValidRegNo(val: string): boolean {
  const trimmed = (val || '').trim();
  if (/^\d{7}$/.test(trimmed)) return true;
  return /^[А-ЯӨҮа-яөү]{2}\d{8}$/.test(trimmed);
}

export default function RegisterPage() {
  const t = useTranslations('AuthRegister');
  const tMsg = useTranslations('AuthMessages');
  const locale = useLocale();
  const router = useRouter();
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [ownershipTypes, setOwnershipTypes] = useState<OwnershipType[]>([]);
  const [companyLookupLoading, setCompanyLookupLoading] = useState(false);
  const [companyLookupFailed, setCompanyLookupFailed] = useState(false);

  const saved = typeof window !== "undefined" ? localStorage.getItem("hotelFormData") : null;
  const parsedDefaults: Partial<FormFields> = saved ? JSON.parse(saved) : {};
  if (parsedDefaults.register != null) {
    parsedDefaults.register = String(parsedDefaults.register);
  }
  if (parsedDefaults.phone != null) {
    parsedDefaults.phone = String(parsedDefaults.phone);
    if (parsedDefaults.phone.startsWith("976")) {
      parsedDefaults.phone = parsedDefaults.phone.slice(3);
    }
  }
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaHotelRegistration2),
    mode: 'onChange',
    defaultValues: {
      register: '',
      CompanyName: '',
      PropertyName: '',
      PropertyName_en: '',
      ownership_type: undefined,
      location: '',
      property_type: '',
      phone: '',
      mail: '',
      ...parsedDefaults,
    },
  });

  const regNo = watch('register') || '';

  const { data: combinedHook } = useCombinedData();
  useEffect(() => {
    if (combinedHook?.property_types) setPropertyTypes(combinedHook.property_types);
    if (combinedHook?.ownership_type) setOwnershipTypes(combinedHook.ownership_type);
  }, [combinedHook]);

  useEffect(() => {
    if (propertyTypes.length > 0 && parsedDefaults.property_type) {
      setValue('property_type', parsedDefaults.property_type);
    }
  }, [propertyTypes, setValue]);

  useEffect(() => {
    const subscription = watch((_, { name }) => {
      if (name) {
        localStorage.setItem('hotelFormData', JSON.stringify(getValues()));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, getValues]);

  const fetchCompanyName = useCallback(async (regno: string) => {
    if (!isValidRegNo(regno)) return;

    setCompanyLookupLoading(true);
    setCompanyLookupFailed(false);
    try {
      const result = await lookupEbarimt(regno);
      if (result.found && result.name) {
        setValue('CompanyName', result.name, { shouldValidate: true });
      } else {
        setCompanyLookupFailed(true);
        setValue('CompanyName', '');
      }
    } catch {
      setCompanyLookupFailed(true);
    } finally {
      setCompanyLookupLoading(false);
    }
  }, [setValue]);

  useEffect(() => {
    if (regNo && isValidRegNo(regNo) && !getValues('CompanyName')) {
      fetchCompanyName(regNo);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit: SubmitHandler<FormFields> = (data) => {
    const phoneRaw = data.phone.replace(/\s/g, '');
    const dataToSave = { ...data, phone: phoneRaw };
    localStorage.setItem('hotelFormData', JSON.stringify(dataToSave));

    toast.success(tMsg('saved_next'));
    setTimeout(() => {
      router.push('/auth/register/2');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen p-4 md:p-8">
        <div className="w-full max-w-2xl space-y-6">
          <RegistrationStepIndicator currentStep={1} />
          <Card className="border shadow-sm">
            <CardHeader className="space-y-1 text-center pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight text-cyrillic">{t("hotel_info")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="register" className="text-cyrillic">{t("company_Reg")} <span className="text-destructive">*</span></Label>
                    <Controller
                      name="register"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="register"
                          type="text"
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);
                            setCompanyLookupFailed(false);
                            if (isValidRegNo(value)) {
                              fetchCompanyName(value);
                            } else {
                              setValue('CompanyName', '', { shouldValidate: true });
                            }
                          }}
                          onBlur={field.onBlur}
                          className={errors.register ? "border-destructive" : ""}
                        />
                      )}
                    />
                 
                    {errors.register && <p className="text-xs text-destructive">{errors.register.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-cyrillic">{t("company_name")} <span className="text-destructive">*</span></Label>
                    <Input
                      id="companyName"
                      type="text"
                      readOnly={companyLookupLoading}
                      {...register('CompanyName')}
                      className={errors.CompanyName ? "border-destructive" : ""}
                    />
                    {companyLookupLoading && (
                      <div className="text-xs text-muted-foreground">{t("company_lookup_loading")}</div>
                    )}
                    {companyLookupFailed && !companyLookupLoading && (
                      <div className="text-xs text-amber-600">{t("company_lookup_not_found")}</div>
                    )}
                   
                    {errors.CompanyName && <p className="text-xs text-destructive">{errors.CompanyName.message}</p>}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="propertyName" className="text-cyrillic">{t("hotel_name")} (монгол) <span className="text-destructive">*</span></Label>
                    <Input
                      id="propertyName"
                      type="text"
                      {...register('PropertyName')}
                      className={errors.PropertyName ? "border-destructive" : ""}
                    />
            
                    {errors.PropertyName && <p className="text-xs text-destructive">{errors.PropertyName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyNameEn" className="text-cyrillic">{t("hotel_name_en")} <span className="text-destructive">*</span></Label>
                    <Input
                      id="propertyNameEn"
                      type="text"
                      {...register('PropertyName_en')}
                      className={errors.PropertyName_en ? "border-destructive" : ""}
                    />
                 
                    {errors.PropertyName_en && <p className="text-xs text-destructive">{errors.PropertyName_en.message}</p>}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="propertyType" className="text-cyrillic">{t("hotel_type")} <span className="text-destructive">*</span></Label>
                    <select
                      id="propertyType"
                      {...register('property_type')}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.property_type ? "border-destructive" : ""}`}
                    >
                      <option value="">{t("select")}</option>
                      {propertyTypes.map((type) => (
                        <option key={type.id} value={type.id}>{locale === 'en' ? type.name_en : type.name_mn}</option>
                      ))}
                    </select>
                 
                    {errors.property_type && <p className="text-sm text-destructive">{errors.property_type.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownershipType" className="text-cyrillic">{t("ownership_type")} <span className="text-destructive">*</span></Label>
                    <select
                      id="ownershipType"
                      {...register('ownership_type')}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.ownership_type ? "border-destructive" : ""}`}
                    >
                      <option value="">{t("select")}</option>
                      {ownershipTypes.map((type) => (
                        <option key={type.id} value={type.id}>{locale === 'en' ? type.name_en : type.name_mn}</option>
                      ))}
                    </select>
              
                    {errors.ownership_type && <p className="text-xs text-destructive">{errors.ownership_type.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-cyrillic">{t("location")} <span className="text-destructive">*</span></Label>
                  <textarea
                    id="location"
                    rows={3}
                    {...register('location')}
                    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none ${errors.location ? "border-destructive" : ""}`}
                  />
                  {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-cyrillic">{t("phone_number")} <span className="text-destructive">*</span></Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">+976</span>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <PatternFormat
                          format="#### ####"
                          allowEmptyFormatting
                          mask="_"
                          value={field.value || ''}
                          onValueChange={({ value }) => {
                            field.onChange(value);
                          }}
                          onBlur={field.onBlur}
                          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.phone ? "border-destructive" : ""}`}
                          placeholder="9512 9418"
                        />
                      )}
                    />
                  </div>
                  
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-cyrillic">{t("email")} <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('mail')}
                    className={errors.mail ? "border-destructive" : ""}
                  />
                  {errors.mail && <p className="text-xs text-destructive">{errors.mail.message}</p>}
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth/login" className="flex items-center">
                      <FaArrowLeft className="mr-2 h-4 w-4" /> {t("back")}
                    </Link>
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    <div className="flex items-center">
                      {t("next")} <FaArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
