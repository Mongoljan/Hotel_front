'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CheckCircle } from 'lucide-react';
import { RightPanel, RightPanelContent, RightPanelFooter } from '@/components/ui/right-panel';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTheme } from '@/context/ThemeContext';

// Bank configurations matching API data
const banks = [
  { id: 1, name: 'Khan Bank', code: 'K', shortCode: 'khan', bgColor: 'bg-green-600' },
  { id: 2, name: 'Ариг банк', code: 'А', shortCode: '210000', bgColor: 'bg-blue-600' },
  { id: 3, name: 'Богд банк', code: 'Б', shortCode: '380000', bgColor: 'bg-purple-600' },
  { id: 4, name: 'Golomt Bank', code: 'G', shortCode: 'golomt', bgColor: 'bg-blue-600' },
  { id: 5, name: 'TDB Bank', code: 'T', shortCode: 'tdb', bgColor: 'bg-orange-600' }
];

// Currency options
const currencies = [
  { id: 1, code: 'MNT', name: 'MNT' },
  { id: 2, code: 'USD', name: 'USD' },
  { id: 3, code: 'CNY', name: 'CNY' }
];

interface BankAccountConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: any) => Promise<void>;
}

interface BankAccountFormProps {
  onSave: (config: any) => Promise<void>;
  onCancel: () => void;
}

function BankAccountForm({ onSave, onCancel }: BankAccountFormProps) {
  const { themeColor } = useTheme();
  const [selectedBank, setSelectedBank] = useState<typeof banks[0] | null>(null);
  const [formData, setFormData] = useState({
    iban: '',
    accountNumber: '',
    accountHolder: '',
    currency: 'MNT',
    autoPayment: false
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!selectedBank) {
      toast.error('Банк сонгоно уу');
      return;
    }

    if (!formData.iban.trim() || !formData.accountNumber.trim() || !formData.accountHolder.trim()) {
      toast.error('Бүх талбарыг бөглөнө үү');
      return;
    }

    setLoading(true);
    try {
      const config = {
        payment_type: 'bank_account',
        bank_id: selectedBank.id,
        iban: formData.iban,
        account_number: formData.accountNumber,
        account_holder: formData.accountHolder,
        currency_id: currencies.find(c => c.code === formData.currency)?.id || 1,
        show_on_booking: formData.autoPayment,
        is_active: true
      };

      await onSave(config);
      toast.success('Данс амжилттай нэмэгдлээ');
    } catch (error) {
      toast.error('Данс нэмэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bank Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Банк сонгох</Label>
        <div className="grid grid-cols-3 gap-3">
          {banks.map((bank) => (
            <Button
              key={bank.id}
              variant={selectedBank?.id === bank.id ? "default" : "outline"}
              className={cn(
                "h-16 flex flex-col gap-1 p-2",
                selectedBank?.id === bank.id && "border-blue-500 bg-blue-50"
              )}
              onClick={() => setSelectedBank(bank)}
            >
              <div className={cn(
                "w-8 h-8 rounded text-white flex items-center justify-center text-sm font-bold",
                bank.bgColor
              )}>
                {bank.code}
              </div>
              <span className="text-xs text-center">{bank.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Төвчаар (Auto-filled bank name) */}
      <div className="space-y-2">
        <Label htmlFor="bankName">Төвчаар</Label>
        <Input
          id="bankName"
          value={selectedBank ? `Данс - ${selectedBank.name}` : ''}
          placeholder="Данс - Кханбанк"
          readOnly
          className="bg-gray-50"
        />
      </div>

      {/* IBAN */}
      <div className="space-y-2">
        <Label htmlFor="iban">IBAN</Label>
        <Input
          id="iban"
          placeholder="000000"
          value={formData.iban}
          onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
        />
      </div>

      {/* Account Number */}
      <div className="space-y-2">
        <Label htmlFor="accountNumber">Данчны дугаар</Label>
        <Input
          id="accountNumber"
          placeholder="5000-0000-00"
          value={formData.accountNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
        />
      </div>

      {/* Account Holder */}
      <div className="space-y-2">
        <Label htmlFor="accountHolder">Данс эзэмшигч-ийн нэр</Label>
        <Input
          id="accountHolder"
          placeholder="Майрууд ХХК"
          value={formData.accountHolder}
          onChange={(e) => setFormData(prev => ({ ...prev, accountHolder: e.target.value }))}
        />
      </div>

      {/* Currency Selection */}
      <div className="space-y-2">
        <Label>Валют</Label>
        <div className="flex gap-2">
          {currencies.map((currency) => (
            <Button
              key={currency.code}
              size="sm"
              variant={formData.currency === currency.code ? "default" : "outline"}
              className={cn(
                formData.currency === currency.code && currency.code === 'MNT' && 
                "bg-primary hover:bg-primary/90 text-white"
              )}
              onClick={() => setFormData(prev => ({ ...prev, currency: currency.code }))}
            >
              {currency.name}
            </Button>
          ))}
        </div>
      </div>

      {/* ДАНСНЫ ТОХИРГОО Section */}
      <div className="space-y-4 pt-4 border-t">
        <Label className="text-base font-medium">ДАНСНЫ ТОХИРГОО</Label>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Төлөв</p>
              <p className="text-xs text-muted-foreground mt-1">
                Данстай авто удирдлагын түвшинд захиалгын авах
              </p>
            </div>
            <Switch
              checked={formData.autoPayment}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoPayment: checked }))}
            />
          </div>

          {/* Additional configuration text */}
          <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
            <p>Энэ нь тус банкны санхүүгийн туйа тойм дээр энэ өгснөөд хэрэг данс</p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Хаах
        </Button>
        <Button 
          onClick={handleSave}
          className="flex-1 bg-primary hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? 'Хадгалж байна...' : 'Хадгалах'}
        </Button>
      </div>
    </div>
  );
}

export function BankAccountConfigPanel({ 
  isOpen, 
  onClose, 
  onSave = async () => {} 
}: BankAccountConfigPanelProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSaveAccount = async (config: any) => {
    await onSave(config);
    setShowSuccess(true);
    
    // Auto-close success after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  // Success screen component
  const SuccessScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        Шинэ дансны мэдээлэл амжилттай бүртгэгдлээ.
      </h3>
      <Button 
        onClick={() => {
          setShowSuccess(false);
          onClose();
        }}
        className="mt-4 bg-primary hover:bg-primary/90"
      >
        Хаах
      </Button>
    </div>
  );

  return (
    <RightPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Данс нэмэх"
      description="ДАНСНЫ МЭДЭЭЛЭЛ"
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
  );
}