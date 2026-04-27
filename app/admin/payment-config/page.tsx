'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  Banknote,
  Gift,
  Settings,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import {
  PaymentConfig,
  PaymentConfigRequest,
  PaymentType,
  Bank,
  PaymentSolutionType
} from '@/types/payment';
import { BankCardPOSConfigPanel } from '@/components/payment/BankCardPOSConfigPanel';
import { BankAccountConfigPanel } from '@/components/payment/BankAccountConfigPanel';
import { useAuth } from '@/hooks/useAuth';

// Payment section configuration matching Figma design exactly
const paymentSectionConfig = {
  bank_account: {
    id: 1,
    title: 'Данс',
    description: 'Дансны хуулгаар гар аргаар төлбөр баталгаажуулах суваг.',
    icon: Building2,
    buttonText: 'Данс нэмэх'
  },
  bank_card: {
    id: 2,
    title: 'Банкны карт',
    description: 'Банкны гүйлгээний бүртгэл болон шимтгэл.',
    icon: CreditCard,
    buttonText: 'Төхөөрөмж нэмэх'
  },
  payment_solution: {
    id: 3,
    title: 'Төлбөрийн шийдэл',
    description: 'Дижитал төлбөрийн системүүд QR код болон мобайл төлбөр',
    icon: Smartphone,
    buttonText: 'Төхөөрөмж нэмэх'
  },
  credit: {
    id: 4,
    title: 'Кредит / Түр тооцоо',
    description: 'Гэрээт байгууллагуудын зээлийн лимит болон дараа төлбөрт тооцоо.',
    icon: Wallet,
    buttonText: 'Төхөөрөмж нэмэх'
  },
  bonus_card: {
    id: 5,
    title: 'Бонус / Бэлгийн карт',
    description: 'Лоялти оноо болон урьдчилсан төлбөрт бэлгийн картын систем.',
    icon: Gift,
    buttonText: 'Төхөөрөмж нэмэх'
  },
  cash: {
    id: 6,
    title: 'Бэлэн мөнгө',
    description: 'Ресепшин дээр бэлэн мөнгөвөр төлбөр хүлээн авах, гар бүртгэл хөтлөх.',
    icon: Banknote,
    buttonText: 'Төхөөрөмж нэмэх'
  }
};

// Static descriptions / display tweaks per provider name. The list of
// available providers is fetched live from /api/payment-solution-types/.
const solutionDescriptions: Record<string, string> = {
  QPAY: 'Бүх банкны аппликейшн ашиглан QR код уншуулж төлбөр хүлээн авах.',
  POCKET: 'Бүх банкны аппликейшн ашиглан QR код уншуулж төлбөр хүлээн авах.',
  MBANK: 'M-Bank аппликейшнээр төлбөр хүлээн авах.',
  SOCIALPAY: 'Голомт банкны SocialPay апп-аар төлбөр гүйцэтгэх.',
  MONPAY: 'Голомт банкны MonPay апп-аар төлбөр гүйцэтгэх.',
  HIPAY: 'HiPay аргаар төлбөр хүлээн авах.',
};

interface SolutionType {
  id: number;
  name: string;
  config_json?: Record<string, any>;
  logo: string | null;
  is_active: boolean;
}

