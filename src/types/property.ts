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

export interface YearlyRehabCost {
  year: number;
  items: RehabCostItem[];
}

export interface RehabData {
  hardCosts: RehabCostItem[];
  softCosts: RehabCostItem[];
  lostRevenueAndCosts: YearlyRehabCost[];
}

export interface PropertyData {
  address: string;
  purchasePrice: number;
  propertyType: PropertyType;
  hasRehabWork: boolean;
  hasRehabRevenueImpact: boolean;
  incomeRentGrowth: number;              // Rent growth from Income section
  incomeAppreciationRate: number;        // Appreciation rate from Income section
  projectedRentGrowth: number;           // Rent growth for analysis (from Summary)
  holdPeriod: number;                    // Property hold period (from Property Information)
  analysisHoldPeriod: number;           // Analysis hold period (used in Summary calculations)
  averageLeaseLength: number;           // Average lease length from Income section
  analysisAverageLeaseLength: number;   // Average lease length for analysis (from Summary)
  expenseGrowthRate: number;            // Expense growth rate for analysis (from Summary)
  expensesExpenseGrowthRate: number;    // Expense growth rate from Expenses section
  appreciationRate: number;              // Appreciation rate for analysis (from Summary)
  vacancyRate: number;                  // Vacancy rate for analysis (from Summary)
  expensesVacancyRate: number;          // Vacancy rate from Expenses section
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
  hasRehabWork: boolean;
  hasRehabRevenueImpact: boolean;
  incomeRentGrowth: number;              // Rent growth from Income section
  incomeAppreciationRate: number;        // Appreciation rate from Income section
  projectedRentGrowth: number;           // Rent growth for analysis (from Summary)
  holdPeriod: number;                    // Property hold period (from Property Information)
  analysisHoldPeriod: number;           // Analysis hold period (used in Summary calculations)
  averageLeaseLength: number;           // Average lease length from Income section
  analysisAverageLeaseLength: number;   // Average lease length for analysis (from Summary)
  expenseGrowthRate: number;            // Expense growth rate for analysis (from Summary)
  expensesExpenseGrowthRate: number;    // Expense growth rate from Expenses section
  appreciationRate: number;              // Appreciation rate for analysis (from Summary)
  vacancyRate: number;                  // Vacancy rate for analysis (from Summary)
  expensesVacancyRate: number;          // Vacancy rate from Expenses section
  units: Unit[];
  otherIncome?: OtherIncomeItem[];
  finance: FinanceData;
  expenses: ExpenseData;
  rehab?: RehabData;
  userId: string;
  nickname?: string;
  imageUrl?: string;
}