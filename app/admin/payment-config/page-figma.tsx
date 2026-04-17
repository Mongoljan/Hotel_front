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
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
    title: 'Дансаар',
    description: 'Дансны хуулшаар гар арчаас төлбөр баталгаажуулах судал',
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
    description: 'Банкны гүүгэмэл бүртгэл болон шинэчлэх',
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
    description: 'Бус банкны агшинаан авлига QR код удаарчлах төлбөр хийгээ өглөг',
    icon: Smartphone,
    bgColor: 'bg-white',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-700',
    buttonText: 'Төхөөрөмж нэмэх',
    buttonColor: 'bg-green-500 hover:bg-green-600'
  },
  credit: {
    id: 4,
    title: 'Кредит / Түр тооцоо',
    description: 'Гэрээт байгууллагуудын зээлийн лимит болон дараа төлбөр тооцоо',
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
    description: 'Лояалти онооны болон урамшууллын төлбөр бэлгийн картын систем',
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
    description: 'Ресепшнээр дэрг балгалт мөнгөлөг хүлээмжтэй лимит болон дараа төлбөр хүүхэд',
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
  { id: 'qpay', name: 'QPAY', description: 'Бус банкны агшинахан авлига QR код удаарчлах төлбөр хүүрээг аваа.', api_name: 'qpay' },
  { id: 'pocket', name: 'POCKET', description: 'Бус банкны агшинахан авлига QR код удаарчлах төлбөр хүүрээг амттг', api_name: 'pocket' },
  { id: 'socialpay', name: 'SocialPay', description: 'Голомт банкны SocialPay апп-аар хөндлөр төлбөр гүйцэтгэх.', api_name: 'socialpay' },
  { id: 'monpay', name: 'MONPAY', description: 'Голомт банкны SocialPay апп-аар хөндлөр төлбөр гүйцэтгэх.', api_name: 'monpay' }
];

export default function PaymentConfigPage() {
  const t = useTranslations();
  const { isAuthenticated, isLoading } = useAuth();
  
  // State management
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  
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
      <div className="mt-4 text-center text-gray-500">
        <p className="text-sm">Одоогоор тохиргоо алга</p>
      </div>
    );

    return (
      <div className="mt-4 space-y-2">
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
                  <div className="w-8 h-8 bg-green-600 text-white rounded text-xs font-bold items-center justify-center hidden">
                    {config.bank?.short_code?.slice(0, 2) || 'БН'}
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 bg-green-600 text-white rounded text-xs font-bold flex items-center justify-center">
                  {config.bank?.short_code?.slice(0, 2) || 'БН'}
                </div>
              )}
              <div>
                <div className="font-medium text-sm">{config.bank?.name}</div>
                <div className="text-xs text-gray-500">
                  {config.account_number?.slice(0, 4)}****{config.account_number?.slice(-4)} • МНТ
                </div>
              </div>
            </div>
            <Badge className={config.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
              {config.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
            </Badge>
          </div>
        ))}
      </div>
    );
  };

  // Render bank card section content  
  const renderBankCardContent = (configs: PaymentConfig[]) => {
    if (!configs.length) return (
      <div className="mt-4 text-center text-gray-500">
        <p className="text-sm">Одоогоор тохиргоо алга</p>
      </div>
    );

    return (
      <div className="mt-4 space-y-2">
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
                  <div className="w-8 h-8 bg-green-600 text-white rounded text-xs font-bold items-center justify-center hidden">
                    ПОС
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 bg-green-600 text-white rounded text-xs font-bold flex items-center justify-center">
                  ПОС
                </div>
              )}
              <div>
                <div className="font-medium text-sm">{config.bank?.name} - ПОС Терминал #{config.terminal_id}</div>
                <div className="text-xs text-gray-500">
                  хөлболдсон 2023-10-12
                </div>
              </div>
            </div>
            <Badge className={config.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
              {config.is_active ? 'онлайн' : 'офлайн'}
            </Badge>
          </div>
        ))}
      </div>
    );
  };

  // Render payment solution grid
  const renderPaymentSolutionContent = (configs: PaymentConfig[]) => {
    const mainConfig = configs[0];
    
    return (
      <div className="mt-4 grid grid-cols-2 gap-3">
        {paymentSolutions.map((solution) => {
          const isActive = mainConfig?.is_active || false;
          const isUpdating = updating === `${mainConfig?.id}-${solution.id}`;
          
          return (
            <div 
              key={solution.id} 
              className={cn(
                "p-3 rounded-lg border-2 transition-all duration-200",
                isActive ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-sm">{solution.name}</div>
                <Switch 
                  checked={isActive}
                  disabled={isUpdating || !mainConfig}
                  onCheckedChange={(checked) => {
                    if (mainConfig) {
                      handleToggleConfig(mainConfig.id, checked);
                    }
                  }}
                  className={isActive ? "data-[state=checked]:bg-green-600" : ""}
                />
              </div>
              <p className="text-xs text-gray-600 mb-2 leading-tight">
                {solution.description}
              </p>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs",
                  isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
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
      <div className="mt-4">
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
            className={config?.is_active ? "data-[state=checked]:bg-green-600" : ""}
          />
        </div>
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
            {/* Header with icon and number */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-green-700" />
                </div>
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {sectionConfig.id}
                </div>
              </div>
              <Button 
                size="sm" 
                className={cn("text-white px-4 py-2 text-sm font-medium", sectionConfig.buttonColor)}
                onClick={() => {
                  if (paymentType === 'bank_account') setShowBankAccountPanel(true);
                  if (paymentType === 'bank_card') setShowBankCardPOSPanel(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                {sectionConfig.buttonText}
              </Button>
            </div>

            {/* Section title and description */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {sectionConfig.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {sectionConfig.description}
              </p>
            </div>

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

  if (loading || isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
            <div className="h-5 bg-gray-200 rounded w-80 animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Нэвтрэх шаардлагатай</h2>
          <p className="text-gray-600">Төлбөрийн тохиргоог үзэхийн тулд нэвтэрнэ үү.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">Төлбөрийн хэрэгслийн тохиргоо</h1>
      </div>

      {/* Payment Sections Grid - Matching Figma 3x2 layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* First row: sections 1, 2, 3 */}
        {(['bank_account', 'bank_card', 'payment_solution'] as PaymentType[]).map(paymentType => {
          const configs = groupedConfigs[paymentType] || [];
          return renderPaymentSection(paymentType, configs);
        })}
        
        {/* Second row: sections 4, 5, 6 */}
        {(['credit', 'bonus_card', 'cash'] as PaymentType[]).map(paymentType => {
          const configs = groupedConfigs[paymentType] || [];
          return renderPaymentSection(paymentType, configs);
        })}
      </div>

      {/* Right-side panels matching Figma design */}
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
    </div>
  );
}