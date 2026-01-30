'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithValue } from '@/components/ui/date-picker';
import { X } from 'lucide-react';
import { toast } from 'sonner';

// Formatted Number Input Component for prices
interface FormattedNumberInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  className,
  disabled
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Format number with thousand separators
  const formatNumber = (str: string): string => {
    if (!str || str === '0') return '';
    const num = str.replace(/'/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  };

  // Parse formatted string back to plain number string
  const parseFormattedNumber = (str: string): string => {
    return str.replace(/'/g, '');
  };

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(formatNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow only numbers, apostrophes, and decimal point
    if (inputValue && !/^[\d'.]*$/.test(inputValue)) {
      return;
    }

    // Update display
    setDisplayValue(inputValue);

    // Parse and call onChange
    const numericValue = parseFormattedNumber(inputValue);
    onChange(numericValue);
  };

  const handleBlur = () => {
    // Reformat on blur to ensure proper formatting
    const numericValue = parseFormattedNumber(displayValue);
    setDisplayValue(formatNumber(numericValue));
  };

  return (
    <Input
      id={id}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
};

interface RoomType {
  id: number;
  name: string;
  is_custom: boolean;
}

interface RoomCategory {
  id: number;
  name: string;
  is_custom: boolean;
}

interface LookupData {
  room_types: RoomType[];
  room_category: RoomCategory[];
}

interface PriceSetting {
  id: number;
  name: string;
  hotel: number;
  room_type: number;
  room_category: number;
  start_date: string;
  end_date: string;
  adjustment_type: 'ADD' | 'SUB';
  value_type: 'PERCENT' | 'AMOUNT';
  value: number;
  is_active: boolean;
}

interface RoomOption {
  label: string;
  value: string;
  room_type: number;
  room_category: number;
  count: number;
}

interface PriceSettingModalProps {
  isOpen: boolean;
  onClose: (success?: boolean) => void;
  editData: PriceSetting | null;
  hotelId: number;
  lookup: LookupData;
  roomOptions: RoomOption[];
}

export default function PriceSettingModal({
  isOpen,
  onClose,
  editData,
  hotelId,
  lookup,
  roomOptions,
}: PriceSettingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    room_combination: '', // "room_type-room_category" format
    start_date: '',
    end_date: '',
    adjustment_type: 'ADD' as 'ADD' | 'SUB',
    value_type: 'PERCENT' as 'PERCENT' | 'AMOUNT',
    value: '',
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        room_combination: `${editData.room_type}-${editData.room_category}`,
        start_date: editData.start_date,
        end_date: editData.end_date,
        adjustment_type: editData.adjustment_type,
        value_type: editData.value_type,
        value: String(editData.value),
        is_active: editData.is_active,
      });
    } else {
      setFormData({
        name: '',
        room_combination: '',
        start_date: '',
        end_date: '',
        adjustment_type: 'ADD',
        value_type: 'PERCENT',
        value: '',
        is_active: true,
      });
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hotelId) {
      toast.error('Буудлын ID олдсонгүй');
      return;
    }

    if (!formData.name || !formData.room_combination || 
        !formData.start_date || !formData.end_date || !formData.value) {
      toast.error('Бүх шаардлагатай талбаруудыг бөглөнө үү');
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse room_type and room_category from room_combination
      const [room_type, room_category] = formData.room_combination.split('-').map(Number);
      
      const body = {
        name: formData.name,
        hotel: hotelId,
        room_type,
        room_category,
        start_date: formData.start_date,
        end_date: formData.end_date,
        adjustment_type: formData.adjustment_type,
        value_type: formData.value_type,
        value: parseFloat(formData.value),
        is_active: formData.is_active,
      };

      const url = editData
        ? `https://dev.kacc.mn/api/pricesettings/${editData.id}/`
        : `https://dev.kacc.mn/api/pricesettings/`;

      const method = editData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editData ? 'Амжилттай шинэчиллээ' : 'Амжилттай нэмэгдлээ');
        onClose(true);
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.detail || 'Алдаа гарлаа');
      }
    } catch (error) {
      console.error('Error saving price setting:', error);
      toast.error('Алдаа гарлаа');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4 pt-20">
        <div className="relative bg-background border border-border rounded-2xl shadow-xl w-full max-w-2xl my-8">
          {/* Header */}
          <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {editData ? 'Үнийн тохиргоо засах' : 'Шинэ үнийн тохиргоо'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onClose(false)}
            className="hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Нэр <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Үнийн тохиргооны нэр оруулах"
              className="border-input"
            />
          </div>

          {/* Room Selection */}
          <div className="space-y-2">
            <Label htmlFor="room_combination">
              Өрөөний төрөл <span className="text-red-500">*</span>
            </Label>
            <Select
              key={`room-combo-${editData?.id || 'new'}-${formData.room_combination}`}
              value={formData.room_combination || undefined}
              onValueChange={(value) => setFormData({ ...formData, room_combination: value })}
            >
              <SelectTrigger className="border-input w-full">
                <SelectValue placeholder="Өрөөний бүлэг сонгох" />
              </SelectTrigger>
              <SelectContent className="max-w-[500px]">
                {roomOptions.length > 0 ? (
                  roomOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="whitespace-normal py-3 leading-snug"
                    >
                      <span className="block">{option.label}</span>
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    <p className="font-medium">
                      {editData ? 'Өрөө олдсонгүй' : 'Бүх өрөөний үнийн тохиргоо хийгдсэн байна'}
                    </p>
                    <p className="mt-1 text-xs">
                      {editData
                        ? 'Эхлээд өрөө нэмнэ үү'
                        : 'Үнийн тохиргоо нэмэхийн тулд эхлээд Өрөөний үнэ хэсэгт үнэ тохируулаагүй өрөө байх ёстой'}
                    </p>
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">
                Эхлэх огноо <span className="text-red-500">*</span>
              </Label>
              <DatePickerWithValue
                value={formData.start_date}
                onChange={(value) => setFormData({ ...formData, start_date: value })}
                placeholder="Эхлэх огноо"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">
                Дуусах огноо <span className="text-red-500">*</span>
              </Label>
              <DatePickerWithValue
                value={formData.end_date}
                onChange={(value) => setFormData({ ...formData, end_date: value })}
                placeholder="Дуусах огноо"
              />
            </div>
          </div>

          {/* Adjustment Type */}
          <div className="space-y-2">
            <Label>
              Үнийн өөрчлөлтийн төрөл <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-3">
              <label className="flex items-center cursor-pointer flex-1">
                <input
                  type="radio"
                  name="adjustment_type"
                  value="ADD"
                  checked={formData.adjustment_type === 'ADD'}
                  onChange={(e) => setFormData({ ...formData, adjustment_type: 'ADD' })}
                  className="hidden peer"
                />
                <span className="peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary border border-border/40 rounded-lg px-4 py-2.5 w-full text-center bg-background text-muted-foreground transition hover:bg-muted/50 hover:border-border">
                  Нэмэгдэх
                </span>
              </label>

              <label className="flex items-center cursor-pointer flex-1">
                <input
                  type="radio"
                  name="adjustment_type"
                  value="SUB"
                  checked={formData.adjustment_type === 'SUB'}
                  onChange={(e) => setFormData({ ...formData, adjustment_type: 'SUB' })}
                  className="hidden peer"
                />
                <span className="peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary border border-border/40 rounded-lg px-4 py-2.5 w-full text-center bg-background text-muted-foreground transition hover:bg-muted/50 hover:border-border">
                  Хасагдах
                </span>
              </label>
            </div>
          </div>

          {/* Value Type */}
          <div className="space-y-2">
            <Label>
              Утгын төрөл <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-3">
              <label className="flex items-center cursor-pointer flex-1">
                <input
                  type="radio"
                  name="value_type"
                  value="PERCENT"
                  checked={formData.value_type === 'PERCENT'}
                  onChange={(e) => setFormData({ ...formData, value_type: 'PERCENT' })}
                  className="hidden peer"
                />
                <span className="peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary border border-border/40 rounded-lg px-4 py-2.5 w-full text-center bg-background text-muted-foreground transition hover:bg-muted/50 hover:border-border">
                  Хувиар (%)
                </span>
              </label>

              <label className="flex items-center cursor-pointer flex-1">
                <input
                  type="radio"
                  name="value_type"
                  value="AMOUNT"
                  checked={formData.value_type === 'AMOUNT'}
                  onChange={(e) => setFormData({ ...formData, value_type: 'AMOUNT' })}
                  className="hidden peer"
                />
                <span className="peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary border border-border/40 rounded-lg px-4 py-2.5 w-full text-center bg-background text-muted-foreground transition hover:bg-muted/50 hover:border-border">
                  Дүнгээр (₮)
                </span>
              </label>
            </div>
          </div>

          {/* Value */}
          <div className="space-y-2">
            <Label htmlFor="value">
              Утга <span className="text-red-500">*</span>
            </Label>
            {formData.value_type === 'AMOUNT' ? (
              <FormattedNumberInput
                id="value"
                value={formData.value}
                onChange={(value) => setFormData({ ...formData, value })}
                placeholder="Дүн оруулах"
                className="border-input"
              />
            ) : (
              <Input
                id="value"
                type="text"
                inputMode="decimal"
                value={formData.value}
                onChange={(e) => {
                  const val = e.target.value;

                  // Allow empty string for clearing
                  if (val === '') {
                    setFormData({ ...formData, value: val });
                    return;
                  }

                  // Only allow numbers and decimal point
                  if (!/^\d*\.?\d*$/.test(val)) {
                    return;
                  }

                  const numVal = parseFloat(val);

                  // If it's a valid number, check range
                  if (!isNaN(numVal)) {
                    if (numVal > 100) {
                      toast.error('Хувь 100-аас хэтрэхгүй байх ёстой');
                      return;
                    }
                    if (numVal < 0) {
                      toast.error('Хувь сөрөг тоо байж болохгүй');
                      return;
                    }
                  }

                  // Allow partial input like "10." for decimals
                  setFormData({ ...formData, value: val });
                }}
                placeholder="0"
                className="border-input"
              />
            )}
            <p className="text-xs text-muted-foreground">
              {formData.value_type === 'PERCENT'
                ? 'Хувиар илэрхийлнэ (0-100 хооронд, жишээ нь: 10 гэж оруулбал 10% нэмэгдэнэ)'
                : "Төгрөгөөр илэрхийлнэ (жишээ нь: 50'000 гэж оруулбал 50,000₮ нэмэгдэнэ)"}
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Идэвхтэй байх
            </Label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              disabled={isSubmitting}
            >
              Болих
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? 'Хадгалж байна...' : editData ? 'Шинэчлэх' : 'Нэмэх'}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
