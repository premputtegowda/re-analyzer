// src/types/property.ts

export type PropertyType = 'Single Family Home' | 'MultiFamily' | 'Townhouse' | 'Condo';
export type DownPaymentType = 'percentage' | 'amount';

export interface Unit {
  monthlyRent: number;    // Required field, moved to front
  beds?: number;          // Optional with default 0
  baths?: number;         // Optional with default 1
  sqft?: number;          // Optional with default 0
  numberOfUnits?: number; // Optional with default 1
}

export interface OtherIncomeItem {
  category: string;
  amount: number;
}

export interface FinanceData {
  downPayment: number;
  downPaymentType: DownPaymentType;
  interestRate: number;
  loanTerm: number;
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
  annualPropertyTaxes: number;
  annualPropertyInsurance: number;
  hoa: number;
  water: number;
  gas: number;
  electricity: number;
  landscapingSnowRemoval: number;
  internet: number;
  security: number;
  administrativeManagement: number;
  repairsMaintenancePercentage: number;
  propertyManagementPercentage: number;
  leasingFee: number;
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
  projectedRentGrowth: number;
  holdPeriod: number;
  averageLeaseLength: number;
  expenseGrowthRate: number;
  appreciationRate: number;
  vacancyRate: number;
  units: Unit[];
  otherIncome?: OtherIncomeItem[];
  finance: FinanceData;
  expenses: ExpenseData;
  rehab?: RehabData;
}

export interface PropertySummary {
  id: string;
  address: string;
  purchasePrice: number;
  propertyType: PropertyType;
  projectedRentGrowth: number;
  holdPeriod: number;
  averageLeaseLength: number;
  expenseGrowthRate: number;
  appreciationRate: number;
  vacancyRate: number;
  units: Unit[];
  otherIncome?: OtherIncomeItem[];
  finance: FinanceData;
  expenses: ExpenseData;
  rehab?: RehabData;
  userId: string;
  nickname?: string;
  imageUrl?: string;
}