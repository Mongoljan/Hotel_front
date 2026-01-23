'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  IconBuilding,
  IconLoader2,
  IconSearch,
  IconMail,
  IconPhone,
  IconCalendar,
  IconRefresh,
  IconMapPin,
  IconCheck,
  IconX,
} from '@tabler/icons-react';

interface Property {
  pk: number;
  register: string;
  CompanyName: string;
  PropertyName: string;
  location: string;
  property_type: number;
  phone: string;
  mail: string;
  is_approved: boolean;
  created_at: string;
}

export default function HotelsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('all');

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/superadmin/properties', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Зочид буудал ачаалахад алдаа гарлаа');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPropertyTypeName = (type: number) => {
    const types: Record<number, string> = {
      1: 'Зочид буудал',
      2: 'Амралтын газар',
      3: 'Зуслангийн газар',
    };
    return types[type] || 'Тодорхойгүй';
  };

  // Filter properties based on search and tab
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.PropertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.CompanyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.mail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.register.includes(searchQuery);

    if (activeTab === 'pending') return matchesSearch && !property.is_approved;
    if (activeTab === 'approved') return matchesSearch && property.is_approved;
    return matchesSearch;
  });

  const pendingCount = properties.filter((p) => !p.is_approved).length;
  const approvedCount = properties.filter((p) => p.is_approved).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Зочид буудлууд</h1>
          <p className="text-muted-foreground">
            Бүртгэгдсэн зочид буудлуудын жагсаалт болон мэдээлэл
          </p>
        </div>
        <Button onClick={fetchProperties} variant="outline" disabled={isLoading}>
          <IconRefresh className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Шинэчлэх
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нийт буудал</CardTitle>
            <IconBuilding className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Хүлээгдэж буй</CardTitle>
            <IconX className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Зөвшөөрөгдсөн</CardTitle>
            <IconCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{approvedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Зочид буудлын жагсаалт</CardTitle>
              <CardDescription>
                Бүртгэгдсэн зочид буудлуудын дэлгэрэнгүй мэдээлэл
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Бүгд</TabsTrigger>
              <TabsTrigger value="pending" className="gap-2">
                Хүлээгдэж буй
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Зөвшөөрөгдсөн</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <IconBuilding className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-lg font-medium">Зочид буудал олдсонгүй</p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? 'Хайлтын үр дүн олдсонгүй'
                      : 'Зочид буудал бүртгэгдээгүй байна'}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Зочид буудал</TableHead>
                        <TableHead>Компани</TableHead>
                        <TableHead>Байршил</TableHead>
                        <TableHead>Холбоо барих</TableHead>
                        <TableHead>Төрөл</TableHead>
                        <TableHead>Бүртгэгдсэн</TableHead>
                        <TableHead>Төлөв</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProperties.map((property) => (
                        <TableRow key={property.pk}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <IconBuilding className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{property.PropertyName}</p>
                                <p className="text-sm text-muted-foreground">
                                  ID: {property.pk}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{property.CompanyName}</p>
                              <p className="text-sm text-muted-foreground">
                                РД: {property.register}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <IconMapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{property.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <IconMail className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{property.mail}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <IconPhone className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{property.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getPropertyTypeName(property.property_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <IconCalendar className="h-3.5 w-3.5" />
                              <span>{formatDate(property.created_at)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {property.is_approved ? (
                              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                <IconCheck className="mr-1 h-3 w-3" />
                                Зөвшөөрөгдсөн
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                <IconX className="mr-1 h-3 w-3" />
                                Хүлээгдэж буй
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
