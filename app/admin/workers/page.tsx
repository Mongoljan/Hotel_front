"use client";

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { USER_TYPES, USER_TYPE_NAMES, UserTypeValue } from '@/lib/userTypes';
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
} from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Users as UsersIcon, Loader2, RefreshCw, Trash2, Edit } from "lucide-react";
import { cn } from '@/lib/utils';

// Employee type from API
interface Employee {
  id: number;
  hotel: number;
  name: string;
  position: string;
  contact_number: string;
  email: string;
  user_type: number;
  approved: boolean;
  created_at: string;
}

export default function WorkersPage() {
  const t = useTranslations('Workers');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form state
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<{
    name: string;
    position: string;
    contact_number: string;
    email: string;
    password: string;
    user_type: UserTypeValue;
  }>({
    name: '',
    position: '',
    contact_number: '',
    email: '',
    password: '',
    user_type: USER_TYPES.MANAGER,
  });

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/employees', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setEmployees(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch employees');
        toast.error('Ажилчдыг татахад алдаа гарлаа');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Ажилчдыг татахад алдаа гарлаа');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      contact_number: '',
      email: '',
      password: '',
      user_type: USER_TYPES.MANAGER,
    });
    setError('');
    setIsEditMode(false);
    setSelectedEmployee(null);
  };

  // Open add modal
  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditMode(true);
    setFormData({
      name: employee.name,
      position: employee.position,
      contact_number: employee.contact_number,
      email: employee.email,
      password: '',
      user_type: employee.user_type as UserTypeValue,
    });
    setIsModalOpen(true);
  };

  // Open delete confirmation
  const openDeleteModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const url = '/api/employees';
      const method = isEditMode ? 'PUT' : 'POST';
      const body = isEditMode 
        ? { id: selectedEmployee?.id, ...formData }
        : formData;

      // Don't send empty password on edit
      if (isEditMode && !body.password) {
        delete (body as Record<string, unknown>).password;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save employee');
      }

      toast.success(isEditMode ? 'Ажилтан амжилттай шинэчлэгдлээ' : t('workerCreated'));
      setIsModalOpen(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Алдаа гарлаа';
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedEmployee) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/employees?id=${selectedEmployee.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to delete employee');
      }

      toast.success('Ажилтан амжилттай устгагдлаа');
      setIsDeleteModalOpen(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (err) {
      toast.error('Устгахад алдаа гарлаа');
    } finally {
      setIsSaving(false);
    }
  };

  // Get user type badge color
  const getUserTypeBadge = (userType: number) => {
    const name = USER_TYPE_NAMES[userType] || 'Unknown';
    const variants: Record<number, string> = {
      2: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', // Owner
      3: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', // Manager
      4: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', // Reception
      5: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', // User
    };
    return (
      <Badge className={cn('font-medium', variants[userType] || 'bg-muted')}>
        {name}
      </Badge>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Уншиж байна...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UsersIcon className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">{t('title')}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Нийт {employees.length} ажилтан
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchEmployees} title="Шинэчлэх">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={openAddModal} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t('addWorker')}
          </Button>
        </div>
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ажилчдын жагсаалт</CardTitle>
          <CardDescription>Менежер, Reception болон бусад ажилчид</CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Ажилтан бүртгэгдээгүй байна
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-medium">Нэр</TableHead>
                    <TableHead className="font-medium">Албан тушаал</TableHead>
                    <TableHead className="font-medium">Имэйл</TableHead>
                    <TableHead className="font-medium">Утас</TableHead>
                    <TableHead className="font-medium">Төрөл</TableHead>
                    <TableHead className="font-medium">Төлөв</TableHead>
                    <TableHead className="font-medium">Бүртгэсэн огноо</TableHead>
                    <TableHead className="font-medium w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.contact_number}</TableCell>
                      <TableCell>{getUserTypeBadge(employee.user_type)}</TableCell>
                      <TableCell>
                        <Badge variant={employee.approved ? 'default' : 'secondary'}>
                          {employee.approved ? 'Баталгаажсан' : 'Хүлээгдэж буй'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(employee.created_at).toLocaleDateString('mn-MN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditModal(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => openDeleteModal(employee)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsModalOpen(open); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Ажилтан засах' : t('createNewWorker')}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Ажилтны мэдээллийг шинэчлэх' : 'Менежер эсвэл Reception ажилтан бүртгэх'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')} <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('namePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">{t('position')} <span className="text-destructive">*</span></Label>
              <Input
                id="position"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder={t('positionPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_number">{t('contactNumber')} <span className="text-destructive">*</span></Label>
              <Input
                id="contact_number"
                required
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                placeholder={t('contactPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')} <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('emailPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Нууц үг {!isEditMode && <span className="text-destructive">*</span>}
                {isEditMode && <span className="text-muted-foreground text-xs ml-1">(хоосон үлдээвэл хэвээр)</span>}
              </Label>
              <Input
                id="password"
                type="password"
                required={!isEditMode}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="******"
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user_type">{t('userType')} <span className="text-destructive">*</span></Label>
              <Select
                value={formData.user_type.toString()}
                onValueChange={(value) => setFormData({ ...formData, user_type: parseInt(value) as UserTypeValue })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={USER_TYPES.OWNER.toString()}>Owner</SelectItem>
                  <SelectItem value={USER_TYPES.MANAGER.toString()}>Manager</SelectItem>
                  <SelectItem value={USER_TYPES.RECEPTION.toString()}>Reception</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Хадгалах' : t('create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Ажилтан устгах</DialogTitle>
            <DialogDescription>
              &quot;{selectedEmployee?.name}&quot; ажилтныг устгахдаа итгэлтэй байна уу?
              Энэ үйлдлийг буцаах боломжгүй.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Цуцлах
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Устгах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