export default function PaymentConfigPage() {
  const t = useTranslations();
  const { isAuthenticated, isLoading } = useAuth();
  const { themeColor } = useTheme();
  
  // State management
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [solutionTypes, setSolutionTypes] = useState<SolutionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Active solution-type IDs derived from the parent payment_solution
  // config row's `solution_types` array. Backend may return either
  // [1, 3, …] (ids) or [{ id: 1, … }, …] (objects), so we normalise.
  const paymentSolutionConfig = paymentConfigs.find(
    (c) => c.payment_type === 'payment_solution'
  );
  const activeSolutionIds: number[] = (() => {
    const raw = (paymentSolutionConfig as any)?.solution_types ?? [];
    if (!Array.isArray(raw)) return [];
    return raw
      .map((it: any) => (typeof it === 'number' ? it : it?.id))
      .filter((id: any): id is number => typeof id === 'number');
  })();
  
  // Panel states - matching Figma right-side panels
  // Each section has TWO entry modes:
  //  - 'hub'  : opens the hub panel (list/management view)
  //  - 'add'  : opens directly into the add form as a single panel
  const [bankAccountPanel, setBankAccountPanel] = useState<null | 'hub' | 'add'>(null);
  const [bankCardPanel, setBankCardPanel] = useState<null | 'hub' | 'add'>(null);

  // Fetch payment configurations
  const fetchPaymentConfigs = useCallback(async () => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      console.log('Authentication status:', { isAuthenticated, isLoading });
      toast.error('Нэвтрэх шаардлагатай');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching payment configs with cookie authentication');
      const response = await fetch('/api/payment-config/', {
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Эрх хүрэхгүй байна. Дахин нэвтэрнэ үү.');
          return;
        }
        throw new Error('Failed to fetch payment configurations');
      }
      
      const data = await response.json();
      console.log('Payment configs loaded:', data);
      setPaymentConfigs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching payment configs:', error);
      toast.error('Төлбөрийн тохиргоо авахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isLoading]);

  // Initialize data
  useEffect(() => {
    fetchPaymentConfigs();
  }, [fetchPaymentConfigs]);

  // Fetch the catalogue of available payment solution types (QPAY, POCKET,
  // MBANK, SOCIALPAY, MONPAY, HIPAY, …) once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/payment-solution-types/', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) setSolutionTypes(data);
      } catch (err) {
        console.error('Failed to load payment solution types:', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Toggle a single payment-solution provider on the parent payment_solution
  // config row by mutating its `solution_type_ids` array. This is the real
  // backend contract — each provider's id (1=QPAY, 2=POCKET, …) is appended
  // or removed and the row is PATCHed.
  const handleToggleSolution = async (solutionId: number, newActiveStatus: boolean) => {
    if (!isAuthenticated) {
      toast.error('Нэвтрэх шаардлагатай');
      return;
    }
    if (!paymentSolutionConfig) {
      toast.error('Төлбөрийн шийдэл тохиргоо олдсонгүй');
      return;
    }

    const currentIds = new Set(activeSolutionIds);
    if (newActiveStatus) currentIds.add(solutionId);
    else currentIds.delete(solutionId);
    const nextIds = Array.from(currentIds);

    const solutionLabel =
      solutionTypes.find((s) => s.id === solutionId)?.name || `#${solutionId}`;

    setUpdating(`solution-${solutionId}`);
    try {
      const response = await fetch(`/api/payment-config/?id=${paymentSolutionConfig.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          solution_type_ids: nextIds,
          // Keep parent row active whenever at least one sub-solution is on.
          is_active: nextIds.length > 0,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Эрх хүрэхгүй байна. Дахин нэвтэрнэ үү.');
          return;
        }
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      toast.success(
        `${solutionLabel} ${newActiveStatus ? 'идэвхжүүлэгдлээ' : 'идэвхгүй болгогдлоо'}`
      );
      // Reconcile with backend so the UI shows what was actually persisted.
      fetchPaymentConfigs();
    } catch (error) {
      console.error('Error toggling solution:', error);
      toast.error('Тохиргоо өөрчлөхөд алдаа гарлаа');
    } finally {
      setUpdating(null);
    }
  };

  // Toggle payment configuration active status
  const handleToggleConfig = async (configId: number, newActiveStatus: boolean) => {
    if (!isAuthenticated) {
      toast.error('Нэвтрэх шаардлагатай');
      return;
    }

    setUpdating(configId.toString());
    try {
      console.log(`Toggling config ${configId} to ${newActiveStatus}`);
      
      const response = await fetch(`/api/payment-config/?id=${configId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          is_active: newActiveStatus
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Toggle API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 401) {
          toast.error('Эрх хүрэхгүй байна. Дахин нэвтэрнэ үү.');
          return;
        }
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Toggle successful, backend response:', result);

      // Backends commonly return either the updated row directly or a
      // wrapped { config: {...} } / { data: {...} } shape. Pull the new
      // active flag from whichever shape we can find, then refetch to make
      // sure the UI is in sync with what was actually persisted.
      const persisted =
        result?.config?.is_active ??
        result?.data?.is_active ??
        result?.is_active;

      if (typeof persisted === 'boolean' && persisted !== newActiveStatus) {
        console.warn('Backend persisted a different value than requested', {
          requested: newActiveStatus,
          persisted,
        });
      }

      // Optimistic local update first…
      setPaymentConfigs(prev => prev.map(config =>
        config.id === configId
          ? { ...config, is_active: typeof persisted === 'boolean' ? persisted : newActiveStatus }
          : config
      ));

      // …then reconcile with the source of truth so a stale backend can't
      // silently leave the UI lying to the user.
      fetchPaymentConfigs();

      toast.success(`Тохиргоо ${newActiveStatus ? 'идэвхжүүлэгдлээ' : 'идэвхгүй болгогдлоо'}`);
      
    } catch (error) {
      console.error('Error toggling payment config:', error);
      toast.error('Тохиргоо өөрчлөхөд алдаа гарлаа');
    } finally {
      setUpdating(null);
    }
  };

  // "Delete" payment configuration. Backend rows are not actually removable
  // (they map 1:1 to the six payment_type slots), so we soft-delete by
  // PATCHing is_active=false. The row stays in the list but appears as
  // disabled, which is the closest we can get to deletion semantics.
  const handleDeleteConfig = async (configId: number) => {
    if (!isAuthenticated) {
      toast.error('Нэвтрэх шаардлагатай');
      return;
    }
    if (!confirm('Энэ тохиргоог идэвхгүй болгохдоо итгэлтэй байна уу?')) return;
    setUpdating(configId.toString());
    try {
      const response = await fetch(`/api/payment-config/?id=${configId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: false }),
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error('Soft-delete API Error:', response.status, errText);
        if (response.status === 401) {
          toast.error('Эрх хүрэхгүй байна. Дахин нэвтэрнэ үү.');
          return;
        }
        throw new Error(`API Error: ${response.status}`);
      }
      toast.success('Тохиргоо идэвхгүй болгогдлоо');
      fetchPaymentConfigs();
    } catch (error) {
      console.error('Error soft-deleting payment config:', error);
      toast.error('Идэвхгүй болгоход алдаа гарлаа');
    } finally {
      setUpdating(null);
    }
  };

  // Save payment configuration
  const handleSaveConfig = async (configData: PaymentConfigRequest) => {
    if (!isAuthenticated) {
      console.log('Save attempt without auth:', { isAuthenticated });
      toast.error('Нэвтрэх шаардлагатай');
      throw new Error('Authentication required');
    }

    try {
      console.log('Saving payment config:', configData);
      console.log('Using cookie authentication');
      
      const response = await fetch('/api/payment-config/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(configData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 401) {
          toast.error('Эрх хүрэхгүй байна. Дахин нэвтэрнэ үү.');
          throw new Error('Unauthorized');
        }
        if (response.status === 400) {
          toast.error('Өгөгдлийн алдаа. Бүх талбарыг зөв бөглөнө үү.');
          throw new Error('Validation error');
        }
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Save successful:', result);
      toast.success('Төлбөрийн тохиргоо хадгалагдлаа');
      await fetchPaymentConfigs(); // Refresh data
      
    } catch (error) {
      console.error('Error saving payment config:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage !== 'Unauthorized' && errorMessage !== 'Validation error') {
        toast.error('Тохиргоо хадгалахад алдаа гарлаа');
      }
      throw error;
    }
  };

  // Group payment configs by payment type
  const groupedConfigs = paymentConfigs.reduce((acc, config) => {
    if (!acc[config.payment_type]) {
      acc[config.payment_type] = [];
    }
    acc[config.payment_type].push(config);
    return acc;
  }, {} as Record<PaymentType, PaymentConfig[]>);

  // Render bank account section content
  const renderBankAccountContent = (configs: PaymentConfig[]) => {
    if (!configs.length) return (
      <div className="mt-4 text-center text-muted-foreground">
        <p className="text-sm">Одоогоор тохиргоо алга</p>
      </div>
    );

    return (
      <div className="space-y-2">
        {configs.map((config) => (
          <div key={config.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {config.bank?.logo ? (
                <div className="w-8 h-8 rounded overflow-hidden bg-background border border-border flex items-center justify-center">
                  <img 
                    src={config.bank.logo} 
                    alt={config.bank.name || 'Bank'}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded text-xs font-bold items-center justify-center hidden">
                    {config.bank?.name?.slice(0, 2).toUpperCase() || 'БН'}
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 bg-primary/10 text-primary rounded text-xs font-bold flex items-center justify-center">
                  {config.bank?.name?.slice(0, 2).toUpperCase() || 'БН'}
                </div>
              )}
              <div>
                <div className="font-medium text-sm">{config.bank?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {config.account_number && `${config.account_number.slice(0, 4)}****${config.account_number.slice(-4)}`} • МНТ
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={config.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}>
                {config.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => {
                      // Handle edit - open the bank account panel with existing data
                      setBankAccountPanel('hub');
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Засах
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      // Handle delete
                      if (confirm('Энэ тохиргоог устгахдаа итгэлтэй байна уу?')) {
                        console.log('Delete config:', config.id);
                        // Add delete API call here
                      }
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Устгах
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render bank card section content  
  const renderBankCardContent = (configs: PaymentConfig[]) => {
    if (!configs.length) return (
      <div className="mt-4 text-center text-muted-foreground">
        <p className="text-sm">Одоогоор тохиргоо алга</p>
      </div>
    );

    return (
      <div className="space-y-2">
        {configs.map((config) => (
          <div key={config.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {config.bank?.logo ? (
                <div className="w-8 h-8 rounded overflow-hidden bg-background border border-border flex items-center justify-center">
                  <img 
                    src={config.bank.logo} 
                    alt={config.bank.name || 'Bank'}
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="w-8 h-8 bg-muted text-foreground rounded text-xs font-bold items-center justify-center hidden">
                    POS
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 bg-muted text-foreground rounded text-xs font-bold flex items-center justify-center">
                  POS
                </div>
              )}
              <div>
                <div className="font-medium text-sm">{`${config.bank?.name || 'Банк'} - ПОС Терминал${config.terminal_id ? ` #${config.terminal_id}` : ''}`}</div>
                <div className="text-xs text-muted-foreground">
                  {config.created_at ? `холбогдсон ${new Date(config.created_at).toISOString().slice(0, 10)}` : 'холбогдсон огноо бүртгээгүй'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={config.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}>
                {config.is_active ? 'онлайн' : 'офлайн'}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => {
                      // Handle edit - open the bank card POS panel with existing data
                      setBankCardPanel('hub');
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Засах
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      // Handle delete
                      if (confirm('Энэ тохиргоог устгахдаа итгэлтэй байна уу?')) {
                        console.log('Delete POS config:', config.id);
                        // Add delete API call here
                      }
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Устгах
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render payment solution grid with individual toggles
  const renderPaymentSolutionContent = (configs: PaymentConfig[]) => {
    return (
      <div className="grid grid-cols-2 gap-3">
        {solutionTypes.map((solution) => {
          const isActive = activeSolutionIds.includes(solution.id);
          const isUpdating = updating === `solution-${solution.id}`;
          const description = solutionDescriptions[solution.name.toUpperCase()] || '';

          return (
            <div
              key={solution.id}
              className={cn(
                "p-3 rounded-lg border-2 transition-all duration-200",
                isActive ? "bg-primary/5 border-primary/20" : "bg-muted border-border"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-sm">{solution.name}</div>
                <Switch
                  checked={isActive}
                  disabled={isUpdating}
                  onCheckedChange={(checked) => {
                    handleToggleSolution(solution.id, checked);
                  }}
                  className={isActive ? "data-[state=checked]:bg-primary" : ""}
                />
              </div>
              <p className="text-xs text-muted-foreground mb-2 leading-tight">
                {description}
              </p>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                төлөв: {isActive ? 'идэвхтэй' : 'идэвхгүй'}
              </Badge>
            </div>
          );
        })}
      </div>
    );
  };

  // Render simple toggle sections (4, 5, 6)
  const renderSimpleToggleContent = (configs: PaymentConfig[], sectionConfig: any) => {
    const config = configs[0];
    
    return (
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div>
          <div className="font-medium text-sm mb-1">
            {sectionConfig.description}
          </div>
          <Badge variant="secondary" className="text-xs">
            төлөв: {config?.is_active ? 'идэвхтэй' : 'идэвхгүй'}
          </Badge>
        </div>
        <Switch 
          checked={config?.is_active || false}
          disabled={updating === config?.id?.toString() || !config}
          onCheckedChange={(checked) => {
            if (config) {
              handleToggleConfig(config.id, checked);
            }
          }}
          className={config?.is_active ? "data-[state=checked]:bg-primary" : ""}
        />
      </div>
    );
  };

  // Card header with icon + numbered title (figma: "1. Дансаар" style)
  const SectionHeader = ({ paymentType, action }: { paymentType: PaymentType; action?: React.ReactNode }) => {
    const sc = paymentSectionConfig[paymentType];
    const Icon = sc.icon;
    return (
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-tight">
              {sc.id}. {sc.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {sc.description}
            </p>
          </div>
        </div>
        {action}
      </div>
    );
  };

  // Card 1: Дансаар — list + 2 stacked buttons
  const renderBankAccountCard = (configs: PaymentConfig[]) => (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardContent className="p-6 flex flex-col h-full">
        <SectionHeader paymentType="bank_account" />
        <div className="flex-1 space-y-2">
          {configs.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground py-6">
              Одоогоор данс бүртгээгүй байна
            </div>
          ) : configs.map((config) => (
            <div
              key={config.id}
              className="flex items-center justify-between gap-3 rounded-lg border-l-4 border-primary bg-primary/5 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="text-xs font-semibold text-foreground truncate uppercase">
                  {config.bank?.name || 'Банк'}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {config.account_number
                    ? `${config.account_number.slice(0, 4)}******${config.account_number.slice(-4)}`
                    : '••••••'}{' '}
                  • MNT
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span
                  className={cn(
                    'text-xs font-medium',
                    config.is_active ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {config.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setBankAccountPanel('hub')}>
                      <Edit className="mr-2 h-4 w-4" />
                      Засварлах
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteConfig(config.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Устгах
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <Button
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/5"
            onClick={() => setBankAccountPanel('add')}
          >
            Данс нэмэх
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setBankAccountPanel('hub')}
          >
            Тохируулах
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Card 2: Банкны карт — top-right add button, terminal list, "Бүгдийг харах" link
  const renderBankCardCard = (configs: PaymentConfig[]) => (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardContent className="p-6 flex flex-col h-full">
        <SectionHeader
          paymentType="bank_card"
          action={
            <Button size="sm" onClick={() => setBankCardPanel('add')}>
              <Plus className="mr-1.5 h-4 w-4" />
              Төхөөрөмж нэмэх
            </Button>
          }
        />
        <div className="flex-1 space-y-2">
          {configs.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground py-6">
              Терминал бүртгээгүй байна
            </div>
          ) : configs.slice(0, 2).map((config) => (
            <div
              key={config.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded bg-muted text-foreground flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {`${config.bank?.name || 'Банк'} - ПОС Терминал${config.terminal_id ? ` #${config.terminal_id}` : ''}`}
                  </div>
                  <div className="text-xs text-muted-foreground truncate uppercase tracking-wide">
                    {config.created_at
                      ? `Холбогдсон: ${new Date(config.created_at).toISOString().slice(0, 10)}`
                      : 'Холбогдсон огноо бүртгээгүй'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Badge
                  className={cn(
                    'text-[10px] uppercase font-semibold',
                    config.is_active
                      ? 'bg-primary/10 text-primary hover:bg-primary/10'
                      : 'bg-muted text-muted-foreground hover:bg-muted'
                  )}
                >
                  {config.is_active ? 'ONLINE' : 'OFFLINE'}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setBankCardPanel('hub')}>
                      <Edit className="mr-2 h-4 w-4" />
                      Засварлах
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteConfig(config.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Устгах
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
        {configs.length > 0 && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setBankCardPanel('hub')}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Бүгдийг харах →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Card 3: Төлбөрийн шийдэл — full-width horizontal scrolling carousel of solutions
  const renderPaymentSolutionCard = () => (
    <Card className="h-full transition-shadow hover:shadow-md md:col-span-2 lg:col-span-3">
      <CardContent className="p-6">
        <SectionHeader paymentType="payment_solution" />
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
          {solutionTypes.length === 0 ? (
            <div className="text-xs text-muted-foreground py-4">
              Төлбөрийн шийдэл уншиж байна…
            </div>
          ) : solutionTypes.map((solution) => {
            const isActive = activeSolutionIds.includes(solution.id);
            const isUpdating = updating === `solution-${solution.id}`;
            const description = solutionDescriptions[solution.name.toUpperCase()] || '';
            return (
              <div
                key={solution.id}
                className={cn(
                  'shrink-0 snap-start w-[240px] rounded-lg border p-3 transition-colors',
                  isActive ? 'bg-primary/5 border-primary/30' : 'bg-background border-border'
                )}
              >
                <div className="inline-flex items-center px-2 py-0.5 rounded bg-background border border-border text-xs font-bold mb-2">
                  {solution.name}
                </div>
                <p className="text-xs text-muted-foreground leading-snug min-h-[48px] mb-3">
                  {description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    төлөв: {isActive ? 'идэвхтэй' : 'идэвхгүй'}
                  </span>
                  <Switch
                    checked={isActive}
                    disabled={isUpdating}
                    onCheckedChange={(checked) => handleToggleSolution(solution.id, checked)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  // Cards 4, 5, 6: info cards with on/off switch wired to backend `is_active`
  const renderInfoCard = (paymentType: PaymentType) => {
    const configs = groupedConfigs[paymentType] || [];
    const config = configs[0];
    const isActive = !!config?.is_active;
    const isUpdating = updating === config?.id?.toString();

    return (
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="p-6 flex flex-col h-full">
          <SectionHeader paymentType={paymentType} />
          <div className="mt-auto flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              {isActive ? (
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className="text-xs text-muted-foreground truncate">
                төлөв:{' '}
                <span className={cn('font-medium', isActive ? 'text-primary' : 'text-foreground')}>
                  {isActive ? 'идэвхтэй' : 'идэвхгүй'}
                </span>
              </span>
            </div>
            <Switch
              checked={isActive}
              disabled={isUpdating || !config}
              onCheckedChange={(checked) => {
                if (config) {
                  handleToggleConfig(config.id, checked);
                }
              }}
              className={isActive ? 'data-[state=checked]:bg-primary' : ''}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  // Early returns for loading and authentication states  
  if (loading || isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted rounded w-64 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Нэвтрэх шаардлагатай</h2>
            <p className="text-sm text-muted-foreground">Төлбөрийн тохиргоог үзэхийн тулд нэвтэрнэ үү.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Төлбөрийн хэрэгслийн тохиргоо</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/admin/currency'}
            >
              Валютын тохиргоо
            </Button>
          </div>
        </div>

        {/* Payment Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Row 1: Дансаар + Банкны карт (карт is wider per figma) */}
          <div className="md:col-span-1">
            {renderBankAccountCard(groupedConfigs['bank_account'] || [])}
          </div>
          <div className="md:col-span-1 lg:col-span-2">
            {renderBankCardCard(groupedConfigs['bank_card'] || [])}
          </div>

          {/* Row 2: Төлбөрийн шийдэл — full width */}
          {renderPaymentSolutionCard()}

          {/* Row 3: simple info cards 4, 5, 6 */}
          {(['credit', 'bonus_card', 'cash'] as PaymentType[]).map((pt) => (
            <React.Fragment key={pt}>{renderInfoCard(pt)}</React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Right-side panels - outside main container */}
      <BankAccountConfigPanel
        isOpen={bankAccountPanel !== null}
        onClose={() => setBankAccountPanel(null)}
        onSave={handleSaveConfig}
        initialView={bankAccountPanel ?? 'hub'}
        accounts={(() => {
          const apiAccounts = (groupedConfigs['bank_account'] || []).map((c, idx) => ({
            id: c.id,
            bankName: `${c.bank?.name || 'Банк'}${idx === 0 ? ' (Үндсэн)' : ' (Валют)'}`,
            accountNumber: c.account_number || '—',
            holder: c.account_holder || undefined,
            currency: (c as any).currency?.code || 'MNT',
            isActive: !!c.is_active,
            isPrimary: idx === 0,
          }));
          // Provide realistic placeholder rows when nothing is configured yet
          if (apiAccounts.length === 0) {
            return [
              {
                id: 'placeholder-1',
                bankName: 'Хаан Банк (Үндсэн)',
                accountNumber: '5023 4492 1198',
                holder: 'СТРАКТУР БЛУ ХХК',
                currency: 'MNT',
                isActive: true,
                isPrimary: true,
              },
              {
                id: 'placeholder-2',
                bankName: 'Голомт Банк (Валют)',
                accountNumber: '1105 1293 8840',
                holder: 'СТРАКТУР БЛУ ХХК',
                currency: 'USD',
                isActive: false,
                isPrimary: false,
              },
            ];
          }
          return apiAccounts;
        })()}
        onToggleAccount={(id, active) => {
          if (typeof id === 'number') {
            handleToggleConfig(id, active);
          }
        }}
        onEditAccount={() => setBankAccountPanel('add')}
        onDeleteAccount={(id) => {
          if (typeof id === 'number') handleDeleteConfig(id);
        }}
      />

      <BankCardPOSConfigPanel
        isOpen={bankCardPanel !== null}
        onClose={() => setBankCardPanel(null)}
        onSave={handleSaveConfig}
        initialView={bankCardPanel ?? 'hub'}
        terminals={(() => {
          const apiTerminals = (groupedConfigs['bank_card'] || []).map((c) => ({
            id: c.id,
            bankName: `${c.bank?.name || 'Банк'} - ПОС Терминал`,
            terminalNumber: c.terminal_id ? `SN: ${c.terminal_id}` : '',
            lastConnection: c.created_at ? new Date(c.created_at).toISOString().slice(0, 10) : undefined,
            status: (c.is_active ? 'online' : 'offline') as 'online' | 'offline',
            bankCode: c.bank?.name?.slice(0, 2).toUpperCase() || 'БН',
          }));
          if (apiTerminals.length === 0) {
            return [
              {
                id: 'pos-placeholder-1',
                bankName: 'ХХБ - ПОС Терминал',
                terminalNumber: 'SN: 8821',
                lastConnection: '2026-04-12',
                status: 'online' as const,
                bankCode: 'ХХ',
              },
              {
                id: 'pos-placeholder-2',
                bankName: 'Голомт Банк - ПОС Терминал',
                terminalNumber: 'SN: 1104',
                lastConnection: '2026-03-28',
                status: 'offline' as const,
                bankCode: 'ГО',
              },
            ];
          }
          return apiTerminals;
        })()}
        onEditTerminal={() => setBankCardPanel('add')}
        onDeleteTerminal={(id) => {
          if (typeof id === 'number') handleDeleteConfig(id);
        }}
      />
    </>
  );
}