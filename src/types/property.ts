// src/types/property.ts

export type PropertyType = 'Single Family Home' | 'MultiFamily' | 'Townhouse' | 'Condo';
export type DownPaymentType = 'percentage' | 'amount';

export interface Unit {
  beds: number;
  baths: number;
  sqft: number;
  monthlyRent?: number;
  numberOfUnits?: number;
}

export interface OtherIncomeItem {
  category: string;
  amount: number;
}

export interface FinanceData {
  downPayment: number;
  downPaymentType: DownPaymentType;
  interestRate: number;
  closingCosts: number;
  points: number;
  otherCosts: number;
}

export interface CustomExpense {
  category: string;
  amount: number;
}

export interface OneTimeExpense {
  category: string;
  amount: number;
}

export interface ExpenseData {
  propertyTaxes: number;
  propertyInsurance: number;
  water: number;
  gas: number;
  electricity: number;
  landscapingSnowRemoval: number;
  internet: number;
  security: number;
  administrativeManagement: number;
  repairsMaintenance: number;
  propertyManagementPercentage: number;
  leasingFee: number;
  averageLengthOfStay: number;
  replacementReserves: number;
  customExpenses: CustomExpense[];
  oneTimeExpenses: OneTimeExpense[];
}

export interface RehabCostItem {
  category: string;
  amount: number;
}

export interface RehabData {
  hardCosts: RehabCostItem[];
  softCosts: RehabCostItem[];
  lostRevenueAndCosts: RehabCostItem[];
}

export interface PropertyData {
  address: string;
  purchasePrice: number;
  propertyType: PropertyType;
  units: Unit[];
  otherIncome: OtherIncomeItem[];
  finance: FinanceData;
  expenses: ExpenseData;
  rehab: RehabData;
}