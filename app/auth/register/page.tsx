'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { schemaHotelRegistration2 } from '../../schema';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import { FaArrowAltCircleRight } from "react-icons/fa";
import { PatternFormat } from 'react-number-format';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_COMBINED_DATA = 'https://dev.kacc.mn/api/combined-data/';
const EBARIMT_API = 'https://info.ebarimt.mn/rest/merchant/info?regno=';

interface PropertyType {
  id: number;
  name_mn: string;
  name_en: string;
}

type FormFields = z.infer<typeof schemaHotelRegistration2>;

export default function RegisterPage() {
  const t = useTranslations('AuthRegister');
  const tErr = useTranslations('AuthErrors');
  const tMsg = useTranslations('AuthMessages');
  const tTips = useTranslations('Tooltips');
  const locale = useLocale();
  const router = useRouter();
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loadingCompany, setLoadingCompany] = useState(false);

  // Restore saved values
  const saved = typeof window !== "undefined" ? localStorage.getItem("hotelFormData") : null;
  const parsedDefaults: Partial<FormFields> = saved ? JSON.parse(saved) : {};
  if (parsedDefaults.phone?.startsWith("976")) {
    parsedDefaults.phone = parsedDefaults.phone.slice(3);
  }
  const [regNo, setRegNo] = useState(parsedDefaults.register || '');

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaHotelRegistration2),
    defaultValues: parsedDefaults,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_COMBINED_DATA);
        const data = await response.json();
        if (data.property_types) {
          setPropertyTypes(data.property_types);
        }
      } catch (error) {
        console.error("Error fetching combined data:", error);
      }
    };
    fetchData();
  }, []);

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

  const fetchCompanyName = async () => {
    const trimmedRegNo = regNo.trim();
    if (!trimmedRegNo) {
      toast.error(tErr('company.reg_required'));
      return;
    }

    try {
      setLoadingCompany(true);
      const response = await fetch(`${EBARIMT_API}${trimmedRegNo}`);
      const data = await response.json();
      if (data.found && data.name) {
        setValue("CompanyName", data.name);
        toast.success(tMsg('company_found', { regno: trimmedRegNo }));
      } else {
        toast.error(tErr('company.not_found', { regno: trimmedRegNo }));
      }
    } catch (error) {
      console.error("Error fetching company info:", error);
      toast.error(tErr('error.internal'));
    } finally {
      setLoadingCompany(false);
    }
  };

  const onSubmit: SubmitHandler<FormFields> = (data) => {
    const phoneRaw = data.phone.replace(/\s/g, '');
    const dataToSave = { ...data, phone: phoneRaw };
    localStorage.setItem('hotelFormData', JSON.stringify(dataToSave));

    const submitData = { ...data, phone: `976${phoneRaw}` };

    toast.success(tMsg('saved_next'));
    setTimeout(() => {
      router.push('/auth/register/2');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">

      <div className="flex items-center justify-center min-h-screen p-4 md:p-8">
        <div className="w-full max-w-2xl space-y-6">
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

          {/* Registration Card - Dashboard Style */}
          <Card className="border shadow-sm">
            <CardHeader className="space-y-1 text-center pb-6">
              <CardTitle className="text-3xl font-bold tracking-tight text-cyrillic">{t("hotel_info")}</CardTitle>
              <CardDescription className="text-cyrillic text-muted-foreground">
                Зочид буудлын үндсэн мэдээллийг оруулна уу
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="register" className="text-cyrillic">{t("company_Reg")}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="register"
                        type="text"
                        value={regNo}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRegNo(value);
                          setValue('register', value);
                        }}
                        className={errors.register ? "border-destructive" : ""}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={fetchCompanyName}
                        disabled={loadingCompany}
                      >
                        {loadingCompany ? "..." : <FaArrowAltCircleRight className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.register && <p className="text-sm text-destructive">{errors.register.message}</p>}
                  </div>

                  <div className="space-y-2 group relative">
                    <Label htmlFor="companyName" className="text-cyrillic">{t("company_name")}</Label>
                    <Input
                      id="companyName"
                      type="text"
                      {...register('CompanyName')}
                      className="bg-muted"
                      disabled
                    />
                    <div className="absolute left-0 -top-8 opacity-0 -translate-y-full group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground px-3 py-2 rounded shadow-lg pointer-events-none z-10 text-xs">
                      {tTips('ebarimt_lookup')}
                    </div>
                    {errors.CompanyName && <p className="text-sm text-destructive">{errors.CompanyName.message}</p>}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="propertyName" className="text-cyrillic">{t("hotel_name")}</Label>
                    <Input
                      id="propertyName"
                      type="text"
                      {...register('PropertyName')}
                      className={errors.PropertyName ? "border-destructive" : ""}
                    />
                    {errors.PropertyName && <p className="text-sm text-destructive">{errors.PropertyName.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="propertyType" className="text-cyrillic">{t("hotel_type")}</Label>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-cyrillic">{t("location")}</Label>
                  <textarea
                    id="location"
                    rows={3}
                    {...register('location')}
                    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none ${errors.location ? "border-destructive" : ""}`}
                  />
                  {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-cyrillic">{t("phone_number")}</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">+976</span>
                    <PatternFormat
                      format="#### ####"
                      allowEmptyFormatting
                      mask="_"
                      value={getValues('phone') || ''}
                      onValueChange={({ value }) => {
                        setValue('phone', value);
                      }}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.phone ? "border-destructive" : ""}`}
                      placeholder="9512 9418"
                    />
                  </div>
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-cyrillic">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('mail')}
                    className={errors.mail ? "border-destructive" : ""}
                  />
                  {errors.mail && <p className="text-sm text-destructive">{errors.mail.message}</p>}
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