'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';
import { schemaEmployee, schemaEmployeeEdit } from '@/app/schema';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconLoader2,
  IconCheck,
  IconRefresh,
} from '@tabler/icons-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { USER_TYPES, USER_TYPE_NAMES } from '@/lib/userTypes';

// Types from API
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

type FilterType = 'all' | 'active' | 'inactive';

// Only Manager and Reception roles available - Owner is unique per property
const userRoles = [
  { value: USER_TYPES.MANAGER.toString(), label: 'Manager' },
  { value: USER_TYPES.RECEPTION.toString(), label: 'Reception' },
];

export default function UsersPage() {
  const t = useTranslations('UserSettings');
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // State
  const [users, setUsers] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Modal states
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Employee | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Employee | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPasswordConfirm, setFormPasswordConfirm] = useState('');

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    hasLetter: false,
    hasNumber: false,
    hasMinLength: false,
  });

  // Loading states
  const [isSaving, setIsSaving] = useState(false);

  // Fetch employees from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/employees', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        toast.error('Хэрэглэгчдийг татахад алдаа гарлаа');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Хэрэглэгчдийг татахад алдаа гарлаа');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Filter by status (approved = active)
      if (filterType === 'active' && !user.approved) return false;
      if (filterType === 'inactive' && user.approved) return false;

      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.contact_number.includes(query) ||
          user.position.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [users, filterType, searchQuery]);

  // Validate password
  const validatePassword = (password: string) => {
    setPasswordValidation({
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasMinLength: password.length >= 6,
    });
  };

  // Handle password change
  const handlePasswordChange = (value: string) => {
    setFormPassword(value);
    validatePassword(value);
  };

  // Toggle user status (approved)
  const toggleUserStatus = async (user: Employee) => {
    // Optimistic update
    setUsers(prev =>
      prev.map(u =>
        u.id === user.id ? { ...u, approved: !u.approved } : u
      )
    );

    try {
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: user.id,
          approved: !user.approved,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      toast.success('Хэрэглэгчийн төлөв өөрчлөгдлөө');
    } catch (error) {
      // Revert on error
      setUsers(prev =>
        prev.map(u =>
          u.id === user.id ? { ...u, approved: user.approved } : u
        )
      );
      toast.error('Алдаа гарлаа');
    }
  };

  // Open add/edit modal
  const openModal = (user?: Employee) => {
    if (user) {
      setEditingUser(user);
      setFormName(user.name);
      setFormPosition(user.position);
      setFormEmail(user.email);
      setFormPhone(user.contact_number);
      setFormRole(user.user_type.toString());
    } else {
      setEditingUser(null);
      resetForm();
    }
    setIsAddUserModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormName('');
    setFormPosition('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('');
    setFormPassword('');
    setFormPasswordConfirm('');
    setPasswordValidation({
      hasLetter: false,
      hasNumber: false,
      hasMinLength: false,
    });
  };

  // Handle save user
  const handleSaveUser = async () => {
    // Build form data for validation
    const formData = {
      name: formName,
      position: formPosition,
      email: formEmail,
      contact_number: formPhone,
      user_type: formRole ? parseInt(formRole) : 0,
      ...(editingUser ? {} : { password: formPassword }),
    };

    // Zod validation
    const schema = editingUser ? schemaEmployeeEdit : schemaEmployee;
    const validateResult = schema.safeParse(formData);
    if (!validateResult.success) {
      const firstError = validateResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    if (!editingUser) {
      if (!formPassword || !formPasswordConfirm) {
        toast.error('Нууц үг оруулна уу');
        return;
      }
      if (formPassword !== formPasswordConfirm) {
        toast.error('Нууц үг таарахгүй байна');
        return;
      }
      if (!passwordValidation.hasLetter || !passwordValidation.hasNumber || !passwordValidation.hasMinLength) {
        toast.error('Нууц үг шаардлага хангахгүй байна');
        return;
      }
    }

    setIsSaving(true);
    try {
      const url = '/api/employees';
      const method = editingUser ? 'PUT' : 'POST';
      
      const body: Record<string, unknown> = {
        name: formName,
        position: formPosition,
        email: formEmail,
        contact_number: formPhone,
        user_type: parseInt(formRole),
      };

      if (editingUser) {
        body.id = editingUser.id;
      } else {
        body.password = formPassword;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      toast.success(editingUser ? 'Хэрэглэгчийн мэдээлэл шинэчлэгдлээ' : 'Хэрэглэгч амжилттай нэмэгдлээ');
      setIsAddUserModalOpen(false);
      resetForm();
      fetchUsers(); // Refresh data
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Алдаа гарлаа');
    } finally {
      setIsSaving(false);
    }
  };

  // Open delete confirmation
  const openDeleteModal = (user: Employee) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/employees?id=${userToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('Хэрэглэгч устгагдлаа');
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers(); // Refresh data
    } catch (error) {
      toast.error('Устгахад алдаа гарлаа');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Уншиж байна...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchUsers}
            title="Шинэчлэх"
          >
            <IconRefresh className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => openModal()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <IconPlus className="mr-2 h-4 w-4" />
            {t('addUser')}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between">
        {/* Tab Filters */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              'text-sm font-medium pb-1 border-b-2 transition-colors',
              filterType === 'all'
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            {t('filters.all')}
          </button>
          <button
            onClick={() => setFilterType('active')}
            className={cn(
              'text-sm font-medium pb-1 border-b-2 transition-colors',
              filterType === 'active'
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            {t('filters.active')}
          </button>
          <button
            onClick={() => setFilterType('inactive')}
            className={cn(
              'text-sm font-medium pb-1 border-b-2 transition-colors',
              filterType === 'inactive'
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            {t('filters.inactive')}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Input
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pr-10"
          />
          <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-medium w-12">{t('table.number')}</TableHead>
                  <TableHead className="font-medium">{t('table.name')}</TableHead>
                  <TableHead className="font-medium">{t('table.position')}</TableHead>
                  <TableHead className="font-medium">{t('table.email')}</TableHead>
                  <TableHead className="font-medium">{t('table.phone')}</TableHead>
                  <TableHead className="font-medium">{t('table.role')}</TableHead>
                  <TableHead className="font-medium">{t('table.registeredDate')}</TableHead>
                  <TableHead className="font-medium">{t('table.status')}</TableHead>
                  <TableHead className="font-medium w-24">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user, index) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.position}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.contact_number}</TableCell>
                    <TableCell>{USER_TYPE_NAMES[user.user_type] || 'Unknown'}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString('mn-MN')}</TableCell>
                    <TableCell>
                      <Switch
                        checked={user.approved}
                        onCheckedChange={() => toggleUserStatus(user)}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openModal(user)}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => openDeleteModal(user)}
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {t('messages.noUsers')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit User Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? t('editUserModal') : t('addUserModal')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Row 1: Name & Position */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder={`${t('form.name')} *`}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder={`${t('form.position')} *`}
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: Email & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder={`${t('form.email')} *`}
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder={`${t('form.phone')} *`}
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Row 3: Role */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Select value={formRole} onValueChange={setFormRole}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.role')} />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div></div>
            </div>

            {/* Row 4: Passwords (only for new users) */}
            {!editingUser && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder={t('form.password')}
                      value={formPassword}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder={t('form.passwordConfirm')}
                      value={formPasswordConfirm}
                      onChange={(e) => setFormPasswordConfirm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-4 h-4 rounded-full border flex items-center justify-center',
                      passwordValidation.hasLetter ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                    )}>
                      {passwordValidation.hasLetter && <IconCheck className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-muted-foreground">{t('passwordRequirements.hasLetter')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-4 h-4 rounded-full border flex items-center justify-center',
                      passwordValidation.hasNumber ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                    )}>
                      {passwordValidation.hasNumber && <IconCheck className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-muted-foreground">{t('passwordRequirements.hasNumber')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-4 h-4 rounded-full border flex items-center justify-center',
                      passwordValidation.hasMinLength ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                    )}>
                      {passwordValidation.hasMinLength && <IconCheck className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-muted-foreground">{t('passwordRequirements.hasMinLength')}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={handleSaveUser}
              disabled={isSaving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSaving && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Хэрэглэгч устгах</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            &quot;{userToDelete?.name}&quot; хэрэглэгчийг устгахдаа итгэлтэй байна уу?
            Энэ үйлдлийг буцаах боломжгүй.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Цуцлах
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isSaving}>
              {isSaving && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              Устгах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
