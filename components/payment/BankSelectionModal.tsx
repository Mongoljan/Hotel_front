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
import { Card } from "@/components/ui/card";
import { CheckCircle, Building2, CreditCard } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Bank } from '@/types/payment';

// Bank color schemes matching the designs
const bankColors: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  'khan': {
    bg: 'bg-green-50',
    border: 'border-green-200 hover:border-green-300',
    text: 'text-green-900',
    accent: 'bg-green-600'
  },
  'golomt': {
    bg: 'bg-blue-50',
    border: 'border-blue-200 hover:border-blue-300',
    text: 'text-blue-900',
    accent: 'bg-blue-600'
  },
  'tdb': {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200 hover:border-indigo-300',
    text: 'text-indigo-900',
    accent: 'bg-indigo-600'
  },
  'xxb': {
    bg: 'bg-purple-50',
    border: 'border-purple-200 hover:border-purple-300',
    text: 'text-purple-900',
    accent: 'bg-purple-600'
  },
  'default': {
    bg: 'bg-slate-50',
    border: 'border-slate-200 hover:border-slate-300',
    text: 'text-slate-900',
    accent: 'bg-slate-600'
  }
};

// Bank icons mapping matching Figma designs exactly
const getBankIcon = (shortCode: string) => {
  const baseClasses = "w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm";
  
  switch (shortCode.toLowerCase()) {
    case 'khan':
      return <div className={`${baseClasses} bg-green-600`}>К</div>;
    case 'golomt':
      return <div className={`${baseClasses} bg-blue-600`}>Г</div>;
    case 'tdb':
      return <div className={`${baseClasses} bg-indigo-600`}>Т</div>;
    case 'xxb':
      return <div className={`${baseClasses} bg-purple-600`}>ХХБ</div>;
    default:
      return <div className={`${baseClasses} bg-gray-600`}><Building2 className="w-6 h-6" /></div>;
  }
};

interface BankSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBankSelect: (bank: Bank) => void;
  selectedBankId?: number;
  title?: string;
  description?: string;
}

interface BankCardProps {
  bank: Bank;
  isSelected: boolean;
  onSelect: () => void;
}

function BankCard({ bank, isSelected, onSelect }: BankCardProps) {
  const colors = bankColors[bank.short_code.toLowerCase()] || bankColors.default;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card 
        className={cn(
          "p-6 cursor-pointer transition-all duration-300 relative overflow-hidden border-2 hover:shadow-lg",
          colors.bg,
          isSelected 
            ? "border-primary shadow-lg ring-2 ring-primary ring-offset-2" 
            : colors.border
        )}
        onClick={onSelect}
      >
        {/* Selection indicator */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-4 right-4 text-primary z-10"
            >
              <CheckCircle className="h-6 w-6 fill-current" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bank content - matching Figma layout */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex-shrink-0">
            {getBankIcon(bank.short_code)}
          </div>
          
          <div className="space-y-1">
            <h3 className={cn("font-semibold text-lg", colors.text)}>
              {bank.name}
            </h3>
            <p className={cn("text-sm opacity-80", colors.text)}>
              {bank.short_code.toUpperCase()} банк
            </p>
          </div>
        </div>

        {/* Hover effect background gradient */}
        <div className={cn(
          "absolute inset-0 opacity-0 hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br from-white to-transparent"
        )} />
      </Card>
    </motion.div>
  );
}

export function BankSelectionModal({
  isOpen,
  onClose,
  onBankSelect,
  selectedBankId,
  title = "Банк сонгох",
  description = "Төлбөрийн тохиргоонд ашиглах банкаа сонгоно уу"
}: BankSelectionModalProps) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchBanks();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedBankId && banks.length > 0) {
      const bank = banks.find(b => b.id === selectedBankId);
      setSelectedBank(bank || null);
    }
  }, [selectedBankId, banks]);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/banks');
      if (!response.ok) {
        throw new Error('Failed to fetch banks');
      }
      
      const data = await response.json();
      setBanks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Банкуудын мэдээлэл авахад алдаа гарлаа');
      console.error('Error fetching banks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
  };

  const handleConfirm = () => {
    if (selectedBank) {
      onBankSelect(selectedBank);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="h-6 w-6 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-32 bg-slate-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive text-sm mb-4">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchBanks}
              >
                Дахин оролдох
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {banks.map((bank) => (
                  <BankCard
                    key={bank.id}
                    bank={bank}
                    isSelected={selectedBank?.id === bank.id}
                    onSelect={() => handleBankSelect(bank)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose} className="px-6">
            Цуцлах
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedBank}
            className="px-6 min-w-[120px]"
          >
            {selectedBank ? 'Сонгох' : 'Банк сонгоно уу'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BankSelectionModal;