// Banking and Payment Configuration Types
// Based on Hotel1.md API documentation and Figma designs

// Payment type enum as defined in the API
export type PaymentType = 'bank_account' | 'bank_card' | 'payment_solution' | 'credit' | 'bonus_card' | 'cash';

// Bank interface
export interface Bank {
  id: number;
  name: string;
  short_code: string;
  logo?: string | null;
  is_active: boolean;
}

// Payment Solution Type interface
export interface PaymentSolutionType {
  id: number;
  name: string;
  config_json: Record<string, any>;
  logo?: string | null;
  is_active: boolean;
}

// Payment Configuration interface
export interface PaymentConfig {
  id: number;
  payment_type: PaymentType;
  bank_id?: number;
  bank?: Bank;
  currency_id?: number;
  solution_type_ids?: number[];
  solution_types?: PaymentSolutionType[];
  short_name?: string;
  iban?: string;
  account_number?: string;
  account_holder?: string;
  show_on_booking: boolean;
  terminal_id?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Request interface for creating/updating payment configuration
export interface PaymentConfigRequest {
  payment_type?: PaymentType;
  bank_id?: number;
  currency_id?: number;
  solution_type_ids?: number[];
  short_name?: string;
  iban?: string;
  account_number?: string;
  account_holder?: string;
  show_on_booking?: boolean;
  terminal_id?: string;
  description?: string;
  is_active?: boolean;
}

// Response interface for payment configuration operations
export interface PaymentConfigResponse {
  message: string;
  data: PaymentConfig;
}

// Currency interface (for reference)
export interface Currency {
  id: number;
  code: string; // 'MNT', 'USD', 'CNY'
  name: string;
  symbol: string;
}

// Terminal status for POS management
export interface TerminalStatus {
  id: string;
  bank_name: string;
  terminal_id: string;
  status: 'active' | 'inactive' | 'error';
  last_transaction?: string;
  created_at: string;
}

// Payment method display config for UI
export interface PaymentMethodDisplay {
  type: PaymentType;
  icon: string;
  label: string;
  description: string;
  color: string;
  gradient: string;
}

// Common API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}