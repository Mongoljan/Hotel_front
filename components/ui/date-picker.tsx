"use client"

import * as React from "react"
import { format, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useLocale } from 'next-intl'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Detect Safari browser
const isSafari = typeof window !== 'undefined' && 
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Display format for the date, defaults to "PPP" (e.g., "November 28, 2025") */
  displayFormat?: string
}

/**
 * DatePicker with string value support for form integration
 * Handles YYYY-MM-DD string format conversion
 */
interface DatePickerWithValueProps {
  value?: string // YYYY-MM-DD format
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  displayFormat?: string
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Огноо сонгох",
  disabled = false,
  className,
  displayFormat = "yyyy.MM.dd",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const locale = useLocale()
  
  const [selectedYear, setSelectedYear] = React.useState<number>(
    date ? date.getFullYear() : new Date().getFullYear()
  )
  const [selectedMonth, setSelectedMonth] = React.useState<number>(
    date ? date.getMonth() : new Date().getMonth()
  )

  // Generate year options
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i)
  
  // Localized month names
  const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const monthsMn = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар']
  const months = locale === 'mn' ? monthsMn : monthsEn

  // Localized formatters
  const formattersEn = {
    formatWeekdayName: (date: Date) => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][date.getDay()],
    formatCaption: (date: Date) => `${monthsEn[date.getMonth()]} ${date.getFullYear()}`
  }
  const formattersMn = {
    formatWeekdayName: (date: Date) => ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'][date.getDay()],
    formatCaption: (date: Date) => `${date.getFullYear()} оны ${monthsMn[date.getMonth()]}`
  }
  const formatters = locale === 'mn' ? formattersMn : formattersEn

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, displayFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4} style={{ zIndex: 9999 }}>
        <div className="p-3 space-y-2 border-b">
          <div className="flex gap-2">
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={locale === 'mn' ? 'Он' : 'Year'} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]" position="popper" style={{ zIndex: 10001 }}>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={locale === 'mn' ? 'Сар' : 'Month'} />
              </SelectTrigger>
              <SelectContent position="popper" style={{ zIndex: 10001 }}>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onSelect?.(selectedDate)
            setIsOpen(false)
          }}
          month={new Date(selectedYear, selectedMonth)}
          onMonthChange={(date) => {
            setSelectedYear(date.getFullYear())
            setSelectedMonth(date.getMonth())
          }}
          formatters={formatters}
        />
      </PopoverContent>
    </Popover>
  )
}

/**
 * DatePicker that works with string values (YYYY-MM-DD format)
 * Perfect for form integration where you need string dates
 */
export function DatePickerWithValue({
  value,
  onChange,
  placeholder = "Огноо сонгох",
  disabled = false,
  className,
  displayFormat = "yyyy.MM.dd",
}: DatePickerWithValueProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const locale = useLocale()

  // Convert string to Date for the calendar
  const dateValue = React.useMemo(() => {
    if (!value) return undefined
    try {
      return parse(value, 'yyyy-MM-dd', new Date())
    } catch {
      return undefined
    }
  }, [value])

  const [selectedYear, setSelectedYear] = React.useState<number>(
    dateValue ? dateValue.getFullYear() : new Date().getFullYear()
  )
  const [selectedMonth, setSelectedMonth] = React.useState<number>(
    dateValue ? dateValue.getMonth() : new Date().getMonth()
  )

  // Generate year options
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i)
  
  // Localized month names
  const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const monthsMn = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар']
  const months = locale === 'mn' ? monthsMn : monthsEn

  // Localized formatters
  const formattersEn = {
    formatWeekdayName: (date: Date) => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][date.getDay()],
    formatCaption: (date: Date) => `${monthsEn[date.getMonth()]} ${date.getFullYear()}`
  }
  const formattersMn = {
    formatWeekdayName: (date: Date) => ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'][date.getDay()],
    formatCaption: (date: Date) => `${date.getFullYear()} оны ${monthsMn[date.getMonth()]}`
  }
  const formatters = locale === 'mn' ? formattersMn : formattersEn

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !dateValue && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, displayFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4} style={{ zIndex: 9999 }}>
        <div className="p-3 space-y-2 border-b">
          <div className="flex gap-2">
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={locale === 'mn' ? 'Он' : 'Year'} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]" position="popper" style={{ zIndex: 10001 }}>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={locale === 'mn' ? 'Сар' : 'Month'} />
              </SelectTrigger>
              <SelectContent position="popper" style={{ zIndex: 10001 }}>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              onChange?.(format(selectedDate, 'yyyy-MM-dd'))
            } else {
              onChange?.('')
            }
            setIsOpen(false)
          }}
          month={new Date(selectedYear, selectedMonth)}
          onMonthChange={(date) => {
            setSelectedYear(date.getFullYear())
            setSelectedMonth(date.getMonth())
          }}
          formatters={formatters}
        />
      </PopoverContent>
    </Popover>
  )
}
