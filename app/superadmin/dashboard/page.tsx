'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  IconUser,
  IconBriefcase,
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface Owner {
  id: number;
  name: string;
  position: string;
  contact_number: string;
  email: string;
  approved: boolean;
}

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
  owner: Owner | null;
}

export default function SuperAdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'pending'>('all');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://dev.kacc.mn/api/properties/', {
        credentials: 'include',
      });

      if (response.ok) {
        const data: Property[] = await response.json();
        setProperties(data);
      } else {
        toast.error('Мэдээлэл ачаалахад алдаа гарлаа');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Сервертэй холбогдоход алдаа гарлаа');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

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
      property.register.includes(searchQuery) ||
      (property.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'approved') return matchesSearch && property.is_approved;
    if (activeTab === 'pending') return matchesSearch && !property.is_approved;
    return matchesSearch;
  });

  // Stats
  const totalProperties = properties.length;
  const approvedProperties = properties.filter((p) => p.is_approved).length;
  const pendingProperties = properties.filter((p) => !p.is_approved).length;
  const propertiesWithOwner = properties.filter((p) => p.owner !== null).length;

  if (authLoading || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Сайн байна уу, {user?.name || 'SuperAdmin'}!
          </h1>
          <p className="text-muted-foreground">
            SuperAdmin хяналтын самбар - Зочид буудлуудын мэдээлэл
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" disabled={isLoading}>
          <IconRefresh className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Шинэчлэх
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нийт буудал</CardTitle>
            <IconBuilding className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
            <p className="text-xs text-muted-foreground">Бүртгэгдсэн зочид буудлууд</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Зөвшөөрөгдсөн</CardTitle>
            <IconCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedProperties}</div>
            <p className="text-xs text-muted-foreground">Идэвхтэй зочид буудлууд</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Хүлээгдэж буй</CardTitle>
            <IconX className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingProperties}</div>
            <p className="text-xs text-muted-foreground">Зөвшөөрөл хүлээж буй</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Эзэнтэй</CardTitle>
            <IconUser className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{propertiesWithOwner}</div>
            <p className="text-xs text-muted-foreground">Эзэн холбогдсон буудлууд</p>
          </CardContent>
        </Card>
      </div>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Зочид буудлуудын жагсаалт</CardTitle>
            <div className="relative w-full md:w-80">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              <TabsTrigger value="all">
                Бүгд ({totalProperties})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Зөвшөөрөгдсөн ({approvedProperties})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Хүлээгдэж буй ({pendingProperties})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Буудлын нэр</TableHead>
                      <TableHead>Компанийн нэр</TableHead>
                      <TableHead>Эзэн</TableHead>
                      <TableHead>Байршил</TableHead>
                      <TableHead>Холбоо барих</TableHead>
                      <TableHead>Төрөл</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Огноо</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <IconBuilding className="h-8 w-8 mb-2" />
                            <p>Мэдээлэл олдсонгүй</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProperties.map((property) => (
                        <TableRow key={property.pk}>
                          <TableCell>
                            <div className="font-medium">{property.PropertyName}</div>
                            <div className="text-xs text-muted-foreground">
                              РД: {property.register}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[150px] truncate" title={property.CompanyName}>
                              {property.CompanyName}
                            </div>
                          </TableCell>
                          <TableCell>
                            {property.owner ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <IconUser className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm font-medium">{property.owner.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <IconBriefcase className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{property.owner.position}</span>
                                </div>
                                <Badge variant={property.owner.approved ? 'default' : 'secondary'} className="text-xs">
                                  {property.owner.approved ? 'Зөвшөөрөгдсөн' : 'Хүлээгдэж буй'}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-1 max-w-[200px]">
                              <IconMapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                              <span className="text-sm truncate" title={property.location}>
                                {property.location}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <IconMail className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">{property.mail}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <IconPhone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">{property.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{getPropertyTypeName(property.property_type)}</Badge>
                          </TableCell>
                          <TableCell>
                            {property.is_approved ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <IconCheck className="h-3 w-3 mr-1" />
                                Зөвшөөрөгдсөн
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                <IconX className="h-3 w-3 mr-1" />
                                Хүлээгдэж буй
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <IconCalendar className="h-3 w-3" />
                              {formatDate(property.created_at)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Нийт {filteredProperties.length} бүртгэл харуулж байна
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
