'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  IconPlus,
  IconEdit,
  IconHistory,
  IconX,
  IconChevronRight,
  IconLoader2,
} from '@tabler/icons-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
interface Currency {
  id: number;
  country: string;
  countryCode: string;
  currencyName: string;
  currencyCode: string;
  symbol: string;
  sellRate: number;
  buyRate: number;
  lastUpdated: string;
  updatedBy: string;
  flagEmoji: string;
}

interface CurrencyHistory {
  id: number;
  currencyCode: string;
  sellRate: number;
  buyRate: number;
  startDate: string;
  endDate: string;
  admin: string;
  flagEmoji: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  category: 'bank' | 'digital' | 'international' | 'other';
  enabled: boolean;
}

// Mock data
const mockCurrencies: Currency[] = [
  {
    id: 1,
    country: 'Mongolia',
    countryCode: 'MN',
    currencyName: 'Tugrik',
    currencyCode: 'MNT',
    symbol: '₮',
    sellRate: 1.0,
    buyRate: 1.0,
    lastUpdated: '2024-10-20 16:25:45',
    updatedBy: 'Zol',
    flagEmoji: '🇲🇳',
  },
  {
    id: 2,
    country: 'China',
    countryCode: 'CN',
    currencyName: 'Yuan',
    currencyCode: 'CNY',
    symbol: '¥',
    sellRate: 474.0,
    buyRate: 474.0,
    lastUpdated: '2024-10-20 16:25:45',
    updatedBy: 'Batjargal',
    flagEmoji: '🇨🇳',
  },
  {
    id: 3,
    country: 'Japan',
    countryCode: 'JP',
    currencyName: 'Yen',
    currencyCode: 'JPY',
    symbol: '¥',
    sellRate: 20.0,
    buyRate: 20.0,
    lastUpdated: '2024-10-20 16:25:45',
    updatedBy: 'Batjargal',
    flagEmoji: '🇯🇵',
  },
  {
    id: 4,
    country: 'United States',
    countryCode: 'US',
    currencyName: 'US dollar',
    currencyCode: 'USD',
    symbol: '$',
    sellRate: 4350.0,
    buyRate: 4350.0,
    lastUpdated: '2024-10-20 16:25:45',
    updatedBy: 'Mo',
    flagEmoji: '🇺🇸',
  },
];

const mockCurrencyHistory: CurrencyHistory[] = [
  { id: 1, currencyCode: 'USD', sellRate: 1.0, buyRate: 1.0, startDate: '2024-10-20 16:25:45', endDate: '2024-10-20 16:25:45', admin: 'Zol', flagEmoji: '🇺🇸' },
  { id: 2, currencyCode: 'USD', sellRate: 474.0, buyRate: 474.0, startDate: '2024-10-20 16:25:45', endDate: '2024-10-20 16:25:45', admin: 'Batjargal', flagEmoji: '🇺🇸' },
  { id: 3, currencyCode: 'USD', sellRate: 20.0, buyRate: 20.0, startDate: '2024-10-20 16:25:45', endDate: '2024-10-20 16:25:45', admin: 'Batjargal', flagEmoji: '🇺🇸' },
  { id: 4, currencyCode: 'USD', sellRate: 4350.0, buyRate: 4350.0, startDate: '2024-10-20 16:25:45', endDate: '2024-10-20 16:25:45', admin: 'Mo', flagEmoji: '🇺🇸' },
];

