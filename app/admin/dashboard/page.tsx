'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  IconCurrencyDollar, 
  IconClipboardList, 
  IconBed, 
  IconClock, 
  IconTrendingUp, 
  IconTrendingDown,
  IconUsers,
  IconCalendar,
  IconPlus,
  IconActivity
} from "@tabler/icons-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const data = [
  {
    name: "Jan",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Feb",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Mar",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Apr",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "May",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: "Jun",
    total: Math.floor(Math.random() * 5000) + 1000,
  },
];

const pieData = [
  { name: 'Дотоод', value: 65, color: 'hsl(var(--chart-1))' },
  { name: 'Гадаад', value: 35, color: 'hsl(var(--chart-2))' },
];

export default function DashboardPage() {
  const t = useTranslations();
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            {t('dashboard.newBooking')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('dashboard.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="analytics" disabled>
            {t('dashboard.tabs.analytics')}
          </TabsTrigger>
          <TabsTrigger value="reports" disabled>
            {t('dashboard.tabs.reports')}
          </TabsTrigger>
          <TabsTrigger value="notifications" disabled>
            {t('dashboard.tabs.notifications')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cyrillic">
                  Нийт орлого
                </CardTitle>
                <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₮45,231,890</div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.stats.revenueChange')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cyrillic">
                  Захиалгууд
                </CardTitle>
                <IconUsers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+2,350</div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.stats.bookingsChange')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cyrillic">
                  Өрөөний тоо
                </CardTitle>
                <IconClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12,234</div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.stats.roomsChange')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cyrillic">
                  Идэвхтэй
                </CardTitle>
                <IconActivity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.stats.activeChange')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle className="text-cyrillic">{t('dashboard.chart.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={data}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₮${value}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      strokeWidth={2}
                      activeDot={{
                        r: 6,
                        style: { fill: "hsl(var(--primary))", opacity: 0.25 },
                      }}
                      style={{
                        fill: "hsl(var(--primary))",
                        fillOpacity: 0.2,
                        stroke: "hsl(var(--primary))",
                      }}
                    />
                    <Tooltip 
                      formatter={(value) => [`₮${value}`, t('dashboard.chart.revenue')]}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle className="text-cyrillic">{t('dashboard.recentBookings.title')}</CardTitle>
                <CardDescription className="text-cyrillic">
                  {t('dashboard.recentBookings.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {[
                    {
                      name: "Оливия Мартин",
                      email: "olivia.martin@email.com", 
                      amount: "₮1,999,000",
                      avatar: "OM"
                    },
                    {
                      name: "Жексон Ли",
                      email: "jackson.lee@email.com",
                      amount: "₮399,000",
                      avatar: "JL"
                    },
                    {
                      name: "Изабелла Нгуен",
                      email: "isabella.nguyen@email.com",
                      amount: "₮299,000",
                      avatar: "IN"
                    },
                    {
                      name: "Уильям Ким",
                      email: "will@email.com",
                      amount: "₮99,000",
                      avatar: "WK"
                    },
                    {
                      name: "София Дэвис",
                      email: "sofia.davis@email.com",
                      amount: "₮39,000",
                      avatar: "SD"
                    },
                  ].map((customer, index) => (
                    <div key={index} className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        {customer.avatar}
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {customer.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {customer.email}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        {customer.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-cyrillic">{t('dashboard.guestDistribution.title')}</CardTitle>
                <CardDescription className="text-cyrillic">
                  {t('dashboard.guestDistribution.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-4">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm text-cyrillic">{entry.name}: {entry.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-cyrillic">{t('dashboard.roomTypes.title')}</CardTitle>
                <CardDescription className="text-cyrillic">
                  {t('dashboard.roomTypes.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { name: 'Стандарт', value: 60 },
                    { name: 'Делюкс', value: 90 },
                    { name: 'Сьют', value: 45 },
                    { name: 'Пентхаус', value: 12 },
                  ]}>
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Bar 
                      dataKey="value" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Tooltip />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-cyrillic">{t('dashboard.recentActivity.title')}</CardTitle>
                <CardDescription className="text-cyrillic">
                  {t('dashboard.recentActivity.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { time: '2 minutes ago', action: 'Шинэ захиалга' },
                  { time: '1 hour ago', action: 'Төлбөр хийгдсэн' },
                  { time: '3 hours ago', action: 'Зочин бүртгэгдсэн' },
                  { time: '1 day ago', action: 'Өрөө нэмэгдсэн' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-cyrillic">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}