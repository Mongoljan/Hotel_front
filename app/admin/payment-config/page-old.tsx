'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  CreditCard,
  Building2,
  Smartphone,
  Settings,
  CheckCircle,
  XCircle,
  RefreshCw,
  Wallet,
  Banknote,
  Gift,
  Zap,
  QrCode,
  X,
  ArrowLeft
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

// Payment sections matching Figma design exactly
const paymentSections = [
  {
    id: 1,
    title: 'Дансаар',
    description: 'Дансны хуулшаар гар арчаас телбөр баталгаажуулах судал',
    icon: Building2,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    numberColor: 'bg-green-600',
    buttonText: 'Данс нэмэх',
    accounts: [
      {
        id: '1',
        bankName: 'ХХБ БАНК',
        accountNumber: '50000****1234',
        currency: 'МНТ',
        status: 'active',
        bankCode: 'ХХБ',
        bankColor: 'bg-purple-600'
      }
    ]
  },
  {
    id: 2,
    title: 'Банкны карт',
    description: 'Банкны гүүгэмэл бүртгэл болон шинэчлэх',
    icon: CreditCard,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    numberColor: 'bg-green-600',
    buttonText: 'Төхөөрөмж нэмэх',
    terminals: [
      {
        id: '1',
        bankName: 'ХХБ - ПОС Терминал',
        terminalNumber: '#8821',
        lastConnection: '2023-10-12',
        status: 'online',
        bankCode: 'ХХБ',
        bankColor: 'bg-purple-600'
      },
      {
        id: '2',
        bankName: 'Голомт банк - ПОС Терминал',
        terminalNumber: '#1104',
        lastConnection: '2023-08-05',
        status: 'online',
        bankCode: 'Г',
        bankColor: 'bg-blue-600'
      },
      {
        id: '3',
        bankName: 'Storage B Terminal',
        terminalNumber: 'SN TX.73402.ZZ',
        lastConnection: '',
        status: 'offline',
        bankCode: 'S',
        bankColor: 'bg-gray-600'
      }
    ]
  },
  {
    id: 3,
    title: 'Төлбөрийн шийдэл',
    description: 'Бус банкны агтлахан авлига QR код удаарчлах телбөр хийгээ өглөг',
    icon: Smartphone,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    numberColor: 'bg-purple-600',
    buttonText: 'Төхөөрэмж нэмэх',
    solutions: [
      {
        id: 'qpay',
        name: 'QPAY',
        description: 'Бус банкны агшинахан авлига QR код удаарчлах телбөр хүүрээг аваа.',
        enabled: true,
        status: 'töлөв: идэвхтэй'
      },
      {
        id: 'pocket',
        name: 'POCKET',
        description: 'Бус банкны агшинахан авлига QR код удаарчлах телбөр хүүрээг амттг',
        enabled: false,
        status: 'төлөв: идэвхгүй'
      },
      {
        id: 'socialpay',
        name: 'SocialPay',
        description: 'Голомт банкны SocialPay апп-аар хөндлөр телбөр гүйцэтгэх.',
        enabled: true,
        status: 'төлөв: идэвхтэй'
      },
      {
        id: 'mbank',
        name: 'MBANK',
        description: 'Бус банкны агшинахан авлига MBANK QR код удаарчлах телбөр хүүрээг амттг',
        enabled: true,
        status: 'төлөв: идэвхтэй'
      }
    ]
  },
  {
    id: 4,
    title: 'Кредит / Тур тооцоо',
    description: 'Гэрээт байгууллагуудын зээлийн лимит болон дараа телбөр тооцоо',
    icon: Wallet,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    numberColor: 'bg-yellow-600',
    buttonText: 'Төхөөрөмж нэмэх',
    enabled: false
  },
  {
    id: 5,
    title: 'Бонус / Бэлгийн карт',
    description: 'Ивээнтэй онооны болон урамшууллын телбөр бэлбөгийн картан систем',
    icon: Gift,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    numberColor: 'bg-pink-600',
    buttonText: 'Төхөөрөмж нэмэх',
    enabled: false
  },
  {
    id: 6,
    title: 'Бэлэн мөнгө',
    description: 'Ресепшнээр дэрг балгалт мөнгөлөг хүлээмжтэй лимит болон дараа телбөр хүүхэд',
    icon: Banknote,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    numberColor: 'bg-amber-600',
    buttonText: 'Төхөөрөмж нэмэх',
    enabled: true
  }
];

