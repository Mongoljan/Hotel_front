'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  CheckCircle,  
  ArrowRight
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Bank, PaymentConfigRequest, Currency } from '@/types/payment';
import { toast } from 'sonner';

// Banks data matching Figma exactly
const banks = [
  { id: 1, name: 'Khan Bank', code: 'K', shortCode: 'khan', bgColor: 'bg-green-600', borderColor: 'border-green-200', lightBg: 'bg-green-50' },
  { id: 2, name: 'Golomt Bank', code: 'Г', shortCode: 'golomt', bgColor: 'bg-blue-600', borderColor: 'border-blue-200', lightBg: 'bg-blue-50' },
  { id: 3, name: 'TDB Bank', code: 'Т', shortCode: 'tdb', bgColor: 'bg-indigo-600', borderColor: 'border-indigo-200', lightBg: 'bg-indigo-50' }
];

// Currency options
const currencies = [
  { id: 1, code: 'MNT', name: 'MNT', symbol: '₮' },
  { id: 2, code: 'USD', name: 'USD', symbol: '$' },
  { id: 3, code: 'CNY', name: 'CNY', symbol: '¥' }
];

interface POSTerminalConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: PaymentConfigRequest) => Promise<void>;
  initialConfig?: Partial<PaymentConfigRequest>;
  title?: string;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center">
        <div className="py-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold mb-2">
            Шинэ техвэрлэж амжилттай бүртгэгдлээ.
          </h2>
          <Button onClick={onClose} className="mt-6 bg-green-600 hover:bg-green-700">
            Хаах
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function POSTerminalConfigModal({
  isOpen,
  onClose,
  onSave,
  initialConfig,
  title = "Шинэ техвэрэмж бүртгэх"
}: POSTerminalConfigModalProps) {
  // Form state  
  const [selectedBank, setSelectedBank] = useState<typeof banks[0] | null>(null);
  const [terminalId, setTerminalId] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<typeof currencies[0]>(currencies[0]);
  const [phoneDelivery, setPhoneDelivery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize form with existing config
  useEffect(() => {
    if (initialConfig && isOpen) {
      setTerminalId(initialConfig.terminal_id || '');
      setPhoneDelivery(initialConfig.show_on_booking || false);
      
      if (initialConfig.bank_id) {
        const bank = banks.find(b => b.id === initialConfig.bank_id);
        if (bank) setSelectedBank(bank);
      }
      
      if (initialConfig.currency_id) {
        const currency = currencies.find(c => c.id === initialConfig.currency_id);
        if (currency) setSelectedCurrency(currency);
      }
    }
  }, [initialConfig, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedBank(null);
      setTerminalId('');
      setSelectedCurrency(currencies[0]);
      setPhoneDelivery(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!selectedBank || !terminalId.trim()) {
      toast.error('Банк болон терминалын ID заавал шаардлагатай');
      return;
    }

    setLoading(true);
    
    try {
      const config: PaymentConfigRequest = {
        payment_type: 'bank_card',
        bank_id: selectedBank.id,
        terminal_id: terminalId.trim(),
        currency_id: selectedCurrency.id,
        short_name: `${selectedBank.name} ПОС`,
        description: `ПОС терминал - ${terminalId}`,
        show_on_booking: phoneDelivery,
        is_active: true
      };

      await onSave(config);
      setShowSuccess(true);
      
      // Close success modal and main modal after delay
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      // Error handling is done in parent component
      console.error('Error saving POS config:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen && !showSuccess} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              {title}
            </DialogTitle>
            <DialogDescription>
              төхвэрэмжийн мэдээлэл
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Bank Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Банк сонгох</Label>
              <div className="grid grid-cols-3 gap-4">
                {banks.map((bank) => (
                  <Card
                    key={bank.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 border-2 hover:shadow-md",
                      selectedBank?.id === bank.id 
                        ? `${bank.borderColor} ${bank.lightBg} ring-2 ring-offset-2 ring-primary`
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                    onClick={() => setSelectedBank(bank)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 ${bank.bgColor} rounded mx-auto mb-2 flex items-center justify-center`}>
                        <span className="text-white font-bold text-lg">{bank.code}</span>
                      </div>
                      <div className="text-sm font-medium">{bank.name}</div>
                      {selectedBank?.id === bank.id && (
                        <CheckCircle className="w-5 h-5 text-primary mx-auto mt-2" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Terminal ID */}
            <div className="space-y-2">
              <Label htmlFor="terminalId">Terminal ID</Label>
              <Input
                id="terminalId"  
                placeholder="HAs-37373g"
                value={terminalId}
                onChange={(e) => setTerminalId(e.target.value)}
                className="text-base"
              />
            </div>

            {/* Currency Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Валют</Label>
              <div className="flex gap-2">
                {currencies.map((currency) => (
                  <Button
                    key={currency.id}
                    size="sm"
                    variant={selectedCurrency.id === currency.id ? "default" : "outline"}
                    onClick={() => setSelectedCurrency(currency)}
                    className={cn(
                      "px-6 py-2 text-sm",
                      selectedCurrency.id === currency.id && currency.code === 'MNT' 
                        ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                        : ''
                    )}
                  >
                    {currency.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Phone Order Delivery Toggle */}
            <div className="space-y-4 pt-4 border-t">
              <Label className="text-base font-medium">Төлөв</Label>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Телефоноор захиалж буулт хүргэхүүтэй</div>
                </div>
                <Switch
                  checked={phoneDelivery}
                  onCheckedChange={setPhoneDelivery}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Хаах
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1 bg-green-600 hover:bg-green-700" 
              disabled={loading || !selectedBank || !terminalId.trim()}
            >
              {loading ? 'Хадгалж байна...' : 'Бүртгэх'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          onClose();
        }}
      />
    </>
  );
}
