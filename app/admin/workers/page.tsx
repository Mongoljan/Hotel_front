"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createEmployeeAction } from './CreateEmployeeAction';
import { USER_TYPES } from '@/lib/userTypes';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Plus, Users as UsersIcon, Info } from "lucide-react";

export default function WorkersPage() {
  const t = useTranslations('Workers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<{
    name: string;
    position: string;
    contact_number: string;
    email: string;
    password: string;
    user_type: number;
  }>({
    name: '',
    position: '',
    contact_number: '',
    email: '',
    password: '',
    user_type: USER_TYPES.MANAGER,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await createEmployeeAction(formData);

    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      toast.success(t('workerCreated'));
      setFormData({
        name: '',
        position: '',
        contact_number: '',
        email: '',
        password: '',
        user_type: USER_TYPES.MANAGER,
      });
      setIsModalOpen(false);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UsersIcon className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">{t('title')}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{t('createNewWorker')}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t('addWorker')}
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Анхааруулга</AlertTitle>
        <AlertDescription>
          Ажилчдын жагсаалт харуулах функц backend дээр бэлдэгдэж байна. Одоогоор зөвхөн ажилчин нэмэх боломжтой.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>{t('createNewWorker')}</CardTitle>
          <CardDescription>Менежер эсвэл Reception ажилтан нэмэх</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">"{t('addWorker')}" товч дарж шинэ ажилчин нэмнэ үү.</p>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('createNewWorker')}</DialogTitle>
            <DialogDescription>Менежер эсвэл Reception ажилтан бүртгэх</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')} <span className="text-destructive">*</span></Label>
              <Input id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t('namePlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">{t('position')} <span className="text-destructive">*</span></Label>
              <Input id="position" required value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} placeholder={t('positionPlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_number">{t('contactNumber')} <span className="text-destructive">*</span></Label>
              <Input id="contact_number" required value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} placeholder={t('contactPlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')} <span className="text-destructive">*</span></Label>
              <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder={t('emailPlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Нууц үг <span className="text-destructive">*</span></Label>
              <Input id="password" type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="******" minLength={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user_type">{t('userType')} <span className="text-destructive">*</span></Label>
              <Select value={formData.user_type.toString()} onValueChange={(value) => setFormData({ ...formData, user_type: parseInt(value) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={USER_TYPES.MANAGER.toString()}>Manager</SelectItem>
                  <SelectItem value={USER_TYPES.RECEPTION.toString()}>Reception</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>{t('cancel')}</Button>
              <Button type="submit" disabled={loading}>{loading ? '...' : t('create')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
