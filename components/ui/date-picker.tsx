"use client"

import * as React from "react"
import { format, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
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
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onSelect?.(selectedDate)
            setIsOpen(false) // Close popover after selection - fixes Safari issue
          }}
          initialFocus
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

  // Convert string to Date for the calendar
  const dateValue = React.useMemo(() => {
    if (!value) return undefined
    try {
      return parse(value, 'yyyy-MM-dd', new Date())
    } catch {
      return undefined
    }
  }, [value])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
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
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              // Convert back to YYYY-MM-DD string format
              onChange?.(format(selectedDate, 'yyyy-MM-dd'))
            } else {
              onChange?.('')
            }
            setIsOpen(false) // Close popover after selection - fixes Safari issue
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
