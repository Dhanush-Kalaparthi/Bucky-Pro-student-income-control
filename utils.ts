
import { Shift, IncomeStream, IncomeType, DeductionMethod, SuperType } from './types';

export const calculateShiftHours = (startTime: string, endTime: string, breakMinutes: number): number => {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  let diff = (endH * 60 + endM) - (startH * 60 + startM);
  if (diff < 0) diff += 24 * 60; // Handle overnight shifts
  
  return Math.max(0, (diff - breakMinutes) / 60);
};

export interface PayBreakdown {
  gross: number;
  tax: number;
  super: number;
  net: number;
  superEmployer: number; // Super not received by user
}

export const calculatePayBreakdown = (shift: Shift, stream: IncomeStream): PayBreakdown => {
  // 1. Calculate Base Amount (might be gross or net depending on stream setting)
  let baseAmount = 0;
  if (stream.type === IncomeType.FIXED) {
    baseAmount = stream.payRate;
  } else {
    const hours = calculateShiftHours(shift.startTime, shift.endTime, shift.breakMinutes);
    baseAmount = hours * stream.payRate;
  }

  let gross = 0;
  let tax = 0;
  let superAmount = 0;
  let superEmployer = 0;
  let net = 0;

  if (stream.isNetPay) {
    // If user provided a Net rate, we assume this is what hits the bank.
    // Tax and Super are technically unknown or external unless specified.
    net = baseAmount;
    gross = baseAmount; // Simple fallback
  } else {
    gross = baseAmount;
    
    // 2. Calculate Tax
    if (stream.taxEnabled) {
      tax = stream.taxMethod === DeductionMethod.PERCENT 
        ? gross * (stream.taxValue / 100) 
        : stream.taxValue;
    }

    // 3. Calculate Super
    if (stream.superEnabled) {
      const calculatedSuper = stream.superMethod === DeductionMethod.PERCENT
        ? gross * (stream.superValue / 100)
        : stream.superValue;
      
      if (stream.superType === SuperType.INCLUDED_IN_GROSS) {
        superAmount = calculatedSuper;
      } else {
        superEmployer = calculatedSuper;
      }
    }

    // 4. Calculate Net
    // Net = Gross - Tax - (Super if included in gross)
    net = gross - tax - superAmount;
  }

  return {
    gross: shift.overrideGross ?? gross,
    tax: shift.overrideTax ?? tax,
    super: shift.overrideSuper ?? superAmount,
    superEmployer: superEmployer,
    net: shift.overrideNet ?? (shift.isPaid ? (shift.actualPaidAmount ?? net) : net)
  };
};

// Legacy support
export const calculateExpectedPay = (shift: Shift, stream: IncomeStream): number => {
  return calculatePayBreakdown(shift, stream).net;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
