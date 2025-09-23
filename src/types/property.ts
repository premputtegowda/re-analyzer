// src/types/property.ts

export type PropertyType = 'Single Family Home' | 'MultiFamily' | 'Townhouse' | 'Condo';

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

export interface PropertyData {
  address: string;
  purchasePrice: number;
  propertyType: PropertyType;
  units: Unit[];
  otherIncome?: OtherIncomeItem[];
}