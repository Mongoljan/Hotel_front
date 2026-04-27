'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import {
  CheckCircle,
  Plus,
  MoreHorizontal,
  Star,
  Building2,
  Landmark,
} from 'lucide-react';
import {
  RightPanel,
  RightPanelContent,
  RightPanelFooter,
} from '@/components/ui/right-panel';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const banks = [
  { id: 1, name: 'Khan Bank', code: 'K', shortCode: 'khan' },
  { id: 2, name: 'Ариг банк', code: 'А', shortCode: '210000' },
  { id: 3, name: 'Богд банк', code: 'Б', shortCode: '380000' },
  { id: 4, name: 'Golomt Bank', code: 'G', shortCode: 'golomt' },
  { id: 5, name: 'TDB Bank', code: 'T', shortCode: 'tdb' },
];

const currencies = [
  { id: 1, code: 'MNT', name: 'MNT' },
  { id: 2, code: 'USD', name: 'USD' },
  { id: 3, code: 'CNY', name: 'CNY' },
];

export interface BankAccountDisplay {
  id: string | number;
  bankName: string;
  accountNumber: string;
  holder?: string;
  currency: string;
  isActive: boolean;
  isPrimary?: boolean;
}

interface BankAccountConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: any) => Promise<void>;
  accounts?: BankAccountDisplay[];
  onToggleAccount?: (id: string | number, active: boolean) => void;
  /**
   * Which view to show when the panel opens.
   * - 'hub' (default): the "Дансны тохиргоо" hub with featured invoice account + active accounts list.
   * - 'add': open straight into the "Данс нэмэх" form as a single panel (no stacked list).
   */
  initialView?: 'hub' | 'add';
}

interface BankAccountFormProps {
  onSave: (config: any) => Promise<void>;
  onCancel: () => void;
}

