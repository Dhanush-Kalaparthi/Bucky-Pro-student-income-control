
export enum IncomeType {
  HOURLY = 'HOURLY',
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE'
}

export enum PayFrequency {
  WEEKLY = 'WEEKLY',
  FORTNIGHTLY = 'FORTNIGHTLY',
  MONTHLY = 'MONTHLY',
  IRREGULAR = 'IRREGULAR'
}

export enum DeductionMethod {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED'
}

export enum SuperType {
  EMPLOYER_PAID = 'EMPLOYER_PAID', // On top of gross, not received
  INCLUDED_IN_GROSS = 'INCLUDED_IN_GROSS' // Part of gross, set aside
}

export interface IncomeStream {
  id: string;
  name: string;
  type: IncomeType;
  payRate: number; // hourly rate or fixed amount
  frequency: PayFrequency;
  color: string;
  
  // Tax & Super Settings
  isNetPay: boolean; // Is the rate provided already after tax?
  taxEnabled: boolean;
  taxMethod: DeductionMethod;
  taxValue: number;
  
  superEnabled: boolean;
  superMethod: DeductionMethod;
  superValue: number;
  superType: SuperType;
}

export interface Shift {
  id: string;
  streamId: string;
  date: string; // ISO format
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakMinutes: number;
  isPaid: boolean;
  actualPaidAmount?: number;
  
  // Override fields for shift-level accuracy
  overrideGross?: number;
  overrideTax?: number;
  overrideSuper?: number;
  overrideNet?: number;
}

export enum ExpenseCategory {
  RENT = 'Rent',
  FOOD = 'Food',
  TRANSPORT = 'Transport',
  SUBSCRIPTIONS = 'Subscriptions',
  UTILITIES = 'Utilities',
  SOCIAL = 'Social',
  MISC = 'Miscellaneous'
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  method: 'CASH' | 'CARD' | 'BANK';
  note?: string;
}

export type AppState = {
  streams: IncomeStream[];
  shifts: Shift[];
  expenses: Expense[];
};
