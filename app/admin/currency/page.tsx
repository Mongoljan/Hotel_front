'use client';

import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';
import { schemaCurrencyRate } from '@/app/schema';
import {
  IconPlus,
  IconEdit,
  IconHistory,
  IconX,
  IconChevronRight,
  IconLoader2,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
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

// Types for API data
interface CurrencyRate {
  id: number;
  created_by_name: string;
  buy_rate: string;
  sell_rate: string;
  created_at: string;
  currency: number;
}

interface PaymentMethod {
  id: number;
  name: string;
  method_type: string;
  logo: string | null;
}

interface PropertyPaymentMethod {
  id?: number;
  payment_method: number;
  is_enabled: boolean;
}

// Currency from /api/currencies
interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  flagUrl: string;
  flagUrlSvg: string;
}

// Display type for UI
interface CurrencyDisplay {
  id: number;
  country: string;
  currencyName: string;
  currencyCode: string;
  symbol: string;
  sellRate: number;
  buyRate: number;
  lastUpdated: string;
  updatedBy: string;
  flagUrl: string;
  currencyId: number;
}

interface PaymentMethodDisplay {
  id: number;
  name: string;
  category: 'bank' | 'digital' | 'international' | 'other';
  enabled: boolean;
}

// Payment method category mapping
const getPaymentCategory = (methodType: string): 'bank' | 'digital' | 'international' | 'other' => {
  switch (methodType) {
    case 'bank': return 'bank';
    case 'digital': return 'digital';
    case 'international': return 'international';
    default: return 'other';
  }
};