const mockPaymentMethods: PaymentMethod[] = [
  // Bank Cards
  { id: 'golomt', name: 'Голомт банк', category: 'bank', enabled: false },
  { id: 'khan', name: 'Хаан банк', category: 'bank', enabled: false },
  { id: 'xac', name: 'ХАС банк', category: 'bank', enabled: false },
  { id: 'tdb', name: 'Худалдаа хөгжлийн банк', category: 'bank', enabled: false },
  { id: 'state', name: 'Төрийн банк', category: 'bank', enabled: false },
  { id: 'arig', name: 'Ариг банк', category: 'bank', enabled: false },
  { id: 'bogd', name: 'Богд банк', category: 'bank', enabled: false },
  { id: 'capitron', name: 'Капитрон банк', category: 'bank', enabled: false },
  { id: 'mobile_bank', name: 'Mobile-аар', category: 'bank', enabled: false },
  // Digital Payments
  { id: 'monpay', name: 'MonPay', category: 'digital', enabled: false },
  { id: 'pass', name: 'PASS', category: 'digital', enabled: false },
  { id: 'qpay', name: 'QPAY', category: 'digital', enabled: false },
  { id: 'socialpay', name: 'SocialPay', category: 'digital', enabled: false },
  { id: 'ardapp', name: 'ArdApp', category: 'digital', enabled: false },
  { id: 'hipay', name: 'Hi-Pay', category: 'digital', enabled: false },
  { id: 'lendmn', name: 'Lendmn', category: 'digital', enabled: false },
  { id: 'mostmoney', name: 'MostMoney', category: 'digital', enabled: false },
  { id: 'omniway', name: 'Omniway', category: 'digital', enabled: false },
  { id: 'pocket', name: 'Pocket', category: 'digital', enabled: false },
  // International
  { id: 'visa', name: 'VISA', category: 'international', enabled: false },
  { id: 'amex', name: 'American Express', category: 'international', enabled: false },
  { id: 'mastercard', name: 'MasterCard', category: 'international', enabled: false },
  { id: 'jcb', name: 'JCB', category: 'international', enabled: false },
  { id: 'unionpay', name: 'UnionPay', category: 'international', enabled: false },
  { id: 'paypal', name: 'PayPal', category: 'international', enabled: false },
  // Other
  { id: 'cash', name: 'Бэлэн мөнгө', category: 'other', enabled: false },
  { id: 'credit', name: 'Кредитээр', category: 'other', enabled: false },
  { id: 'bonus', name: 'Бонус', category: 'other', enabled: false },
  { id: 'giftcard', name: 'Бэлгийн карт', category: 'other', enabled: false },
  { id: 'mobile_other', name: 'Mobile-аар', category: 'other', enabled: false },
];

