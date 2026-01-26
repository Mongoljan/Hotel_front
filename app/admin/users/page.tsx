'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconLoader2,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

// Types
interface User {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  role: string;
  registeredDate: string;
  isActive: boolean;
}

type FilterType = 'all' | 'active' | 'inactive';

// Mock data
const mockUsers: User[] = [
  {
    id: 1,
    name: 'Золзаяа',
    position: 'менежер',
    email: 'Szzoe1105@gmail.com',
    phone: '99972626',
    role: 'Manager',
    registeredDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 2,
    name: 'Батжаргал',
    position: 'Захирал',
    email: 'jagaa@myhotels.mn',
    phone: '99992626',
    role: 'Owner',
    registeredDate: '2024-04-01',
    isActive: true,
  },
  {
    id: 3,
    name: 'Дорж',
    position: 'Ресепшн',
    email: 'dorj@myhotels.mn',
    phone: '99992626',
    role: 'Reception',
    registeredDate: '2024-04-01',
    isActive: false,
  },
];

const userRoles = [
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'reception', label: 'Reception' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'accountant', label: 'Accountant' },
];

export default function UsersPage() {
  // State
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Modal states
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Filter by status
      if (filterType === 'active' && !user.isActive) return false;
      if (filterType === 'inactive' && user.isActive) return false;

      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone.includes(query) ||
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

  // Toggle user status
  const toggleUserStatus = (userId: number) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, isActive: !user.isActive } : user
      )
    );
    toast.success('Хэрэглэгчийн төлөв өөрчлөгдлөө');
  };

  // Open add/edit modal
  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormName(user.name);
      setFormPosition(user.position);
      setFormEmail(user.email);
      setFormPhone(user.phone);
      setFormRole(user.role.toLowerCase());
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
    // Validation
    if (!formName || !formPosition || !formEmail || !formPhone || !formRole) {
      toast.error('Бүх талбарыг бөглөнө үү');
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
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 500));

      if (editingUser) {
        // Update existing user
        setUsers(prev =>
          prev.map(user =>
            user.id === editingUser.id
              ? {
                  ...user,
                  name: formName,
                  position: formPosition,
                  email: formEmail,
                  phone: formPhone,
                  role: formRole.charAt(0).toUpperCase() + formRole.slice(1),
                }
              : user
          )
        );
        toast.success('Хэрэглэгчийн мэдээлэл шинэчлэгдлээ');
      } else {
        // Add new user
        const newUser: User = {
          id: users.length + 1,
          name: formName,
          position: formPosition,
          email: formEmail,
          phone: formPhone,
          role: formRole.charAt(0).toUpperCase() + formRole.slice(1),
          registeredDate: new Date().toISOString().split('T')[0],
          isActive: true,
        };
        setUsers(prev => [...prev, newUser]);
        toast.success('Хэрэглэгч амжилттай нэмэгдлээ');
      }

      setIsAddUserModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Алдаа гарлаа');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = (userId: number) => {
    if (confirm('Энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('Хэрэглэгч устгагдлаа');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Хэрэглэгчийн тохиргоо</h1>
        <Button
          onClick={() => openModal()}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <IconPlus className="mr-2 h-4 w-4" />
          Нэмэх
        </Button>
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
            Бүгд
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
            Идэвхтэй
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
            Идэвхгүй
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Хайх"
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
                  <TableHead className="font-medium w-12">№</TableHead>
                  <TableHead className="font-medium">Нэр</TableHead>
                  <TableHead className="font-medium">Албан тушаал</TableHead>
                  <TableHead className="font-medium">И-мэйл хаяг</TableHead>
                  <TableHead className="font-medium">Утасны дугаар</TableHead>
                  <TableHead className="font-medium">Хэрэглэгчийн эрх</TableHead>
                  <TableHead className="font-medium">Бүртгэсэн огноо</TableHead>
                  <TableHead className="font-medium">Төлөв</TableHead>
                  <TableHead className="font-medium w-24">Засах</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user, index) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.position}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.registeredDate}</TableCell>
                    <TableCell>
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => toggleUserStatus(user.id)}
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
                          onClick={() => handleDeleteUser(user.id)}
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
                      Хэрэглэгч олдсонгүй
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
              {editingUser ? 'Хэрэглэгч засах' : 'Системийн хэрэглэгч нэмэх'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Row 1: Name & Position */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="Нэр *"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Албан тушаал *"
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
                  placeholder="И-мэйл хаяг *"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Утасны дугаар*"
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
                    <SelectValue placeholder="Хэрэглэгчийн эрх" />
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
                      placeholder="Нууц үг үүсгэх"
                      value={formPassword}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Нууц үг давтах"
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
                    <span className="text-muted-foreground">Дор хаяж нэг үсэг орсон байх</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-4 h-4 rounded-full border flex items-center justify-center',
                      passwordValidation.hasNumber ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                    )}>
                      {passwordValidation.hasNumber && <IconCheck className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-muted-foreground">Дор хаяж нэг тоо орсон байх</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-4 h-4 rounded-full border flex items-center justify-center',
                      passwordValidation.hasMinLength ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                    )}>
                      {passwordValidation.hasMinLength && <IconCheck className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-muted-foreground">6 болон түүнээс дээш тэмдэгттэй байх</span>
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
              Хадгалах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
