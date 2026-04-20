'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CheckCircle, Plus, Settings, MoreHorizontal } from 'lucide-react';
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

// Mock terminal data matching Figma screenshots
const mockTerminals = [
  {
    id: '1',
    bankName: 'XXB - ПОС Терминал',
    terminalNumber: '#8821',
    lastConnection: '2023-10-12',
    status: 'online',
    bankCode: 'XXB',
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
];

interface BankCardPOSConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: any) => Promise<void>;
}

interface NewTerminalFormProps {
  onSave: (config: any) => Promise<void>;
  onCancel: () => void;
}

function NewTerminalForm({ onSave, onCancel }: NewTerminalFormProps) {
  const [selectedBank, setSelectedBank] = useState<typeof banks[0] | null>(null);
  const [formData, setFormData] = useState({
    terminalId: '',
    currency: 'MNT',
    phoneDelivery: false
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!selectedBank || !formData.terminalId.trim()) {
      toast.error('Банк болон Terminal ID заавал шаардлагатай');
      return;
    }

    setLoading(true);
    try {
      const config = {
        payment_type: 'bank_card',
        bank_id: selectedBank.id,
        terminal_id: formData.terminalId,
        currency_id: currencies.find(c => c.code === formData.currency)?.id || 1,
        show_on_booking: formData.phoneDelivery,
        is_active: true
      };

      await onSave(config);
      toast.success('Шинэ төхөөрөмж амжилттай нэмэгдлээ');
    } catch (error) {
      toast.error('Төхөөрөмж нэмэхэд алдаа гарлаа');
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

      {/* Төвчаар (Auto-filled) */}
      <div className="space-y-2">
        <Label htmlFor="terminalType">Төвчаар</Label>
        <Input
          id="terminalType"
          value={selectedBank ? `${selectedBank.name} POS` : ''}
          placeholder="Khanbank POS"
          readOnly
          className="bg-gray-50"
        />
      </div>

      {/* Terminal ID */}
      <div className="space-y-2">
        <Label htmlFor="terminalId">Terminal ID</Label>
        <Input
          id="terminalId"
          placeholder="HAs-37373y"
          value={formData.terminalId}
          onChange={(e) => setFormData(prev => ({ ...prev, terminalId: e.target.value }))}
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

      {/* Phone Delivery Toggle */}
      <div className="space-y-3">
        <Label>Төлөв</Label>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-muted-foreground">
              Төлбөрийн суурь дээр түрүүлсэнгүүтэн
            </p>
          </div>
          <Switch
            checked={formData.phoneDelivery}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, phoneDelivery: checked }))}
          />
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
          {loading ? 'Хадгалж байна...' : 'Бүртгэх'}
        </Button>
      </div>
    </div>
  );
}

export function BankCardPOSConfigPanel({ 
  isOpen, 
  onClose, 
  onSave = async () => {} 
}: BankCardPOSConfigPanelProps) {
  const { themeColor } = useTheme();
  const [showNewTerminalForm, setShowNewTerminalForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSaveNewTerminal = async (config: any) => {
    await onSave(config);
    setShowNewTerminalForm(false);
    setShowSuccess(true);
    
    // Auto-close success after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const handleAddTerminal = () => {
    setShowNewTerminalForm(true);
  };

  // Success screen component
  const SuccessScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        Шинэ төхөөрэмж амжилттай бүртгэгдлээ.
      </h3>
      <Button 
        onClick={() => setShowSuccess(false)}
        className="mt-4 bg-green-600 hover:bg-green-700"
      >
        Хаах
      </Button>
    </div>
  );

  return (
    <RightPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Төхөөрөмж нэмэх"
      description="ПОС терминал болон телбөр тооцооны тохиргоо удирдах"
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
        ) : showNewTerminalForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <RightPanelContent>
              <NewTerminalForm
                onSave={handleSaveNewTerminal}
                onCancel={() => setShowNewTerminalForm(false)}
              />
            </RightPanelContent>
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
              {/* Add Terminal Button */}
              <div className="mb-6">
                <Button 
                  onClick={handleAddTerminal}
                  className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Төхөөрөмж нэмэх
                </Button>
              </div>

              {/* Хөшөөдсөн ПОС терминалууд (Connected POS Terminals) */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Хөшөөдсөн ПОС терминалууд</h3>
                <div className="space-y-3">
                  {mockTerminals.map((terminal) => (
                    <Card 
                      key={terminal.id}
                      className="p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded text-white flex items-center justify-center text-xs font-bold",
                            terminal.bankColor
                          )}>
                            {terminal.bankCode}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {terminal.bankName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {terminal.terminalNumber}
                              {terminal.lastConnection && ` • хөлболдсон ${terminal.lastConnection}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={cn(
                              "text-xs",
                              terminal.status === 'online' 
                                ? "bg-primary/10 text-primary" 
                                : "bg-gray-100 text-gray-600"
                            )}
                          >
                            {terminal.status === 'online' ? 'идэвхтэй' : 'идэвхгүй'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </RightPanelContent>

            <RightPanelFooter>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full"
              >
                Буцах
              </Button>
            </RightPanelFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </RightPanel>
  );
}