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
    description: 'Дансны дугаараар гар бүртгэл төлбөр баталгаажуулах систем',
    icon: Building2,
    bgColor: 'bg-white',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-700',
    buttonText: 'Данс нэмэх',
    buttonColor: 'bg-green-500 hover:bg-green-600'
  },
  bank_card: {
    id: 2,
    title: 'Банкны карт',
    description: 'Банкны картын төлбөр болон ПОС терминал',
    icon: CreditCard,
    bgColor: 'bg-white',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-700',
    buttonText: 'Төхөөрөмж нэмэх',
    buttonColor: 'bg-green-500 hover:bg-green-600'
  },
  payment_solution: {
    id: 3,
    title: 'Төлбөрийн шийдэл',
    description: 'Дижитал төлбөрийн системүүд QR код болон мобайл төлбөр',
    icon: Smartphone,
    bgColor: 'bg-white',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-700',
    buttonText: 'Төхөөрөмж нэмэх',
    buttonColor: 'bg-green-500 hover:bg-green-600'
  },
  credit: {
    id: 4,
    title: 'Зээл / Түр тооцоо',
    description: 'Гэрээт байгууллагын зээлийн лимит болон хойшлуулсан төлбөр',
    icon: Wallet,
    bgColor: 'bg-white',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-700',
    buttonText: 'Төхөөрөмж нэмэх',
    buttonColor: 'bg-green-500 hover:bg-green-600'
  },
  bonus_card: {
    id: 5,
    title: 'Бонус / Бэлгийн карт',
    description: 'Үйлчлүүлэгчийн урамшуулалын оноо болон бэлгийн картын систем',
    icon: Gift,
    bgColor: 'bg-white',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-700',
    buttonText: 'Төхөөрөмж нэмэх',
    buttonColor: 'bg-green-500 hover:bg-green-600'
  },
  cash: {
    id: 6,
    title: 'Бэлэн мөнгө',
    description: 'Ресепшний бэлэн мөнгөний төлбөр болон кассын систем',
    icon: Banknote,
    bgColor: 'bg-white',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-700',
    buttonText: 'Төхөөрөмж нэмэх',
    buttonColor: 'bg-green-500 hover:bg-green-600'
  }
};

// Payment solution types for the 3rd section
const paymentSolutions = [
  { id: 'qpay', name: 'QPAY', description: 'Олон банкны агшин зуурын QR код болон мобайл төлбөр', api_name: 'qpay' },
  { id: 'pocket', name: 'POCKET', description: 'Олон банкны агшин зуурын QR код болон мобайл төлбөр', api_name: 'pocket' },
  { id: 'socialpay', name: 'SocialPay', description: 'Голомт банкны SocialPay апп-аар хурдан төлбөр гүйцэтгэх', api_name: 'socialpay' },
  { id: 'monpay', name: 'MONPAY', description: 'Голомт банкны MONPAY апп-аар хурдан төлбөр гүйцэтгэх', api_name: 'monpay' }
];