function BankAccountForm({ onSave, onCancel }: BankAccountFormProps) {
  const [selectedBank, setSelectedBank] = useState<typeof banks[0] | null>(null);
  const [formData, setFormData] = useState({
    iban: '',
    accountNumber: '',
    accountHolder: '',
    currency: 'MNT',
    activateImmediately: true,
    showOnAllBookings: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    bank: '',
    iban: '',
    accountNumber: '',
    accountHolder: '',
  });

  const validateForm = () => {
    const newErrors = { bank: '', iban: '', accountNumber: '', accountHolder: '' };
    if (!selectedBank) newErrors.bank = 'Банк сонгоно уу';
    if (!formData.iban.trim()) newErrors.iban = 'IBAN оруулна уу';
    if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Дансны дугаар оруулна уу';
    if (!formData.accountHolder.trim()) newErrors.accountHolder = 'Данс эзэмшигчийн нэр оруулна уу';
    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e !== '');
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Бүх шаардлагатай талбарыг бөглөнө үү');
      return;
    }
    setLoading(true);
    try {
      const config = {
        payment_type: 'bank_account',
        bank_id: selectedBank!.id,
        iban: formData.iban,
        account_number: formData.accountNumber,
        account_holder: formData.accountHolder,
        currency_id: currencies.find((c) => c.code === formData.currency)?.id || 1,
        is_active: formData.activateImmediately,
        show_on_booking: formData.showOnAllBookings,
      };
      await onSave(config);
      toast.success('Данс амжилттай нэмэгдлээ');
    } catch (error) {
      console.error('Error saving bank account:', error);
      toast.error('Данс нэмэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base font-medium">Банк сонгох</Label>
        {errors.bank && <p className="text-sm text-destructive">{errors.bank}</p>}
        <div className="grid grid-cols-3 gap-3">
          {banks.map((bank) => (
            <Button
              key={bank.id}
              variant="outline"
              className={cn(
                'h-16 flex flex-col gap-1 p-2 bg-background',
                selectedBank?.id === bank.id && 'border-primary ring-1 ring-primary bg-primary/5',
                errors.bank && !selectedBank && 'border-destructive'
              )}
              onClick={() => {
                setSelectedBank(bank);
                setErrors((prev) => ({ ...prev, bank: '' }));
              }}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded flex items-center justify-center text-sm font-bold',
                  selectedBank?.id === bank.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                )}
              >
                {bank.code}
              </div>
              <span className="text-xs text-center">{bank.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bankName">Товч нэр</Label>
        <Input
          id="bankName"
          value={selectedBank ? `Данс - ${selectedBank.name}` : ''}
          placeholder="Данс - Хаанбанк"
          readOnly
          className="bg-muted"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="iban">IBAN</Label>
        <Input
          id="iban"
          placeholder="MN44 0005 0023 4492 1198"
          value={formData.iban}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, iban: e.target.value }));
            setErrors((prev) => ({ ...prev, iban: '' }));
          }}
          className={errors.iban ? 'border-destructive' : ''}
        />
        {errors.iban && <p className="text-sm text-destructive">{errors.iban}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountNumber">Дансны дугаар</Label>
        <Input
          id="accountNumber"
          placeholder="5023 4492 1198"
          value={formData.accountNumber}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, accountNumber: e.target.value }));
            setErrors((prev) => ({ ...prev, accountNumber: '' }));
          }}
          className={errors.accountNumber ? 'border-destructive' : ''}
        />
        {errors.accountNumber && (
          <p className="text-sm text-destructive">{errors.accountNumber}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountHolder">Данс эзэмшигчийн нэр</Label>
        <Input
          id="accountHolder"
          placeholder="СТРАКТУР БЛУ ХХК"
          value={formData.accountHolder}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, accountHolder: e.target.value }));
            setErrors((prev) => ({ ...prev, accountHolder: '' }));
          }}
          className={errors.accountHolder ? 'border-destructive' : ''}
        />
        {errors.accountHolder && (
          <p className="text-sm text-destructive">{errors.accountHolder}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Энэ нэр нь бүх санхүүгийн тайлан дээр яг энэ хэлбэрээр харагдана.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Валют</Label>
        <div className="flex gap-2">
          {currencies.map((currency) => (
            <Button
              key={currency.code}
              size="sm"
              variant={formData.currency === currency.code ? 'default' : 'outline'}
              onClick={() =>
                setFormData((prev) => ({ ...prev, currency: currency.code }))
              }
            >
              {currency.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <Label className="text-base font-medium">ДАНСНЫ ТОХИРГОО</Label>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Төлөв</p>
              <p className="text-xs text-muted-foreground mt-1">
                Дансыг шууд идэвхжүүлэх
              </p>
            </div>
            <Switch
              checked={formData.activateImmediately}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, activateImmediately: checked }))
              }
            />
          </div>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Бүх зочны нэхэмжлэх дээр харуулах</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Үүнийг идэвхжүүлснээр үүсгэсэн нэхэмжлэх болгон дээр банкны мэдээлэл
                автоматаар багтах болно
              </p>
            </div>
            <Switch
              checked={formData.showOnAllBookings}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, showOnAllBookings: checked }))
              }
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Хаах
        </Button>
        <Button onClick={handleSave} className="flex-1" disabled={loading}>
          {loading ? 'Хадгалж байна...' : 'Бүртгэх'}
        </Button>
      </div>
    </div>
  );
}

