'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { schemaHotelRegistration2 } from '../../schema';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Search, Building, MapPin, Phone, Mail } from 'lucide-react';
import { PatternFormat } from 'react-number-format';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  const form = useForm<FormFields>({
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
      form.setValue('property_type', parsedDefaults.property_type);
    }
  }, [propertyTypes, form]);

  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
      if (name) {
        localStorage.setItem('hotelFormData', JSON.stringify(form.getValues()));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const fetchCompanyName = async () => {
    const trimmedRegNo = regNo.trim();
    if (!trimmedRegNo) {
      toast.error("Please enter a registration number");
      return;
    }

    try {
      setLoadingCompany(true);
      const response = await fetch(`${EBARIMT_API}${trimmedRegNo}`);
      const data = await response.json();
      if (data.found && data.name) {
        form.setValue("CompanyName", data.name);
        toast.success(`РД: ${trimmedRegNo} -тай компани олдлоо!`);
      } else {
        toast.error(`РД: ${trimmedRegNo} -тай компани олдсонгүй!`);
      }
    } catch (error) {
      console.error("Error fetching company info:", error);
      toast.error("Failed to fetch company name.");
    } finally {
      setLoadingCompany(false);
    }
  };

  const onSubmit: SubmitHandler<FormFields> = (data) => {
    const phoneRaw = data.phone.replace(/\s/g, '');
    const dataToSave = { ...data, phone: phoneRaw };
    localStorage.setItem('hotelFormData', JSON.stringify(dataToSave));

    const submitData = { ...data, phone: `976${phoneRaw}` };

    toast.success('Мэдээллийг хадгаллаа. Дараагийн алхам руу шилжиж байна...');
    setTimeout(() => {
      router.push('/auth/register/2');
    }, 1000);
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-8">
      <Card className="w-full max-w-2xl mx-auto shadow-lg border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {t("hotel_info")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Зочид буудлын үндсэн мэдээллийг оруулна уу
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="register"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {t("company_Reg")}
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Компанийн РД"
                            value={regNo}
                            onChange={(e) => {
                              const value = e.target.value;
                              setRegNo(value);
                              form.setValue('register', value);
                            }}
                            className="h-11"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={fetchCompanyName}
                            disabled={loadingCompany}
                            className="h-11 w-11 shrink-0"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="CompanyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {t("company_name")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Компанийн нэр"
                            className="pl-10 h-11 bg-muted/50"
                            disabled
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="PropertyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {t("hotel_name")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Зочид буудлын нэр"
                            className="pl-10 h-11"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="property_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {t("hotel_type")}
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder={t("select")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name_mn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t("location")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          placeholder="Зочид буудлын байршил"
                          className="pl-10 min-h-[80px] resize-none"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t("phone_number")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <PatternFormat
                          format="#### ####"
                          allowEmptyFormatting
                          mask="_"
                          value={form.getValues('phone') || ''}
                          onValueChange={({ value }) => {
                            form.setValue('phone', value);
                          }}
                          className="flex h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                name="mail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t("email")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="example@domain.com"
                          className="pl-10 h-11"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  asChild
                >
                  <Link href="/auth/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("back")}
                  </Link>
                </Button>

                <Button
                  type="submit"
                  className="h-11"
                  disabled={form.formState.isSubmitting}
                >
                  {t("next")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}
