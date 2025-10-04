// Backend API service for complex calculations
// src/services/propertyApi.ts

import { PropertyData, PropertySummary } from '../types/property';

const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api`;

export interface PropertyAnalysis {
  monthlyIncome: number;
  effectiveMonthlyIncome: number;
  monthlyExpenses: number;
  monthlyMortgage: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  totalCashInvested: number;
  cashOnCashReturn: number;
  capRate: number;
  netOperatingIncome: number;
  loanAmount: number;
  downPayment: number;
  expenseBreakdown: Record<string, number>;
  debtServiceCoverage: number;
  loanToValue: number;
  vacancyRate: number;
  returnAnalysis: {
    irr: number;
    cashOnCashReturn: number;
    totalReturn: number;
    totalReturnPercentage: number;
    averageAnnualCashFlow: number;
    initialInvestment: number;
    projectedFinalValue: number;
  };
}

export interface PropertyProjections {
  projections: Array<{
    year: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlyCashFlow: number;
    annualIncome: number;
    annualExpenses: number;
    annualCashFlow: number;
    propertyValue: number;
    monthlyMortgage: number;
    annualMortgage: number;
    cashFlowAfterMortgage: number;
    capRate: number;
    netOperatingIncome: number;
  }>;
  assumptions: {
    rentGrowthRate: number;
    expenseGrowthRate: number;
    appreciationRate: number;
    holdPeriod: number;
    vacancyRate: number;
    capitalExpenditureRate: number;
  };
  summary: {
    totalCashFlow: number;
    averageAnnualCashFlow: number;
    finalPropertyValue: number;
  };
}

class PropertyApiService {
  // Create a new property
  async createProperty(propertyData: PropertyData): Promise<PropertySummary> {
    const response = await fetch(`${API_BASE_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create property');
    }

    return response.json();
  }

  // Get all user properties
  async getProperties(): Promise<PropertySummary[]> {
    const response = await fetch(`${API_BASE_URL}/properties`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }

    return response.json();
  }

  // Get a single property
  async getProperty(id: string): Promise<PropertySummary> {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Property not found');
    }

    return response.json();
  }

  // Update a property
  async updateProperty(id: string, propertyData: PropertyData): Promise<PropertySummary> {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update property');
    }

    return response.json();
  }

  // Delete a property
  async deleteProperty(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete property');
    }
  }

  // Get comprehensive financial analysis (backend calculation)
  async getPropertyAnalysis(id: string): Promise<PropertyAnalysis> {
    const response = await fetch(`${API_BASE_URL}/properties/${id}/analysis`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get analysis');
    }

    return response.json();
  }

  // Get multi-year projections (backend calculation)
  async getPropertyProjections(id: string): Promise<PropertyProjections> {
    const response = await fetch(`${API_BASE_URL}/properties/${id}/projections`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get projections');
    }

    return response.json();
  }

  // Duplicate a property
  async duplicateProperty(id: string): Promise<PropertySummary> {
    const response = await fetch(`${API_BASE_URL}/properties/${id}/duplicate`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to duplicate property');
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error('Backend health check failed');
    }

    return response.json();
  }
}

export const propertyApi = new PropertyApiService();
