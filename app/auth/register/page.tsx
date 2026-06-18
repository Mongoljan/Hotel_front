'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  return /^\d{7}$/.test((val || '').trim());
}

const registerInputClass =
  "h-auto rounded-lg font-medium border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-none outline-none transition placeholder:font-normal placeholder:text-gray-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500";

const registerInputErrorClass =
  "border-destructive focus-visible:ring-destructive";

export default function RegisterPage() {
  const t = useTranslations('AuthRegister');
  const tMsg = useTranslations('AuthMessages');
  const locale = useLocale();
  const router = useRouter();
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [ownershipTypes, setOwnershipTypes] = useState<OwnershipType[]>([]);
  const [companyLookupLoading, setCompanyLookupLoading] = useState(false);
  const [companyLookupSucceeded, setCompanyLookupSucceeded] = useState(false);
  const [companyLookupSlow, setCompanyLookupSlow] = useState(false);
  const lookupAbortRef = useRef<AbortController | null>(null);
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lookupSlowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setError,
    clearErrors,
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

  const { data: combinedHook } = useCombinedData();
  const propertyTypeValue = watch('property_type');
  const ownershipTypeValue = watch('ownership_type');

  useEffect(() => {
    if (combinedHook?.property_types) setPropertyTypes(combinedHook.property_types);
    if (combinedHook?.ownership_type) setOwnershipTypes(combinedHook.ownership_type);
  }, [combinedHook]);

  useEffect(() => {
    if (propertyTypes.length > 0 && parsedDefaults.property_type) {
      setValue('property_type', parsedDefaults.property_type);
    }
  }, [parsedDefaults.property_type, propertyTypes, setValue]);

  useEffect(() => {
    const subscription = watch((_, { name }) => {
      if (!name) return;
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
      saveDebounceRef.current = setTimeout(() => {
        localStorage.setItem('hotelFormData', JSON.stringify(getValues()));
      }, 350);
    });
    return () => {
      subscription.unsubscribe();
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    };
  }, [watch, getValues]);

  const applyCompanyLookupResult = useCallback((name: string) => {
    setValue('CompanyName', name, { shouldValidate: true });

    const currentPropertyName = getValues('PropertyName')?.trim();
    if (!currentPropertyName) {
      setValue('PropertyName', name, { shouldValidate: true });
    }
  }, [getValues, setValue]);

  const clearLookupSlowTimer = useCallback(() => {
    if (lookupSlowTimerRef.current) {
      clearTimeout(lookupSlowTimerRef.current);
      lookupSlowTimerRef.current = null;
    }
    setCompanyLookupSlow(false);
  }, []);

  const fetchCompanyName = useCallback(async (regno: string) => {
    if (!isValidRegNo(regno)) return;

    lookupAbortRef.current?.abort();
    const controller = new AbortController();
    lookupAbortRef.current = controller;

    setCompanyLookupLoading(true);
    setCompanyLookupSucceeded(false);
    clearErrors('register');
    clearLookupSlowTimer();
    lookupSlowTimerRef.current = setTimeout(() => setCompanyLookupSlow(true), 2000);

    try {
      const result = await lookupEbarimt(regno, { signal: controller.signal });
      if (controller.signal.aborted) return;

      if (result.found && result.name) {
        applyCompanyLookupResult(result.name);
        setCompanyLookupSucceeded(true);
      } else {
        setError('register', {
          type: 'manual',
          message: t('company_lookup_not_found'),
        });
      }
    } catch {
      if (!controller.signal.aborted) {
        setError('register', {
          type: 'manual',
          message: t('company_lookup_not_found'),
        });
      }
    } finally {
      if (!controller.signal.aborted) {
        setCompanyLookupLoading(false);
        clearLookupSlowTimer();
      }
    }
  }, [applyCompanyLookupResult, clearErrors, clearLookupSlowTimer, setError, t]);

  useEffect(() => {
    return () => {
      lookupAbortRef.current?.abort();
      clearLookupSlowTimer();
    };
  }, [clearLookupSlowTimer]);

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
    <div className="bg-background pb-12">
      <div className="flex justify-center p-4 pt-10 md:p-8 md:pt-12">
        <div className="w-full max-w-2xl space-y-6">
          <RegistrationStepIndicator currentStep={1} />
          <Card className="border shadow-sm">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight text-cyrillic">{t("hotel_info")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="register" className="text-cyrillic">{t("company_Reg")} <span className="text-destructive">*</span></Label>
                    <Controller
                      name="register"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="register"
                          type="text"
                          inputMode="numeric"
                          maxLength={7}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 7);
                            field.onChange(value);
                            setCompanyLookupSucceeded(false);
                            clearErrors('register');
                            setCompanyLookupSlow(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key !== 'Enter') return;
                            e.preventDefault();
                            const value = (e.currentTarget.value || '').trim();
                            if (isValidRegNo(value)) {
                              fetchCompanyName(value);
                            }
                          }}
                          onBlur={(e) => {
                            field.onBlur();
                            const value = e.target.value.trim();
                            if (isValidRegNo(value) && !getValues('CompanyName')?.trim()) {
                              fetchCompanyName(value);
                            }
                          }}
                          placeholder="1234567"
                          className={`${registerInputClass} ${errors.register ? registerInputErrorClass : ""}`}
                        />
                      )}
                    />

                    {errors.register && <p className="text-xs text-destructive">{errors.register.message}</p>}
                    {companyLookupLoading && (
                      <div className="text-sm text-muted-foreground">
                        {companyLookupSlow ? t("company_lookup_slow") : t("company_lookup_loading")}
                      </div>
                    )}
                    {companyLookupSucceeded && !companyLookupLoading && (
                      <div className="text-xs text-green-600">{t("company_lookup_success")}</div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="companyName" className="text-cyrillic">{t("company_name")} <span className="text-destructive">*</span></Label>
                    <Input
                      id="companyName"
                      type="text"
                      {...register('CompanyName')}
                      placeholder="ААН-н нэрийг оруулна уу"
                      className={`${registerInputClass} ${errors.CompanyName ? registerInputErrorClass : ""}`}
                    />
                    {errors.CompanyName && <p className="text-xs text-destructive">{errors.CompanyName.message}</p>}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-1.5 ">
                    <Label htmlFor="propertyName" className="text-cyrillic">{t("hotel_name")} (монгол) <span className="text-destructive">*</span></Label>
                    <Input
                      id="propertyName"
                      type="text"
                      {...register('PropertyName', {
                        onChange: (e) => {
                          e.target.value = e.target.value.replace(/[^А-Яа-яӨөҮүЁё0-9\s.,'-]/g, '');
                        },
                      })}
                      placeholder="Кирилл үсгээр оруулна уу"
                      className={`${registerInputClass} ${errors.PropertyName ? registerInputErrorClass : ""}`}
                    />

                    {errors.PropertyName && <p className="text-xs text-destructive">{errors.PropertyName.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="propertyNameEn" className="text-cyrillic">{t("hotel_name_en")} <span className="text-destructive">*</span></Label>
                    <Input
                      id="propertyNameEn"
                      type="text"
                      {...register('PropertyName_en', {
                        onChange: (e) => {
                          e.target.value = e.target.value.replace(/[^A-Za-z0-9\s.,'-]/g, '');
                        },
                      })}
                      placeholder="Латин үсгээр оруулна уу"
                      className={`${registerInputClass} ${errors.PropertyName_en ? registerInputErrorClass : ""}`}
                    />

                    {errors.PropertyName_en && <p className="text-xs text-destructive">{errors.PropertyName_en.message}</p>}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="propertyType" className="text-cyrillic">{t("hotel_type")} <span className="text-destructive">*</span></Label>
                    <select
                      id="propertyType"
                      {...register('property_type')}
                      className={`h-auto w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-none outline-none transition placeholder:text-gray-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:placeholder:text-gray-500 ${propertyTypeValue ? "text-gray-900 dark:text-gray-100" : "text-gray-400"} ${errors.property_type ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    >
                      <option value="" className="text-gray-400 dark:text-gray-500">{t("select")}</option>
                      {propertyTypes.map((type) => (
                        <option
                          key={type.id}
                          value={type.id}
                          className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                        >
                          {locale === 'en' ? type.name_en : type.name_mn}
                        </option>
                      ))}
                    </select>

                    {errors.property_type && <p className="text-xs text-destructive">{errors.property_type.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ownershipType" className="text-cyrillic">{t("ownership_type")} <span className="text-destructive">*</span></Label>
                    <select
                      id="ownershipType"
                      {...register('ownership_type')}
                      className={`h-auto w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-none outline-none transition placeholder:text-gray-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:placeholder:text-gray-500 ${ownershipTypeValue ? "text-gray-900 dark:text-gray-100" : "text-gray-400"} ${errors.ownership_type ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    >
                      <option value="" className="text-gray-400 dark:text-gray-500">{t("select")}</option>
                      {ownershipTypes.map((type) => (

                        <option
                          key={type.id}
                          value={type.id}
                          className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                        >
                          {locale === 'en' ? type.name_en : type.name_mn}
                        </option>
                      ))}
                    </select>

                    {errors.ownership_type && <p className="text-xs text-destructive">{errors.ownership_type.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-cyrillic">{t("location")} <span className="text-destructive">*</span></Label>
                  <textarea
                    id="location"
                    rows={3}
                    {...register('location', {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/[^А-Яа-яӨөҮүЁё0-9\s.,'-]/g, '');
                      },
                    })}
                    placeholder={t("location_hint")}
                    className={`h-auto w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-none outline-none transition placeholder:text-gray-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 ${errors.location ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-cyrillic">{t("phone_number")} <span className="text-destructive">*</span></Label>
                  <div
                    className={`flex items-center rounded-lg border bg-white shadow-none outline-none transition focus-within:ring-2 dark:border-gray-600 dark:bg-gray-700 ${errors.phone
                        ? 'border-destructive focus-within:ring-destructive'
                        : 'border-gray-300 focus-within:border-transparent focus-within:ring-primary'
                      }`}
                  >
                    <span className="shrink-0 pl-4 text-sm font-medium text-gray-900 dark:text-gray-100 select-none">+976</span>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <PatternFormat
                          id="phone"
                          format="#### ####"
                          allowEmptyFormatting
                          mask="_"
                          value={field.value || ''}
                          onValueChange={({ value }) => {
                            field.onChange(value);
                          }}
                          onBlur={field.onBlur}
                          className="min-w-0 flex-1 border-0 bg-transparent px-2 py-2.5 text-sm font-medium text-gray-900 shadow-none outline-none placeholder:font-normal placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 dark:bg-transparent dark:text-gray-100 dark:placeholder:text-gray-500"
                          placeholder="9512 9418"
                        />
                      )}
                    />
                  </div>

                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-cyrillic">{t("email")} <span className="text-destructive">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('mail')}
                    placeholder="name@example.com"
                    className={`${registerInputClass} ${errors.mail ? registerInputErrorClass : ""}`}
                  />
                  {errors.mail && <p className="text-xs text-destructive">{errors.mail.message}</p>}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="w-full h-10 rounded-lg" asChild>
                    <Link href="/auth/login" className="flex items-center">
                      <FaArrowLeft className="mr-2 h-4 w-4" /> {t("back")}
                    </Link>
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 rounded-lg"
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