export default function PaymentConfigPage() {
  const t = useTranslations();
  const { isAuthenticated, isLoading } = useAuth();
  
  // State management
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Panel states - matching Figma right-side panels
  const [showBankAccountPanel, setShowBankAccountPanel] = useState(false);
  const [showBankCardPOSPanel, setShowBankCardPOSPanel] = useState(false);

  // Fetch payment configurations
  const fetchPaymentConfigs = useCallback(async () => {
    // Wait for auth to complete
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
        credentials: 'include' // Include cookies for authentication
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
        credentials: 'include', // Include cookies for authentication
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
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage !== 'Unauthorized' && errorMessage !== 'Validation error') {
        toast.error('Тохиргоо хадгалахад алдаа гарлаа');
      }
      throw error; // Re-throw to handle in modal
    }
  };

  const renderPaymentSection = (section: typeof paymentSections[0]) => {
    return (
      <motion.div
        key={section.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: section.id * 0.1 }}
        className="w-full"
      >
        <Card className={cn(
          "transition-all duration-300 hover:shadow-md border",
          section.borderColor,
          section.bgColor,
          "relative overflow-hidden"
        )}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Section Number */}
              <div className="flex-shrink-0">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg",
                  section.numberColor
                )}>
                  {section.id}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white px-4"
                    onClick={() => {
                      if (section.id === 1) setShowBankAccountPanel(true);
                      if (section.id === 2) setShowBankCardPOSPanel(true);
                    }}
                  >
                    {section.buttonText}
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {section.description}
                </p>

                {/* Section 1: Bank Accounts */}
                {section.id === 1 && section.accounts && (
                  <div className="space-y-3">
                    {section.accounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded text-white flex items-center justify-center text-xs font-bold",
                            account.bankColor
                          )}>
                            {account.bankCode}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{account.bankName}</div>
                            <div className="text-xs text-muted-foreground">
                              {account.accountNumber} • {account.currency}
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Идэвхтэй</Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Section 2: Bank Cards/POS Terminals */}
                {section.id === 2 && section.terminals && (
                  <div className="space-y-3">
                    {section.terminals.map((terminal) => (
                      <div key={terminal.id} className={cn(
                        "flex items-center justify-between p-3 bg-white rounded-lg border",
                        terminal.status === 'offline' && "opacity-60"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded text-white flex items-center justify-center text-xs font-bold",
                            terminal.bankColor
                          )}>
                            {terminal.bankCode}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {terminal.bankName} {terminal.terminalNumber}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {terminal.lastConnection && `хөлболдсон ${terminal.lastConnection}`}
                            </div>
                          </div>
                        </div>
                        <Badge className={cn(
                          "text-xs",
                          terminal.status === 'online' 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-600"
                        )}>
                          {terminal.status === 'online' ? 'идэвхтэй' : 'идэвхгүй'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Section 3: Payment Solutions */}
                {section.id === 3 && section.solutions && (
                  <div className="grid grid-cols-2 gap-4">
                    {section.solutions.map((solution) => (
                      <div key={solution.id} className={cn(
                        "p-4 rounded-lg border",
                        solution.enabled ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200",
                        !solution.enabled && "opacity-60"
                      )}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">{solution.name}</div>
                          <Switch checked={solution.enabled} />
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {solution.description}
                        </p>
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          solution.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                        )}>
                          {solution.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sections 4, 5, 6: Disabled sections */}
                {(section.id === 4 || section.id === 5 || section.id === 6) && (
                  <div className="p-4 bg-white rounded-lg border opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">
                        {section.description}
                      </div>
                      <Switch checked={section.enabled || false} />
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        төлөв: {section.enabled ? 'идэвхтэй' : 'идэвхгүй'}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
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

        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded animate-pulse" />
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
        <h1 className="text-2xl font-bold">Төлбөрийн хэрэгслийн тохиргоо</h1>
      </div>

      {/* Payment Sections - Matching Figma exactly */}
      <div className="space-y-4">
        {paymentSections.map(renderPaymentSection)}
      </div>

      {/* Right-side Panels - matching Figma design */}
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