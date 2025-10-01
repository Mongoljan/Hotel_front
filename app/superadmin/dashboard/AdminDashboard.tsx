'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  IconShield,
  IconUsers,
  IconBuilding,
  IconCheck,
  IconClock,
  IconSettings
} from "@tabler/icons-react";

const VISIBLE_FIELDS = ['user_name', 'hotel_name', 'hotel_address', 'user_mail', 'user_phone', 'approved'];

type Owner = {
  owner_pk: number;
  user_name: string;
  hotel_name: string;
  hotel_address: string;
  user_mail: string;
  user_phone: string;
  approved: boolean;
};

type Props = {
  hotelName: string | undefined;
};

export default function AdminDashboardClient({ hotelName }: Props) {
  const t = useTranslations('Loading');
  const [ownerList, setOwnerList] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOwners = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/all-owners/`);
      if (!response.ok) {
        throw new Error('Failed to fetch owners');
      }
      const ownersData: Owner[] = await response.json();
      setOwnerList(ownersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching owners:', error);
      toast.error('Эзэмшигчдийн мэдээлэл ачаалж чадсангүй.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleApprove = async (owner_pk: number, currentApprovalStatus: boolean) => {
    try {
      const res = await fetch('https://dev.kacc.mn/api/approve_user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner_pk,
          approved: !currentApprovalStatus,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to approve user');
      }

      await fetchOwners();

      toast.success(
        currentApprovalStatus ? 'User disapproved successfully!' : 'User approved successfully!'
      );
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Хэрэглэгчийг зөвшөөрөх/татгалзахад алдаа гарлаа.');
    }
  };

  if (loading) {
    return <div>{t('initializing')}</div>;
  }

  // Calculate stats
  const totalOwners = ownerList.length;
  const approvedOwners = ownerList.filter(owner => owner.approved).length;
  const pendingOwners = totalOwners - approvedOwners;
  const approvalRate = totalOwners > 0 ? Math.round((approvedOwners / totalOwners) * 100) : 0;

  return (
    <div className="space-y-6 p-4">
      {/* Hero Gradient Card */}
      <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 text-slate-100 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.35),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.08),transparent_45%)]" />
        
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <Badge variant="outline" className="w-fit border-white/30 bg-white/10 text-white/90 backdrop-blur">
              <IconShield className="mr-2 h-3.5 w-3.5" /> Super Admin
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              System management, orchestrated with clarity.
            </h1>
            <p className="max-w-xl text-sm text-slate-200/80 md:text-base">
              Keep pace with user requests, understand approvals in seconds, and manage the platform with confidence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="group inline-flex items-center gap-2 rounded-full bg-white/95 px-6 py-2 text-slate-900 shadow-lg transition hover:bg-white"
              >
                <IconSettings className="h-4 w-4 transition-transform group-hover:rotate-45" />
                Системийн тохиргоо
              </Button>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/60 mb-4">
              <span>Системийн үзүүлэлт</span>
              <span className="text-2xl font-semibold text-white">{approvalRate}%</span>
            </div>
            <div className="space-y-3 text-white/90">
              <div className="flex items-center justify-between">
                <p className="text-sm">Нийт хэрэглэгч</p>
                <p className="text-sm font-semibold">{totalOwners}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">Баталгаажсан</p>
                <p className="text-sm font-semibold text-green-300">{approvedOwners}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">Хүлээгдэж байгаа</p>
                <p className="text-sm font-semibold text-yellow-300">{pendingOwners}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/40 bg-background/60 backdrop-blur transition-all hover:scale-[1.02] hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нийт хэрэглэгч</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5 text-white">
              <IconUsers className="h-full w-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOwners}</div>
            <p className="text-xs text-muted-foreground">Бүртгэгдсэн эзэмшигчид</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-background/60 backdrop-blur transition-all hover:scale-[1.02] hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Баталгаажсан</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 p-1.5 text-white">
              <IconCheck className="h-full w-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedOwners}</div>
            <p className="text-xs text-muted-foreground">Идэвхжүүлсэн зочид буудал</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-background/60 backdrop-blur transition-all hover:scale-[1.02] hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Хүлээгдэж байгаа</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 p-1.5 text-white">
              <IconClock className="h-full w-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOwners}</div>
            <p className="text-xs text-muted-foreground">Хянагдаж байгаа хүсэлт</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-background/60 backdrop-blur transition-all hover:scale-[1.02] hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Батлах хувь</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 p-1.5 text-white">
              <IconBuilding className="h-full w-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate}%</div>
            <p className="text-xs text-muted-foreground">Амжилттай батлагдсан хувь</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Data Table */}
      <Card className="border-border/40 bg-background/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-gradient-to-br from-slate-600 to-slate-800 p-0.5">
              <IconUsers className="h-full w-full text-white" />
            </div>
            Зочид буудлын эзэмшигчид
          </CardTitle>
          <CardDescription>
            Бүх хэрэглэгчдийн жагсаалт, баталгаажуулалтын статус
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={ownerList.map((owner) => ({ id: owner.owner_pk, ...owner }))}
              columns={VISIBLE_FIELDS.map((field) => ({ 
                field, 
                headerName: field.replace('_', ' ').toUpperCase(), 
                width: 180,
                renderCell: field === 'approved' ? (params) => (
                  <Badge className={params.value ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}>
                    {params.value ? 'Баталгаажсан' : 'Хүлээгдэж байна'}
                  </Badge>
                ) : undefined
              }))}
              loading={loading}
              slots={{ toolbar: GridToolbar }}
              getRowId={(row) => row.owner_pk}
              sx={{
                '& .MuiDataGrid-cell': {
                  borderColor: 'hsl(var(--border))',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'hsl(var(--muted))',
                  borderColor: 'hsl(var(--border))',
                },
                '& .MuiDataGrid-root': {
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                },
              }}
            />
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
