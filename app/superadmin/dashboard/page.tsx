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
} from '@tabler/icons-react';

interface DashboardStats {
  totalOwners: number;
  pendingOwners: number;
  approvedOwners: number;
}

interface Owner {
  owner_pk: number;
  user_name: string;
  hotel_name: string;
  user_mail: string;
  approved: boolean;
  created_at: string;
}

export default function SuperAdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOwners: 0,
    pendingOwners: 0,
    approvedOwners: 0,
  });
  const [recentPending, setRecentPending] = useState<Owner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/superadmin/owners', {
        credentials: 'include',
      });

      if (response.ok) {
        const owners: Owner[] = await response.json();
        
        const pending = owners.filter((o) => !o.approved);
        const approved = owners.filter((o) => o.approved);

        setStats({
          totalOwners: owners.length,
          pendingOwners: pending.length,
          approvedOwners: approved.length,
        });

        // Get 5 most recent pending requests
        const sortedPending = pending
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        setRecentPending(sortedPending);
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
              Зөвшөөрөл хүлээж буй хүсэлтүүд
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

      {/* Recent Pending Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Сүүлийн хүсэлтүүд</CardTitle>
              <CardDescription>
                Зөвшөөрөл хүлээж буй хамгийн сүүлийн хүсэлтүүд
              </CardDescription>
            </div>
            <Link href="/superadmin/owners">
              <Button variant="outline" size="sm">
                Бүгдийг харах
                <IconArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentPending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <IconUserCheck className="h-12 w-12 text-green-500/50" />
              <p className="mt-4 text-lg font-medium">Бүх хүсэлт шийдэгдсэн!</p>
              <p className="text-sm text-muted-foreground">
                Одоогоор хүлээгдэж буй хүсэлт байхгүй байна
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPending.map((owner) => (
                <div
                  key={owner.owner_pk}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                      <IconBuilding className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">{owner.user_name}</p>
                      <p className="text-sm text-muted-foreground">{owner.hotel_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      Хүлээгдэж буй
                    </Badge>
                    <Link href="/superadmin/owners">
                      <Button size="sm">Шалгах</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        <Card className="opacity-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <IconBuilding className="h-5 w-5" />
              Зочид буудлууд
              <Badge variant="outline" className="ml-auto">Тун удахгүй</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Бүх зочид буудлын мэдээлэл
            </p>
          </CardContent>
        </Card>

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
