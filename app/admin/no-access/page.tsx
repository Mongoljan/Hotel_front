'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IconLock, IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function NoAccessPage() {
  const t = useTranslations('noAccess');
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <IconLock className="w-8 h-8 text-destructive" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground">
              {t('title')}
            </h1>
            
            <p className="text-muted-foreground">
              {t('description')}
            </p>
            
            <div className="pt-4 w-full">
              <Button
                onClick={() => router.push('/admin/dashboard')}
                className="w-full"
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                {t('backToDashboard')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
