
import { IncomeType, PayFrequency, IncomeStream, ExpenseCategory, DeductionMethod, SuperType } from './types';

export const INITIAL_STREAMS: IncomeStream[] = [
  { 
    id: '1', 
    name: 'Barista Job', 
    type: IncomeType.HOURLY, 
    payRate: 28.50, 
    frequency: PayFrequency.WEEKLY, 
    color: '#EF4444',
    isNetPay: false,
    taxEnabled: true,
    taxMethod: DeductionMethod.PERCENT,
    taxValue: 15,
    superEnabled: true,
    superMethod: DeductionMethod.PERCENT,
    superValue: 11.5,
    superType: SuperType.EMPLOYER_PAID
  },
  { 
    id: '2', 
    name: 'Freelance Design', 
    type: IncomeType.FIXED, 
    payRate: 500, 
    frequency: PayFrequency.IRREGULAR, 
    color: '#FFFFFF',
    isNetPay: true,
    taxEnabled: false,
    taxMethod: DeductionMethod.PERCENT,
    taxValue: 0,
    superEnabled: false,
    superMethod: DeductionMethod.PERCENT,
    superValue: 0,
    superType: SuperType.EMPLOYER_PAID
  },
];

export const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);

export const COLORS = {
  primary: '#EF4444', // Red
  secondary: '#FFFFFF', // White
  background: '#000000', // Black
};
