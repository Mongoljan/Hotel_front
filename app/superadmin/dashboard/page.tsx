'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  IconUsers,
  IconBuilding,
  IconUserCheck,
  IconUserX,
  IconLoader2,
  IconArrowRight,
  IconRefresh,
  IconCheck,
  IconX,
  IconClipboardCheck,
} from '@tabler/icons-react';

interface DashboardStats {
  totalOwners: number;
  pendingOwners: number;
  approvedOwners: number;
  totalProperties: number;
  pendingProperties: number;
  approvedProperties: number;
}

interface Owner {
  owner_pk: number;
  user_name: string;
  hotel_name: string;
  user_mail: string;
  approved: boolean;
  created_at: string;
}

interface Property {
  pk: number;
  PropertyName: string;
  CompanyName: string;
  location: string;
  is_approved: boolean;
  created_at: string;
}

export default function SuperAdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOwners: 0,
    pendingOwners: 0,
    approvedOwners: 0,
    totalProperties: 0,
    pendingProperties: 0,
    approvedProperties: 0,
  });
  const [recentPendingOwners, setRecentPendingOwners] = useState<Owner[]>([]);
  const [recentPendingProperties, setRecentPendingProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch owners
      const ownersResponse = await fetch('/api/superadmin/owners', {
        credentials: 'include',
      });

      // Fetch properties
      const propertiesResponse = await fetch('/api/superadmin/properties', {
        credentials: 'include',
      });

      if (ownersResponse.ok && propertiesResponse.ok) {
        const owners: Owner[] = await ownersResponse.json();
        const properties: Property[] = await propertiesResponse.json();
        
        const pendingOwners = owners.filter((o) => !o.approved);
        const approvedOwners = owners.filter((o) => o.approved);

        const pendingProperties = properties.filter((p) => !p.is_approved);
        const approvedProperties = properties.filter((p) => p.is_approved);

        setStats({
          totalOwners: owners.length,
          pendingOwners: pendingOwners.length,
          approvedOwners: approvedOwners.length,
          totalProperties: properties.length,
          pendingProperties: pendingProperties.length,
          approvedProperties: approvedProperties.length,
        });

        // Get 5 most recent pending owners
        const sortedPendingOwners = pendingOwners
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        setRecentPendingOwners(sortedPendingOwners);

        // Get 5 most recent pending properties
        const sortedPendingProperties = pendingProperties
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        setRecentPendingProperties(sortedPendingProperties);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

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
            SuperAdmin хяналтын самбар - Системийн ерөнхий мэдээлэл
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" disabled={isLoading}>
          <IconRefresh className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Шинэчлэх
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="space-y-4">
        {/* Owner Stats */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Эзэдийн статистик</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Нийт эзэд</CardTitle>
                <IconUsers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOwners}</div>
                <p className="text-xs text-muted-foreground">
                  Бүртгэгдсэн зочид буудлын эзэд
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Хүлээгдэж буй</CardTitle>
                <IconUserX className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingOwners}</div>
                <p className="text-xs text-muted-foreground">
                  Зөвшөөрөл хүлээж буй эзэд
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Зөвшөөрөгдсөн</CardTitle>
                <IconUserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.approvedOwners}</div>
                <p className="text-xs text-muted-foreground">
                  Идэвхтэй зочид буудлын эзэд
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Property Stats */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Зочид буудлын статистик</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Нийт буудал</CardTitle>
                <IconBuilding className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProperties}</div>
                <p className="text-xs text-muted-foreground">
                  Бүртгэгдсэн зочид буудлууд
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Хүлээгдэж буй</CardTitle>
                <IconX className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingProperties}</div>
                <p className="text-xs text-muted-foreground">
                  Зөвшөөрөл хүлээж буй буудлууд
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Зөвшөөрөгдсөн</CardTitle>
                <IconCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.approvedProperties}</div>
                <p className="text-xs text-muted-foreground">
                  Идэвхтэй зочид буудлууд
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Recent Pending Requests */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Pending Owners */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Эзэдийн хүсэлтүүд</CardTitle>
                <CardDescription>
                  Зөвшөөрөл хүлээж буй сүүлийн эзэд
                </CardDescription>
              </div>
              <Link href="/superadmin/approvals">
                <Button variant="outline" size="sm">
                  Бүгдийг харах
                  <IconArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentPendingOwners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <IconUserCheck className="h-12 w-12 text-green-500/50" />
                <p className="mt-4 text-lg font-medium">Бүх хүсэлт шийдэгдсэн!</p>
                <p className="text-sm text-muted-foreground">
                  Одоогоор хүлээгдэж буй эзэд байхгүй
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPendingOwners.map((owner) => (
                  <div
                    key={owner.owner_pk}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                        <IconUsers className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{owner.user_name}</p>
                        <p className="text-xs text-muted-foreground">{owner.hotel_name}</p>
                      </div>
                    </div>
                    <Link href="/superadmin/approvals">
                      <Button size="sm" variant="outline">Шалгах</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Pending Properties */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Буудлын хүсэлтүүд</CardTitle>
                <CardDescription>
                  Зөвшөөрөл хүлээж буй сүүлийн буудлууд
                </CardDescription>
              </div>
              <Link href="/superadmin/approvals">
                <Button variant="outline" size="sm">
                  Бүгдийг харах
                  <IconArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentPendingProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <IconCheck className="h-12 w-12 text-green-500/50" />
                <p className="mt-4 text-lg font-medium">Бүх хүсэлт шийдэгдсэн!</p>
                <p className="text-sm text-muted-foreground">
                  Одоогоор хүлээгдэж буй буудал байхгүй
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPendingProperties.map((property) => (
                  <div
                    key={property.pk}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                        <IconBuilding className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{property.PropertyName}</p>
                        <p className="text-xs text-muted-foreground">{property.location}</p>
                      </div>
                    </div>
                    <Link href="/superadmin/approvals">
                      <Button size="sm" variant="outline">Шалгах</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/superadmin/approvals" className="block">
          <Card className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer border-orange-200 bg-orange-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IconClipboardCheck className="h-5 w-5 text-orange-600" />
                Зөвшөөрлийн удирдлага
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Эзэд болон буудлын зөвшөөрөл
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/owners" className="block">
          <Card className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IconUserCheck className="h-5 w-5 text-primary" />
                Эзэдийн удирдлага
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Эзэдийн бүртгэл, зөвшөөрөл удирдах
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/hotels" className="block">
          <Card className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IconBuilding className="h-5 w-5 text-primary" />
                Зочид буудлууд
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Бүх зочид буудлын мэдээлэл
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="opacity-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <IconUsers className="h-5 w-5" />
              Хэрэглэгчид
              <Badge variant="outline" className="ml-auto">Тун удахгүй</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Бүх хэрэглэгчдийн жагсаалт
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <IconBuilding className="h-5 w-5" />
              Тохиргоо
              <Badge variant="outline" className="ml-auto">Тун удахгүй</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Системийн тохиргоо
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
