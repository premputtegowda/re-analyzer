// Frontend: Real-time calculations for immediate feedback
// src/utils/calculations.ts

import { PropertyData, Unit, OtherIncomeItem } from '../types/property';

export const calculateBasicMetrics = (formData: PropertyData) => {
  // Simple calculations for immediate UI feedback
  const totalMonthlyIncome = formData.units?.reduce((acc: number, unit: Unit) => {
    return acc + (unit.monthlyRent || 0) * (unit.numberOfUnits || 1);
  }, 0) || 0;

  const totalOtherIncome = formData.otherIncome?.reduce((acc: number, item: OtherIncomeItem) => {
    return acc + (item.amount || 0);
  }, 0) || 0;

  const totalIncome = totalMonthlyIncome + totalOtherIncome;

  // Basic expense calculation
  const monthlyExpenses = (formData.expenses?.annualPropertyTaxes || 0) / 12 +
                         (formData.expenses?.annualPropertyInsurance || 0) / 12 +
                         (formData.expenses?.hoa || 0);

  // Simple mortgage calculation (approximate)
  const downPayment = formData.finance?.downPaymentType === 'percentage' 
    ? (formData.purchasePrice * (formData.finance?.downPayment || 0)) / 100
    : formData.finance?.downPayment || 0;

  return {
    totalMonthlyIncome: totalIncome,
    totalMonthlyExpenses: monthlyExpenses,
    downPayment,
    estimatedCashFlow: totalIncome - monthlyExpenses
  };
};

// For chart data - simple projections
export const generateChartData = (formData: PropertyData, holdPeriod: number) => {
  const basic = calculateBasicMetrics(formData);
  const rentGrowth = (formData.projectedRentGrowth || 2) / 100;
  const expenseGrowth = (formData.expenseGrowthRate || 3) / 100;

  return Array.from({ length: holdPeriod }, (_, i) => {
    const year = i + 1;
    const income = basic.totalMonthlyIncome * Math.pow(1 + rentGrowth, year) * 12;
    const expenses = basic.totalMonthlyExpenses * Math.pow(1 + expenseGrowth, year) * 12;
    
    return {
      year: `Year ${year}`,
      Income: Math.round(income),
      'Operating Expenses': Math.round(expenses),
      'Net Income': Math.round(income - expenses),
      'Cash Flow': Math.round(income - expenses) // Simplified
    };
  });
};
