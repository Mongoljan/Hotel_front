'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CheckCircle, Plus, MoreHorizontal } from 'lucide-react';
import { RightPanel, RightPanelContent, RightPanelFooter } from '@/components/ui/right-panel';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTheme } from '@/context/ThemeContext';

// Bank configurations matching API data
const banks = [
  { id: 1, name: 'Khan Bank', code: 'K', shortCode: 'khan' },
  { id: 2, name: 'Ариг банк', code: 'А', shortCode: '210000' },
  { id: 3, name: 'Богд банк', code: 'Б', shortCode: '380000' },
  { id: 4, name: 'Golomt Bank', code: 'G', shortCode: 'golomt' },
  { id: 5, name: 'TDB Bank', code: 'T', shortCode: 'tdb' }
];

// Currency options
const currencies = [
  { id: 1, code: 'MNT', name: 'MNT' },
  { id: 2, code: 'USD', name: 'USD' },
  { id: 3, code: 'CNY', name: 'CNY' }
];

export interface POSTerminalDisplay {
  id: string | number;
  bankName: string;
  terminalNumber: string;
  lastConnection?: string;
  status: 'online' | 'offline';
  bankCode: string;
}

interface BankCardPOSConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: any) => Promise<void>;
  terminals?: POSTerminalDisplay[];
  /**
   * Which view to show when the panel opens.
   * - 'hub' (default): the ПОС терминал list panel; user can stack the add form on top.
   * - 'add': open straight into the "Төхөөрөмж нэмэх" form as a single panel.
   */
  initialView?: 'hub' | 'add';
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
              variant="outline"
              className={cn(
                "h-16 flex flex-col gap-1 p-2 bg-background",
                selectedBank?.id === bank.id && "border-primary ring-1 ring-primary bg-primary/5"
              )}
              onClick={() => setSelectedBank(bank)}
            >
              <div className={cn(
                "w-8 h-8 rounded flex items-center justify-center text-sm font-bold",
                selectedBank?.id === bank.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              )}>
                {bank.code}
              </div>
              <span className="text-xs text-center">{bank.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Auto-filled short name */}
      <div className="space-y-2">
        <Label htmlFor="terminalType">Товч нэр</Label>
        <Input
          id="terminalType"
          value={selectedBank ? `${selectedBank.name} POS` : ''}
          placeholder="Khanbank POS"
          readOnly
          className="bg-muted"
        />
      </div>

      {/* Terminal ID */}
      <div className="space-y-2">
        <Label htmlFor="terminalId">Terminal ID</Label>
        <Input
          id="terminalId"
          placeholder="POS-8821-HAS"
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
              onClick={() => setFormData(prev => ({ ...prev, currency: currency.code }))}
            >
              {currency.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Activate Toggle */}
      <div className="space-y-3">
        <Label>Төлөв</Label>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-muted-foreground">
              Төхөөрөмжийг шууд идэвхжүүлэх
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
          className="flex-1"
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
  onSave = async () => {},
  terminals = [],
  initialView = 'hub',
}: BankCardPOSConfigPanelProps) {
  const { themeColor } = useTheme();
  const [showNewTerminalForm, setShowNewTerminalForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isAddOnly = initialView === 'add';

  // Close any open secondary panel when the primary closes so they
  // don't end up out of sync.
  const handleClosePrimary = () => {
    setShowNewTerminalForm(false);
    onClose();
  };

  const handleSaveNewTerminal = async (config: any) => {
    await onSave(config);
    setShowNewTerminalForm(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      if (isAddOnly) onClose();
    }, 2000);
  };

  // Success screen component
  const SuccessScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        Шинэ төхөөрөмж амжилттай бүртгэгдлээ.
      </h3>
      <Button 
        onClick={() => setShowSuccess(false)}
        className="mt-4"
      >
        Хаах
      </Button>
    </div>
  );

  return (
    <>
      {isAddOnly ? (
        // Single-panel add-form mode (entry: card-level "Төхөөрөмж нэмэх" button)
        <RightPanel
          isOpen={isOpen}
          onClose={onClose}
          title="Төхөөрөмж нэмэх"
          description="ПОС терминал болон төлбөр тооцооны тохиргоо"
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
                  <NewTerminalForm
                    onSave={handleSaveNewTerminal}
                    onCancel={onClose}
                  />
                </RightPanelContent>
              </motion.div>
            )}
          </AnimatePresence>
        </RightPanel>
      ) : (
        <>
      {/* Main panel — always shows the terminal list */}
      <RightPanel
        isOpen={isOpen}
        onClose={handleClosePrimary}
        title="ПОС терминал"
        description="Холбогдсон ПОС терминалууд"
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
                {/* Add Terminal Button */}
                <div className="mb-6">
                  <Button 
                    onClick={() => setShowNewTerminalForm(true)}
                    className="w-full flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Төхөөрөмж нэмэх
                  </Button>
                </div>

                {/* Connected POS Terminals */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">Холбогдсон ПОС терминалууд</h3>
                    <p className="text-xs text-muted-foreground">
                      {terminals.filter(t => t.status === 'online').length} идэвхтэй төхөөрөмж
                    </p>
                  </div>
                  {terminals.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      Төхөөрөмж бүртгээгүй байна
                    </div>
                  ) : (
                  <div className="space-y-3">
                    {terminals.map((terminal) => (
                      <Card 
                        key={terminal.id}
                        className="p-4 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-muted text-foreground flex items-center justify-center text-xs font-bold">
                              {terminal.bankCode}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{terminal.bankName}</div>
                              <div className="text-xs text-muted-foreground">
                                {terminal.terminalNumber}
                                {terminal.lastConnection && ` • холбогдсон ${terminal.lastConnection}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={cn(
                                "text-xs",
                                terminal.status === 'online' 
                                  ? "bg-primary/10 text-primary" 
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {terminal.status === 'online' ? 'идэвхтэй' : 'идэвхгүй'}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-3 w-3" />
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
                <Button variant="outline" onClick={handleClosePrimary} className="w-full">
                  ← Буцах
                </Button>
              </RightPanelFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </RightPanel>

      {/* Secondary panel — slides out from behind the primary panel when adding a terminal */}
      <RightPanel
        isOpen={isOpen && showNewTerminalForm && !showSuccess}
        onClose={() => setShowNewTerminalForm(false)}
        title="Төхөөрөмж нэмэх"
        description="ПОС терминал болон төлбөр тооцооны тохиргоо"
        width="w-[400px] sm:w-[460px]"
        rightOffset="right-[400px] sm:right-[460px]"
        showOverlay={false}
        slideFrom="inner-right"
      >
        <RightPanelContent>
          <NewTerminalForm
            onSave={handleSaveNewTerminal}
            onCancel={() => setShowNewTerminalForm(false)}
          />
        </RightPanelContent>
      </RightPanel>
        </>
      )}
    </>
  );
}