const availableCurrencies = [
  { code: 'USD', name: 'US dollar', symbol: '$', country: 'United States', flagEmoji: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', country: 'European Union', flagEmoji: '🇪🇺' },
  { code: 'CNY', name: 'Yuan', symbol: '¥', country: 'China', flagEmoji: '🇨🇳' },
  { code: 'JPY', name: 'Yen', symbol: '¥', country: 'Japan', flagEmoji: '🇯🇵' },
  { code: 'KRW', name: 'Won', symbol: '₩', country: 'South Korea', flagEmoji: '🇰🇷' },
  { code: 'RUB', name: 'Ruble', symbol: '₽', country: 'Russia', flagEmoji: '🇷🇺' },
  { code: 'GBP', name: 'Pound', symbol: '£', country: 'United Kingdom', flagEmoji: '🇬🇧' },
];

type TabType = 'currency' | 'payment';

export default function CurrencyPage() {
  const t = useTranslations('Currency');

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('currency');

  // Currency state
  const [currencies, setCurrencies] = useState<Currency[]>(mockCurrencies);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);

  // Modal states
  const [isAddCurrencyModalOpen, setIsAddCurrencyModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCurrencyForHistory, setSelectedCurrencyForHistory] = useState<Currency | null>(null);
  const [historyData, setHistoryData] = useState<CurrencyHistory[]>([]);

  // Form states for add currency
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState('');
  const [buyRate, setBuyRate] = useState('1.00');
  const [sellRate, setSellRate] = useState('1.00');

  // Loading states
  const [isSaving, setIsSaving] = useState(false);

  // Get selected currency details
  const selectedCurrencyDetails = useMemo(() => {
    return availableCurrencies.find(c => c.code === selectedCurrencyCode);
  }, [selectedCurrencyCode]);

  // Handle payment method toggle
  const togglePaymentMethod = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(pm =>
        pm.id === id ? { ...pm, enabled: !pm.enabled } : pm
      )
    );
  };

  // Open history modal
  const openHistoryModal = (currency: Currency) => {
    setSelectedCurrencyForHistory(currency);
    // Filter history for this currency
    const filtered = mockCurrencyHistory.filter(h => h.currencyCode === currency.currencyCode);
    setHistoryData(filtered);
    setIsHistoryModalOpen(true);
  };

  // Handle add currency
  const handleAddCurrency = async () => {
    if (!selectedCurrencyCode || !buyRate || !sellRate) {
      toast.error('Бүх талбарыг бөглөнө үү');
      return;
    }

    setIsSaving(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 500));

      const currencyDetails = availableCurrencies.find(c => c.code === selectedCurrencyCode);
      if (currencyDetails) {
        const newCurrency: Currency = {
          id: currencies.length + 1,
          country: currencyDetails.country,
          countryCode: selectedCurrencyCode.substring(0, 2),
          currencyName: currencyDetails.name,
          currencyCode: selectedCurrencyCode,
          symbol: currencyDetails.symbol,
          sellRate: parseFloat(sellRate),
          buyRate: parseFloat(buyRate),
          lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19),
          updatedBy: 'Admin',
          flagEmoji: currencyDetails.flagEmoji,
        };
        setCurrencies(prev => [...prev, newCurrency]);
      }

      toast.success('Валют амжилттай нэмэгдлээ');
      setIsAddCurrencyModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Алдаа гарлаа');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedCurrencyCode('');
    setBuyRate('1.00');
    setSellRate('1.00');
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
                  <Button
                    onClick={() => setIsAddCurrencyModalOpen(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <IconPlus className="mr-2 h-4 w-4" />
                    {t('add')}
                  </Button>
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
                              <span className="text-lg">{currency.flagEmoji}</span>
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
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openHistoryModal(currency)}
                              >
                                <IconHistory className="h-4 w-4" />
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
                    <div className="space-y-3">
                      {groupedPaymentMethods.bank.map((pm) => (
                        <label key={pm.id} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={pm.enabled}
                            onCheckedChange={() => togglePaymentMethod(pm.id)}
                          />
                          <span className="text-sm">{pm.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Digital Payments */}
                  <div>
                    <h3 className="font-medium mb-4 text-sm">{t('paymentCategories.digital')}</h3>
                    <div className="space-y-3">
                      {groupedPaymentMethods.digital.map((pm) => (
                        <label key={pm.id} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={pm.enabled}
                            onCheckedChange={() => togglePaymentMethod(pm.id)}
                          />
                          <span className="text-sm">{pm.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* International */}
                  <div>
                    <h3 className="font-medium mb-4 text-sm">{t('paymentCategories.international')}</h3>
                    <div className="space-y-3">
                      {groupedPaymentMethods.international.map((pm) => (
                        <label key={pm.id} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={pm.enabled}
                            onCheckedChange={() => togglePaymentMethod(pm.id)}
                          />
                          <span className="text-sm">{pm.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Other */}
                  <div>
                    <h3 className="font-medium mb-4 text-sm">{t('paymentCategories.other')}</h3>
                    <div className="space-y-3">
                      {groupedPaymentMethods.other.map((pm) => (
                        <label key={pm.id} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={pm.enabled}
                            onCheckedChange={() => togglePaymentMethod(pm.id)}
                          />
                          <span className="text-sm">{pm.name}</span>
                        </label>
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
                <Select value={selectedCurrencyCode} onValueChange={setSelectedCurrencyCode}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCurrencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.name}
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

              {/* Buy Rate */}
              <div className="space-y-2">
                <Label>{t('form.buyRate')}</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      type="number"
                      value={buyRate}
                      onChange={(e) => setBuyRate(e.target.value)}
                      step="0.01"
                    />
                    <span className="text-lg font-medium w-8">{selectedCurrencyDetails?.symbol || '$'}</span>
                  </div>
                  <span className="text-xl">=</span>
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      type="number"
                      value="1.00"
                      readOnly
                      className="bg-muted"
                    />
                    <span className="text-lg font-medium w-8">₮</span>
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
                    <span className="text-lg font-medium w-8">₮</span>
                  </div>
                  <span className="text-xl">=</span>
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      type="number"
                      value={sellRate}
                      onChange={(e) => setSellRate(e.target.value)}
                      step="0.01"
                    />
                    <span className="text-lg font-medium w-8">{selectedCurrencyDetails?.symbol || '$'}</span>
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
                        <TableHead className="font-medium"></TableHead>
                        <TableHead className="font-medium">{t('table.sellRate')}</TableHead>
                        <TableHead className="font-medium">{t('table.buyRate')}</TableHead>
                        <TableHead className="font-medium">{t('table.startDate')}</TableHead>
                        <TableHead className="font-medium">{t('table.endDate')}</TableHead>
                        <TableHead className="font-medium">{t('table.admin')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyData.map((history) => (
                        <TableRow key={history.id}>
                          <TableCell>
                            <span className="text-lg">{history.flagEmoji}</span>
                          </TableCell>
                          <TableCell>{history.currencyCode} {history.sellRate.toFixed(2)}</TableCell>
                          <TableCell>{history.buyRate.toFixed(2)}</TableCell>
                          <TableCell>{history.startDate}</TableCell>
                          <TableCell>{history.endDate}</TableCell>
                          <TableCell>{history.admin}</TableCell>
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
    </div>
  );
}