export default function PaymentConfigPage() {
  const t = useTranslations();
  const { isAuthenticated, isLoading } = useAuth();
  const { themeColor } = useTheme();
  
  // State management
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
  // State for individual payment solution toggles
  const [solutionStates, setSolutionStates] = useState<Record<string, boolean>>({
    qpay: false,
    pocket: false,
    socialpay: false,
    monpay: false
  });
  
  // Panel states - matching Figma right-side panels
  const [showBankAccountPanel, setShowBankAccountPanel] = useState(false);
  const [showBankCardPOSPanel, setShowBankCardPOSPanel] = useState(false);

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
        credentials: 'include'
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

  // Toggle individual payment solution
  const handleToggleSolution = async (solutionId: string, newActiveStatus: boolean) => {
    if (!isAuthenticated) {
      toast.error('Нэвтрэх шаардлагатай');
      return;
    }

    setUpdating(`solution-${solutionId}`);
    try {
      console.log(`Toggling solution ${solutionId} to ${newActiveStatus}`);
      
      // Update local state immediately for better UX
      setSolutionStates(prev => ({
        ...prev,
        [solutionId]: newActiveStatus
      }));
      
      // For now, just show success - you can implement API call later
      toast.success(`${solutionId.toUpperCase()} ${newActiveStatus ? 'идэвхжүүлэгдлээ' : 'идэвхгүй болгогдлоо'}`);
      
    } catch (error) {
      console.error('Error toggling solution:', error);
      toast.error('Тохиргоо өөрчлөхөд алдаа гарлаа');
      // Revert state on error
      setSolutionStates(prev => ({
        ...prev,
        [solutionId]: !newActiveStatus
      }));
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
      console.log('Toggle successful:', result);
      
      // Update local state
      setPaymentConfigs(prev => prev.map(config => 
        config.id === configId 
          ? { ...config, is_active: newActiveStatus }
          : config
      ));
      
      toast.success(`Тохиргоо ${newActiveStatus ? 'идэвхжүүлэгдлээ' : 'идэвхгүй болгогдлоо'}`);
      
    } catch (error) {
      console.error('Error toggling payment config:', error);
      toast.error('Тохиргоо өөрчлөхөд алдаа гарлаа');
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
          <div key={config.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {config.bank?.logo ? (
                <div className="w-8 h-8 rounded overflow-hidden bg-white border border-gray-200 flex items-center justify-center">
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
                  <div className="w-8 h-8 bg-primary text-white rounded text-xs font-bold items-center justify-center hidden">
                    {config.bank?.name?.slice(0, 2).toUpperCase() || 'БН'}
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 bg-primary text-white rounded text-xs font-bold flex items-center justify-center">
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
              <Badge className={config.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
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
                      setShowBankAccountPanel(true);
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
          <div key={config.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {config.bank?.logo ? (
                <div className="w-8 h-8 rounded overflow-hidden bg-white border border-gray-200 flex items-center justify-center">
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
                  <div className="w-8 h-8 bg-primary text-white rounded text-xs font-bold items-center justify-center hidden">
                    ΠΟΣ
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 bg-primary text-white rounded text-xs font-bold flex items-center justify-center">
                  ΠΟΣ
                </div>
              )}
              <div>
                <div className="font-medium text-sm">{config.bank?.name || 'Голомт Банк'} - ПОС Терминал #{config.terminal_id || '001'}</div>
                <div className="text-xs text-muted-foreground">
                  хөлболдсон 2023-10-12
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={config.is_active ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"}>
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
                      setShowBankCardPOSPanel(true);
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
        {paymentSolutions.map((solution) => {
          const isActive = solutionStates[solution.id] || false;
          const isUpdating = updating === `solution-${solution.id}`;
          
          return (
            <div 
              key={solution.id} 
              className={cn(
                "p-3 rounded-lg border-2 transition-all duration-200",
                isActive ? "bg-primary/5 border-primary/20" : "bg-gray-50 border-gray-200"
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
                {solution.description}
              </p>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs",
                  isActive ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"
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
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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

  // Render payment section
  const renderPaymentSection = (paymentType: PaymentType, configs: PaymentConfig[]) => {
    const sectionConfig = paymentSectionConfig[paymentType];
    if (!sectionConfig) return null;

    const Icon = sectionConfig.icon;

    return (
      <motion.div
        key={sectionConfig.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: sectionConfig.id * 0.1 }}
        className="w-full"
      >
        <Card className={cn(
          "h-full transition-all duration-300 hover:shadow-lg border-2",
          sectionConfig.borderColor,
          sectionConfig.bgColor,
          "relative"
        )}>
          <CardContent className="p-6">
            {/* Header with icon and number - NO ADD BUTTON */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                {sectionConfig.id}
              </div>
            </div>

            {/* Section title and description */}
            <div className="space-y-2 mb-4">
              <h3 className="text-base font-medium">
                {sectionConfig.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {sectionConfig.description}
              </p>
            </div>

            {/* Add button only for bank sections that have content */}
            {(paymentType === 'bank_account' || paymentType === 'bank_card') && (
              <div>
                <Button 
                  size="sm"
                  onClick={() => {
                    if (paymentType === 'bank_account') setShowBankAccountPanel(true);
                    if (paymentType === 'bank_card') setShowBankCardPOSPanel(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {sectionConfig.buttonText}
                </Button>
              </div>
            )}

            {/* Content based on section type */}
            {paymentType === 'bank_account' && renderBankAccountContent(configs)}
            {paymentType === 'bank_card' && renderBankCardContent(configs)}
            {paymentType === 'payment_solution' && renderPaymentSolutionContent(configs)}
            {(['credit', 'bonus_card', 'cash'] as PaymentType[]).includes(paymentType) && 
             renderSimpleToggleContent(configs, sectionConfig)}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Early returns for loading and authentication states  
  if (loading || isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-gray-200 rounded animate-pulse" />
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

        {/* Payment Sections Grid - Matching admin interface pattern */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* First row: sections 1, 2 */}
          {(['bank_account', 'bank_card'] as PaymentType[]).map(paymentType => {
            const configs = groupedConfigs[paymentType] || [];
            return renderPaymentSection(paymentType, configs);
          })}
          
          {/* Төлбөрийн шийдэл - only show when sufficient data is available */}
          {(() => {
            const paymentSolutionConfigs = groupedConfigs['payment_solution'] || [];
            const hasActiveSolutions = Object.values(solutionStates).some(state => state === true);
            const sufficientData = paymentSolutionConfigs.length > 0 || hasActiveSolutions;
            
            if (sufficientData) {
              return renderPaymentSection('payment_solution', paymentSolutionConfigs);
            }
            return null;
          })()}
          
          {/* Second row: sections 4, 5, 6 */}
          {(['credit', 'bonus_card', 'cash'] as PaymentType[]).map(paymentType => {
            const configs = groupedConfigs[paymentType] || [];
            return renderPaymentSection(paymentType, configs);
          })}
        </div>
      </div>
      
      {/* Right-side panels - outside main container */}
      <BankAccountConfigPanel
        isOpen={showBankAccountPanel}
        onClose={() => setShowBankAccountPanel(false)}
        onSave={handleSaveConfig}
      />

      <BankCardPOSConfigPanel
        isOpen={showBankCardPOSPanel}
        onClose={() => setShowBankCardPOSPanel(false)}
        onSave={handleSaveConfig}
      />
    </>
  );
}