export function BankAccountConfigPanel({
  isOpen,
  onClose,
  onSave = async () => {},
  accounts = [],
  onToggleAccount,
  initialView = 'hub',
}: BankAccountConfigPanelProps) {
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isAddOnly = initialView === 'add';

  const primary = accounts.find((a) => a.isPrimary) || accounts[0];

  const handleSaveAccount = async (config: any) => {
    await onSave(config);
    setShowNewAccountForm(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      // When opened directly into the add form, auto-close the panel
      // after success so the user returns to the page.
      if (isAddOnly) onClose();
    }, 2000);
  };

  const handleClosePrimary = () => {
    setShowNewAccountForm(false);
    onClose();
  };

  const SuccessScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        Шинэ дансны мэдээлэл амжилттай бүртгэгдлээ.
      </h3>
      <Button onClick={() => setShowSuccess(false)} className="mt-4">
        Хаах
      </Button>
    </div>
  );

  return (
    <>
      {isAddOnly ? (
        // Single-panel add-form mode (entry: "Данс нэмэх" card button)
        <RightPanel
          isOpen={isOpen}
          onClose={onClose}
          title="Данс нэмэх"
          description="Дансны мэдээлэл"
          width="w-[400px] sm:w-[460px]"
        >
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <SuccessScreen />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full"
              >
                <RightPanelContent>
                  <BankAccountForm
                    onSave={handleSaveAccount}
                    onCancel={onClose}
                  />
                </RightPanelContent>
              </motion.div>
            )}
          </AnimatePresence>
        </RightPanel>
      ) : (
        <>
        <RightPanel
        isOpen={isOpen}
        onClose={handleClosePrimary}
        title="Дансны тохиргоо"
        width="w-[400px] sm:w-[460px]"
        rightOffset="right-0"
      >
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <SuccessScreen />
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              <RightPanelContent>
                {/* Primary / featured account */}
                <Card className="p-4 mb-6 border-l-4 border-l-primary">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Нэхэмжлэх данс
                    </div>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  {primary ? (
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground mb-1">
                          Банкны нэр
                        </div>
                        <div className="font-semibold uppercase">{primary.bankName}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground mb-1">
                          Дансны дугаар
                        </div>
                        <div className="font-semibold">{primary.accountNumber}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground mb-1">
                          Хүлээн авагч
                        </div>
                        <div className="font-semibold uppercase">
                          {primary.holder || '—'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Үндсэн данс бүртгээгүй байна
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                    Энэ мэдээлэл таны бүх гаргасан нэхэмжлэх дээр автоматаар хэвлэгдэнэ.
                  </p>
                </Card>

                {/* Active accounts list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground text-sm">
                        Идэвхтэй дансууд
                      </h3>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Дансны удирдлага
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setShowNewAccountForm(true)}
                      className="h-8"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Данс нэмэх
                    </Button>
                  </div>

                  {accounts.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-8 border border-dashed rounded-lg">
                      Данс бүртгээгүй байна
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {accounts.map((acc) => (
                        <Card
                          key={acc.id}
                          className="p-3 hover:border-primary/40 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={cn(
                                  'w-9 h-9 rounded-md flex items-center justify-center shrink-0',
                                  acc.isPrimary
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted text-foreground'
                                )}
                              >
                                {acc.isPrimary ? (
                                  <Building2 className="w-4 h-4" />
                                ) : (
                                  <Landmark className="w-4 h-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {acc.bankName}{' '}
                                  <span className="text-xs text-muted-foreground font-normal">
                                    ({acc.isPrimary ? 'Үндсэн' : 'Валют'})
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {acc.accountNumber} • {acc.currency}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                                Нэхэмжлэх дээр харуулах
                              </span>
                              <Switch
                                checked={acc.isActive}
                                onCheckedChange={(checked) =>
                                  onToggleAccount?.(acc.id, checked)
                                }
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </RightPanelContent>

              <RightPanelFooter>
                <Button
                  variant="outline"
                  onClick={handleClosePrimary}
                  className="w-full"
                >
                  ← Буцах
                </Button>
              </RightPanelFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </RightPanel>

      {/* Secondary panel — slides out from behind primary */}
      <RightPanel
        isOpen={isOpen && showNewAccountForm && !showSuccess}
        onClose={() => setShowNewAccountForm(false)}
        title="Данс нэмэх"
        description="Дансны мэдээлэл"
        width="w-[400px] sm:w-[460px]"
        rightOffset="right-[400px] sm:right-[460px]"
        showOverlay={false}
        slideFrom="inner-right"
      >
        <RightPanelContent>
          <BankAccountForm
            onSave={handleSaveAccount}
            onCancel={() => setShowNewAccountForm(false)}
          />
        </RightPanelContent>
      </RightPanel>
        </>
      )}
    </>
  );
}