// Memoized payment method item to prevent unnecessary re-renders
const PaymentMethodItem = memo(function PaymentMethodItem({ 
  pm, 
  onToggle 
}: { 
  pm: PaymentMethodDisplay; 
  onToggle: (id: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm">{pm.name}</span>
      <Button
        type="button"
        size="sm"
        variant={pm.enabled ? 'default' : 'outline'}
        className={cn(
          'h-7 px-3 text-xs',
          pm.enabled
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground'
        )}
        onClick={() => onToggle(pm.id)}
      >
        {pm.enabled ? 'Идэвхтэй' : 'Идэвхгүй'}
      </Button>
    </div>
  );
});

type TabType = 'currency' | 'payment';

export default function CurrencyPage() {
  const t = useTranslations('Currency');

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('currency');

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Currency state
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyDisplay[]>([]);
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([]);
  
  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDisplay[]>([]);
  const [allPaymentMethods, setAllPaymentMethods] = useState<PaymentMethod[]>([]);
  const [propertyPaymentMethods, setPropertyPaymentMethods] = useState<PropertyPaymentMethod[]>([]);

  // Modal states
  const [isAddCurrencyModalOpen, setIsAddCurrencyModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCurrencyForHistory, setSelectedCurrencyForHistory] = useState<CurrencyDisplay | null>(null);
  const [historyData, setHistoryData] = useState<CurrencyRate[]>([]);
  
  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<CurrencyDisplay | null>(null);
  const [editBuyRate, setEditBuyRate] = useState('');
  const [editSellRate, setEditSellRate] = useState('');
  
  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currencyToDelete, setCurrencyToDelete] = useState<CurrencyDisplay | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states for add currency
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<string>('');
  const [buyRate, setBuyRate] = useState('');
  const [sellRate, setSellRate] = useState('');

  // Fetch data on mount
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [currencyRes, currenciesRes, paymentMethodsRes, propertyPaymentRes] = await Promise.all([
        fetch('/api/currency-rates', { credentials: 'include' }),
        fetch('/api/currencies', { credentials: 'include' }),
        fetch('/api/payment-methods', { credentials: 'include' }),
        fetch('/api/property-payment-methods', { credentials: 'include' }),
      ]);

      // Process available currencies (for dropdown)
      let currencyLookup: Record<number, Currency> = {};
      if (currenciesRes.ok) {
        const currenciesData: Currency[] = await currenciesRes.json();
        setAvailableCurrencies(Array.isArray(currenciesData) ? currenciesData : []);
        // Create lookup map
        currencyLookup = (Array.isArray(currenciesData) ? currenciesData : []).reduce((acc, curr) => {
          acc[curr.id] = curr;
          return acc;
        }, {} as Record<number, Currency>);
      }

      // Process currency rates
      if (currencyRes.ok) {
        const currencyData: CurrencyRate[] = await currencyRes.json();
        setCurrencyRates(Array.isArray(currencyData) ? currencyData : []);
        
        // Convert to display format using fetched currencies
        const displayCurrencies: CurrencyDisplay[] = (Array.isArray(currencyData) ? currencyData : []).map(rate => {
          const currencyInfo = currencyLookup[rate.currency];
          return {
            id: rate.id,
            country: currencyInfo?.name || 'Unknown',
            currencyName: currencyInfo?.name || 'Unknown',
            currencyCode: currencyInfo?.code || 'UNK',
            symbol: currencyInfo?.symbol || '?',
            sellRate: parseFloat(rate.sell_rate),
            buyRate: parseFloat(rate.buy_rate),
            lastUpdated: new Date(rate.created_at).toLocaleString('mn-MN'),
            updatedBy: rate.created_by_name,
            flagUrl: currencyInfo?.flagUrl || '',
            currencyId: rate.currency,
          };
        });
        setCurrencies(displayCurrencies);
      }

      // Process payment methods
      if (paymentMethodsRes.ok) {
        const paymentData: PaymentMethod[] = await paymentMethodsRes.json();
        setAllPaymentMethods(Array.isArray(paymentData) ? paymentData : []);
      }

      // Process property payment methods
      if (propertyPaymentRes.ok) {
        const propPaymentData: PropertyPaymentMethod[] = await propertyPaymentRes.json();
        setPropertyPaymentMethods(Array.isArray(propPaymentData) ? propPaymentData : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Using hardcoded text since fetchData is called before t is available
      toast.error('Алдаа гарлаа');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Combine payment methods with enabled status
  useEffect(() => {
    const combined: PaymentMethodDisplay[] = allPaymentMethods.map(pm => ({
      id: pm.id,
      name: pm.name,
      category: getPaymentCategory(pm.method_type),
      enabled: propertyPaymentMethods.some(ppm => ppm.payment_method === pm.id && ppm.is_enabled),
    }));
    setPaymentMethods(combined);
  }, [allPaymentMethods, propertyPaymentMethods]);

  // Get selected currency details
  const selectedCurrencyDetails = useMemo(() => {
    return availableCurrencies.find(c => c.id.toString() === selectedCurrencyId);
  }, [selectedCurrencyId]);

  // Handle payment method toggle - memoized to prevent re-renders
  const togglePaymentMethod = useCallback(async (id: number) => {
    const currentMethod = paymentMethods.find(pm => pm.id === id);
    if (!currentMethod) return;

    const newEnabled = !currentMethod.enabled;
    
    // Optimistic update
    setPaymentMethods(prev =>
      prev.map(pm =>
        pm.id === id ? { ...pm, enabled: newEnabled } : pm
      )
    );

    try {
      const res = await fetch('/api/property-payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          payment_method: id,
          is_enabled: newEnabled,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update payment method');
      }
      
      toast.success(newEnabled ? t('messages.paymentEnabled') : t('messages.paymentDisabled'));
    } catch (error) {
      // Revert on error
      setPaymentMethods(prev =>
        prev.map(pm =>
          pm.id === id ? { ...pm, enabled: !newEnabled } : pm
        )
      );
      toast.error(t('messages.error'));
    }
  }, [paymentMethods, t]);

  // Open history modal
  const openHistoryModal = (currency: CurrencyDisplay) => {
    setSelectedCurrencyForHistory(currency);
    // Filter history for this currency
    const filtered = currencyRates.filter(r => r.currency === currency.currencyId);
    setHistoryData(filtered);
    setIsHistoryModalOpen(true);
  };

  // Handle add currency
  const handleAddCurrency = async () => {
    if (!selectedCurrencyId || !buyRate || !sellRate) {
      toast.error('Бүх талбарыг бөглөнө үү');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/currency-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currency: parseInt(selectedCurrencyId),
          buy_rate: parseFloat(buyRate),
          sell_rate: parseFloat(sellRate),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add currency rate');
      }

      toast.success(t('messages.currencyAdded'));
      setIsAddCurrencyModalOpen(false);
      resetForm();
      fetchData(); // Refresh data
    } catch (error) {
      toast.error(t('messages.error'));
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedCurrencyId('');
    setBuyRate('');
    setSellRate('');
  };

  // Handle edit currency - open modal with current values
  const handleEditCurrency = (currency: CurrencyDisplay) => {
    setEditingCurrency(currency);
    setEditBuyRate(currency.buyRate.toString());
    setEditSellRate(currency.sellRate.toString());
    setIsEditModalOpen(true);
  };

  // Save edited currency rate
  const handleSaveEdit = async () => {
    if (!editingCurrency) {
      toast.error(t('messages.fillAllFields'));
      return;
    }

    // Zod validation
    const formData = {
      currency: editingCurrency.currencyId,
      buy_rate: editBuyRate ? parseFloat(editBuyRate) : 0,
      sell_rate: editSellRate ? parseFloat(editSellRate) : 0,
    };
    
    const validateResult = schemaCurrencyRate.safeParse(formData);
    if (!validateResult.success) {
      const firstError = validateResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/currency-rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: editingCurrency.id,
          currency: editingCurrency.currencyId,
          buy_rate: parseFloat(editBuyRate),
          sell_rate: parseFloat(editSellRate),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update currency rate');
      }

      toast.success(t('messages.currencyUpdated'));
      setIsEditModalOpen(false);
      setEditingCurrency(null);
      fetchData();
    } catch (error) {
      toast.error(t('messages.error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete currency - open confirmation modal
  const handleDeleteCurrency = (currency: CurrencyDisplay) => {
    setCurrencyToDelete(currency);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete currency
  const confirmDeleteCurrency = async () => {
    if (!currencyToDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/currency-rates?id=${currencyToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to delete currency rate');
      }

      toast.success(t('messages.currencyDeleted'));
      setIsDeleteModalOpen(false);
      setCurrencyToDelete(null);
      fetchData();
    } catch (error) {
      toast.error(t('messages.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Payment methods grouped by category
  const groupedPaymentMethods = useMemo(() => {
    return {
      bank: paymentMethods.filter(pm => pm.category === 'bank'),
      digital: paymentMethods.filter(pm => pm.category === 'digital'),
      international: paymentMethods.filter(pm => pm.category === 'international'),
      other: paymentMethods.filter(pm => pm.category === 'other'),
    };
  }, [paymentMethods]);

  // Show loading state
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
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Валют, төлбөрийн хэрэгсэл</h1>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Left Sidebar - Tab Navigation */}
        <Card className="w-64 shrink-0">
          <CardContent className="p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('currency')}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left',
                  activeTab === 'currency'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <IconChevronRight className={cn('h-4 w-4 transition-transform', activeTab === 'currency' && 'rotate-90')} />
                {t('currency')}
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left',
                  activeTab === 'payment'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <IconChevronRight className={cn('h-4 w-4 transition-transform', activeTab === 'payment' && 'rotate-90')} />
                {t('paymentMethods')}
              </button>
            </nav>
          </CardContent>
        </Card>

        {/* Right Content Area */}
        <Card className="flex-1">
          <CardContent className="p-6">
            {activeTab === 'currency' ? (
              <>
                {/* Currency Tab Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">{t('currency')}</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={fetchData}
                      title="Шинэчлэх"
                    >
                      <IconRefresh className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setIsAddCurrencyModalOpen(true)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <IconPlus className="mr-2 h-4 w-4" />
                      {t('add')}
                    </Button>
                  </div>
                </div>

                {/* Currency Table */}
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="font-medium">{t('table.country')}</TableHead>
                        <TableHead className="font-medium">{t('table.currency')}</TableHead>
                        <TableHead className="font-medium">{t('table.code')}</TableHead>
                        <TableHead className="font-medium">{t('table.symbol')}</TableHead>
                        <TableHead className="font-medium">{t('table.sellRate')}</TableHead>
                        <TableHead className="font-medium">{t('table.buyRate')}</TableHead>
                        <TableHead className="font-medium">{t('table.lastUpdated')}</TableHead>
                        <TableHead className="font-medium">{t('table.updatedBy')}</TableHead>
                        <TableHead className="font-medium w-24"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currencies.map((currency) => (
                        <TableRow key={currency.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {currency.flagUrl ? (
                                <img 
                                  src={currency.flagUrl} 
                                  alt={currency.currencyCode} 
                                  className="w-6 h-4 object-cover rounded-sm"
                                />
                              ) : (
                                <span className="w-6 h-4 bg-muted rounded-sm" />
                              )}
                              <span>{currency.country}</span>
                            </div>
                          </TableCell>
                          <TableCell>{currency.currencyName}</TableCell>
                          <TableCell>{currency.currencyCode}</TableCell>
                          <TableCell>{currency.symbol}</TableCell>
                          <TableCell>{currency.sellRate.toFixed(2)}</TableCell>
                          <TableCell>{currency.buyRate.toFixed(2)}</TableCell>
                          <TableCell>{currency.lastUpdated}</TableCell>
                          <TableCell>{currency.updatedBy}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleEditCurrency(currency)}
                                title="Засах"
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openHistoryModal(currency)}
                                title="Түүх харах"
                              >
                                <IconHistory className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteCurrency(currency)}
                                title="Устгах"
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <>
                {/* Payment Methods Tab */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">{t('paymentMethods')}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t('paymentMethodsDescription')}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-8">
                  {/* Bank Cards */}
                  <div>
                    <h3 className="font-medium mb-4 text-sm">{t('paymentCategories.bank')}</h3>
                    <div className="space-y-2">
                      {groupedPaymentMethods.bank.map((pm) => (
                        <PaymentMethodItem key={pm.id} pm={pm} onToggle={togglePaymentMethod} />
                      ))}
                    </div>
                  </div>

                  {/* Digital Payments */}
                  <div>
                    <h3 className="font-medium mb-4 text-sm">{t('paymentCategories.digital')}</h3>
                    <div className="space-y-2">
                      {groupedPaymentMethods.digital.map((pm) => (
                        <PaymentMethodItem key={pm.id} pm={pm} onToggle={togglePaymentMethod} />
                      ))}
                    </div>
                  </div>

                  {/* International */}
                  <div>
                    <h3 className="font-medium mb-4 text-sm">{t('paymentCategories.international')}</h3>
                    <div className="space-y-2">
                      {groupedPaymentMethods.international.map((pm) => (
                        <PaymentMethodItem key={pm.id} pm={pm} onToggle={togglePaymentMethod} />
                      ))}
                    </div>
                  </div>

                  {/* Other */}
                  <div>
                    <h3 className="font-medium mb-4 text-sm">{t('paymentCategories.other')}</h3>
                    <div className="space-y-2">
                      {groupedPaymentMethods.other.map((pm) => (
                        <PaymentMethodItem key={pm.id} pm={pm} onToggle={togglePaymentMethod} />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Currency Modal */}
      <Dialog open={isAddCurrencyModalOpen} onOpenChange={setIsAddCurrencyModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('addCurrency')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Currency Selection Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('form.currency')}</Label>
                <Select value={selectedCurrencyId} onValueChange={setSelectedCurrencyId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCurrencies.map((currency) => (
                      <SelectItem key={currency.id} value={currency.id.toString()}>
                        <div className="flex items-center gap-2">
                          {currency.flagUrl && (
                            <img 
                              src={currency.flagUrl} 
                              alt={currency.code} 
                              className="w-5 h-3 object-cover rounded-sm"
                            />
                          )}
                          <span>{currency.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('form.code')}</Label>
                <Input
                  value={selectedCurrencyDetails?.code || ''}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('form.symbol')}</Label>
                <Input
                  value={selectedCurrencyDetails?.symbol || ''}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            {/* Exchange Rates Section */}
            <div className="space-y-4">
              <h3 className="font-medium border-b pb-2">{t('exchangeRates')}</h3>

              {/* Buy Rate - 1 Foreign Currency = X MNT */}
              <div className="space-y-2">
                <Label>{t('form.buyRate')}</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      type="number"
                      value="1.00"
                      readOnly
                      className="bg-muted"
                    />
                    <span className="text-lg font-medium w-8">{selectedCurrencyDetails?.symbol || '$'}</span>
                  </div>
                  <span className="text-xl">=</span>
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      type="number"
                      value={buyRate}
                      onChange={(e) => setBuyRate(e.target.value)}
                      step="0.01"
                      placeholder="0.00"
                    />
                    <span className="text-sm font-medium">төгрөг</span>
                  </div>
                </div>
              </div>

              {/* Sell Rate - 1 Foreign Currency = X MNT */}
              <div className="space-y-2">
                <Label>{t('form.sellRate')}</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      type="number"
                      value="1.00"
                      readOnly
                      className="bg-muted"
                    />
                    <span className="text-lg font-medium w-8">{selectedCurrencyDetails?.symbol || '$'}</span>
                  </div>
                  <span className="text-xl">=</span>
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      type="number"
                      value={sellRate}
                      onChange={(e) => setSellRate(e.target.value)}
                      step="0.01"
                      placeholder="0.00"
                    />
                    <span className="text-sm font-medium">төгрөг</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleAddCurrency}
              disabled={isSaving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSaving && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
          <VisuallyHidden.Root>
            <DialogHeader>
              <DialogTitle>{t('currencyHistory')}</DialogTitle>
            </DialogHeader>
          </VisuallyHidden.Root>
          {/* Header */}
          <div className="bg-primary px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-foreground">{t('currencyHistory')}</h2>
            <button
              onClick={() => setIsHistoryModalOpen(false)}
              className="text-primary-foreground hover:bg-primary/80 rounded p-1 transition-colors"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {historyData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Өмнөх түүх байхгүй
              </div>
            ) : (
              <>
                <p className="mb-4 font-medium">
                  {selectedCurrencyForHistory?.country} ({selectedCurrencyForHistory?.symbol})
                </p>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="font-medium">{t('table.sellRate')}</TableHead>
                        <TableHead className="font-medium">{t('table.buyRate')}</TableHead>
                        <TableHead className="font-medium">{t('table.lastUpdated')}</TableHead>
                        <TableHead className="font-medium">{t('table.updatedBy')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyData.map((history) => (
                        <TableRow key={history.id}>
                          <TableCell>{parseFloat(history.sell_rate).toFixed(2)}</TableCell>
                          <TableCell>{parseFloat(history.buy_rate).toFixed(2)}</TableCell>
                          <TableCell>{new Date(history.created_at).toLocaleString('mn-MN')}</TableCell>
                          <TableCell>{history.created_by_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Currency Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Валютын ханш засах</DialogTitle>
            <DialogDescription>
              {editingCurrency?.currencyName} ({editingCurrency?.currencyCode}) валютын ханшийг шинэчлэх
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Buy Rate */}
            <div className="space-y-2">
              <Label>{t('form.buyRate')}</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    type="number"
                    value="1.00"
                    readOnly
                    className="bg-muted"
                  />
                  <span className="text-lg font-medium w-8">{editingCurrency?.symbol || '$'}</span>
                </div>
                <span className="text-xl">=</span>
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    type="number"
                    value={editBuyRate}
                    onChange={(e) => setEditBuyRate(e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                  />
                  <span className="text-sm font-medium">төгрөг</span>
                </div>
              </div>
            </div>

            {/* Sell Rate */}
            <div className="space-y-2">
              <Label>{t('form.sellRate')}</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    type="number"
                    value="1.00"
                    readOnly
                    className="bg-muted"
                  />
                  <span className="text-lg font-medium w-8">{editingCurrency?.symbol || '$'}</span>
                </div>
                <span className="text-xl">=</span>
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    type="number"
                    value={editSellRate}
                    onChange={(e) => setEditSellRate(e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                  />
                  <span className="text-sm font-medium">төгрөг</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSaving}
            >
              {t('messages.cancel') || 'Болих'}
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving}
            >
              {isSaving && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('messages.deleteTitle') || 'Валют устгах'}</DialogTitle>
            <DialogDescription>
              {t('messages.deleteConfirm', { name: `${currencyToDelete?.currencyName} (${currencyToDelete?.currencyCode})` }) || `"${currencyToDelete?.currencyName} (${currencyToDelete?.currencyCode})" валютыг устгахдаа итгэлтэй байна уу?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              {t('messages.cancel') || 'Болих'}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteCurrency}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('messages.deleting') || 'Устгаж байна...'}
                </>
              ) : t('messages.delete') || 'Устгах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
