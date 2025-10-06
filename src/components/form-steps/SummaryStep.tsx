import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { PropertyData } from '../../types/property';
import { ChevronDown, ChevronUp, AlertTriangle, Check, X } from 'lucide-react';
import { XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, Legend } from 'recharts';
import { generateChartData } from '../../utils/calculations';

interface SummaryStepProps {
  touchedSections: Set<number>;
}

export default function SummaryStep({ touchedSections }: SummaryStepProps) {
  const { watch, register, setValue } = useFormContext<PropertyData>();
  const [viewMode, setViewMode] = useState<'monthly' | 'annual'>('monthly');
  const [isProjectionsCollapsed, setIsProjectionsCollapsed] = useState<boolean>(false);
  const [isCashFlowCollapsed, setIsCashFlowCollapsed] = useState<boolean>(false);
  const [isInvestmentProjectionsCollapsed, setIsInvestmentProjectionsCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'simulation'>('overview');
  
  // Investment Projections field toggles
  const [showRentGrowthSlider, setShowRentGrowthSlider] = useState<boolean>(false);
  const [showExpenseGrowthSlider, setShowExpenseGrowthSlider] = useState<boolean>(false);
  const [showAppreciationSlider, setShowAppreciationSlider] = useState<boolean>(false);
  const [showHoldPeriodSlider, setShowHoldPeriodSlider] = useState<boolean>(false);
  const [showLeaseSlider, setShowLeaseSlider] = useState<boolean>(false);
  const [showVacancySlider, setShowVacancySlider] = useState<boolean>(false);

  // Function to collapse all sliders except the specified one
  const collapseAllSlidersExcept = (activeSlider: string) => {
    if (activeSlider !== 'rentGrowth') setShowRentGrowthSlider(false);
    if (activeSlider !== 'expenseGrowth') setShowExpenseGrowthSlider(false);
    if (activeSlider !== 'appreciation') setShowAppreciationSlider(false);
    if (activeSlider !== 'holdPeriod') setShowHoldPeriodSlider(false);
    if (activeSlider !== 'lease') setShowLeaseSlider(false);
    if (activeSlider !== 'vacancy') setShowVacancySlider(false);
  };
  
  const formData = watch();

  // Set projectedRentGrowth to default to incomeRentGrowth value when Summary loads
  // Set appreciationRate to default to incomeAppreciationRate value when Summary loads
  // Set analysisAverageLeaseLength to default to averageLeaseLength value when Summary loads
  useEffect(() => {
    if (formData.incomeRentGrowth !== undefined && formData.projectedRentGrowth === undefined) {
      setValue('projectedRentGrowth', formData.incomeRentGrowth);
    }
    if (formData.incomeAppreciationRate !== undefined && formData.appreciationRate === undefined) {
      setValue('appreciationRate', formData.incomeAppreciationRate);
    }
    if (formData.averageLeaseLength !== undefined && formData.analysisAverageLeaseLength === undefined) {
      setValue('analysisAverageLeaseLength', formData.averageLeaseLength);
    }
  }, [formData.incomeRentGrowth, formData.projectedRentGrowth, formData.incomeAppreciationRate, formData.appreciationRate, 
      formData.averageLeaseLength, formData.analysisAverageLeaseLength, setValue]);

  // --- Calculation Functions ---

  const calculateTotalMonthlyIncome = () => {
    if (!formData.units && !formData.otherIncome) return 0;
    
    const totalUnitRent = formData.units?.reduce((acc, unit) => {
      const rent = unit.monthlyRent || 0;
      const numberOfUnits = unit.numberOfUnits || 1;
      return acc + (rent * numberOfUnits);
    }, 0) || 0;

    const totalOtherIncome = formData.otherIncome?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;

    return totalUnitRent + totalOtherIncome;
  };
  
  const calculateDownPaymentAmount = () => {
    const { purchasePrice, finance } = formData;
    if (purchasePrice && finance?.downPayment) {
        if (finance.downPaymentType === 'percentage') {
            return (purchasePrice * finance.downPayment) / 100;
        }
        return finance.downPayment;
    }
    return 0;
  };

  const calculateLoanAmount = () => {
    const { purchasePrice } = formData;
    return purchasePrice > 0 ? purchasePrice - calculateDownPaymentAmount() : 0;
  };

  const calculatePointsAmount = () => {
    const loanAmount = calculateLoanAmount();
    const { finance } = formData;
    if (loanAmount && finance?.points) {
      return (loanAmount * finance.points) / 100;
    }
    return 0;
  };

  const calculateTotalOneTimeExpenses = () => {
    const { expenses } = formData;
    if (!expenses || !expenses.oneTimeExpenses) return 0;
    return expenses.oneTimeExpenses.reduce((acc, item) => acc + (item.amount || 0), 0);
  };

  const calculateTotalDevelopmentCosts = () => {
    const { rehab } = formData;
    if (!rehab) return 0;
    const hardCosts = rehab.hardCosts?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;
    const softCosts = rehab.softCosts?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;
    return hardCosts + softCosts;
  };

  const calculateTotalLostRevenue = () => {
      const { rehab } = formData;
      if (!rehab || !rehab.lostRevenueAndCosts) return 0;
      return rehab.lostRevenueAndCosts.reduce((acc, yearData) => 
        acc + yearData.items.reduce((yearAcc, item) => yearAcc + (item.amount || 0), 0), 0
      );
  };

  const calculateAcquisitionCost = () => {
    const downPayment = calculateDownPaymentAmount();
    const closingCosts = formData.finance?.closingCosts || 0;
    const pointsAmount = calculatePointsAmount();
    const otherLoanCosts = formData.finance?.otherCosts || 0;
    const oneTimeExpenses = calculateTotalOneTimeExpenses();
    const developmentCosts = calculateTotalDevelopmentCosts();
    const lostRevenue = calculateTotalLostRevenue();

    return downPayment + closingCosts + pointsAmount + otherLoanCosts + oneTimeExpenses + developmentCosts + lostRevenue;
  };
  
  const calculateMonthlyPayment = () => {
    const principal = calculateLoanAmount();
    const monthlyInterestRate = (formData.finance?.interestRate || 0) / 100 / 12;
    const numberOfPayments = (formData.finance?.loanTerm || 0) * 12;

    if (principal > 0 && monthlyInterestRate > 0 && numberOfPayments > 0) {
      const numerator = monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments);
      const denominator = Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1;
      return principal * (numerator / denominator);
    }
    return 0;
  };

  const calculateTotalMonthlyRecurringExpenses = () => {
    const { expenses } = formData;
    if (!expenses) return 0;

    const monthlyTaxes = (expenses.annualPropertyTaxes || 0) / 12;
    const monthlyInsurance = (expenses.annualPropertyInsurance || 0) / 12;

    const fixedMonthlyExpenses = 
      (expenses.hoa || 0) +
      (expenses.water || 0) +
      (expenses.gas || 0) +
      (expenses.electricity || 0) +
      (expenses.landscapingSnowRemoval || 0) +
      (expenses.internet || 0) +
      (expenses.security || 0) +
      (expenses.administrativeManagement || 0);

    const percentageBasedExpenses =
      ((calculateTotalMonthlyIncome() * (expenses.repairsMaintenancePercentage || 0)) / 100) +
      ((calculateTotalMonthlyIncome() * (expenses.propertyManagementPercentage || 0)) / 100);
      
    const customRecurringExpenses = expenses.customExpenses.reduce((acc, item) => acc + (item.amount || 0), 0);

    return monthlyTaxes + monthlyInsurance + fixedMonthlyExpenses + percentageBasedExpenses + customRecurringExpenses;
  };

  const calculateCashOnCashROI = () => {
    const totalCashInvested = calculateAcquisitionCost();
    const yearlyCashFlows = calculateYearlyCashFlows();
    
    if (totalCashInvested > 0 && yearlyCashFlows.length > 0) {
      // Calculate average annual cash flow over the holding period
      const totalAnnualCashFlow = yearlyCashFlows.reduce((sum, year) => sum + year.annualCashFlow, 0);
      const averageAnnualCashFlow = totalAnnualCashFlow / yearlyCashFlows.length;
      return (averageAnnualCashFlow / totalCashInvested) * 100;
    }
    return 0;
  };

  // IRR Calculation using Newton-Raphson method
  const calculateIRR = () => {
    const cashFlows = calculateYearlyCashFlows();
    const initialInvestment = calculateAcquisitionCost();
    
    if (cashFlows.length === 0 || initialInvestment <= 0) return 0;
    
    // Create cash flow array: negative initial investment + positive annual cash flows
    const flows = [-initialInvestment, ...cashFlows.map(cf => cf.annualCashFlow)];
    
    // Newton-Raphson method to find IRR
    let rate = 0.1; // Initial guess: 10%
    const maxIterations = 100;
    const tolerance = 0.0001;
    
    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dnpv = 0;
      
      for (let j = 0; j < flows.length; j++) {
        const factor = Math.pow(1 + rate, j);
        npv += flows[j] / factor;
        if (j > 0) {
          dnpv -= j * flows[j] / Math.pow(1 + rate, j + 1);
        }
      }
      
      if (Math.abs(npv) < tolerance) {
        return rate * 100; // Convert to percentage
      }
      
      if (Math.abs(dnpv) < tolerance) {
        break; // Avoid division by zero
      }
      
      rate = rate - npv / dnpv;
      
      // Boundary conditions
      if (rate < -0.99) rate = -0.99;
      if (rate > 10) rate = 10;
    }
    
    return rate * 100; // Convert to percentage
  };

  const calculateYearlyCashFlows = () => {
    const holdPeriod = formData.analysisHoldPeriod || 5;
    const rentGrowthRate = (formData.projectedRentGrowth || 2) / 100;
    const expenseGrowthRate = (formData.expenseGrowthRate || 3) / 100;
    const baseMonthlyIncome = calculateTotalMonthlyIncome();
    const baseMonthlyExpenses = calculateTotalMonthlyRecurringExpenses() + calculateMonthlyPayment();
    
    const yearlyCashFlows = [];
    
    for (let year = 1; year <= holdPeriod; year++) {
      // Calculate projected monthly income for this year (compounded growth)
      const projectedMonthlyIncome = baseMonthlyIncome * Math.pow(1 + rentGrowthRate, year - 1);
      
      // Calculate projected monthly expenses for this year (compounded growth)
      const projectedMonthlyExpenses = baseMonthlyExpenses * Math.pow(1 + expenseGrowthRate, year - 1);
      
      const projectedMonthlyCashFlow = projectedMonthlyIncome - projectedMonthlyExpenses;
      const projectedAnnualCashFlow = projectedMonthlyCashFlow * 12;
      
      yearlyCashFlows.push({
        year,
        monthlyIncome: projectedMonthlyIncome,
        monthlyExpenses: projectedMonthlyExpenses,
        monthlyCashFlow: projectedMonthlyCashFlow,
        annualCashFlow: projectedAnnualCashFlow,
      });
    }
    
    return yearlyCashFlows;
  };

  const calculateAverageCashFlow = () => {
    const yearlyCashFlows = calculateYearlyCashFlows();
    if (yearlyCashFlows.length === 0) return 0;
    
    const totalCashFlow = yearlyCashFlows.reduce((sum, year) => sum + year.annualCashFlow, 0);
    return totalCashFlow / yearlyCashFlows.length;
  };

  const calculateLoanBalanceByYear = () => {
    const principal = calculateLoanAmount();
    const monthlyRate = (formData.finance?.interestRate || 0) / 100 / 12;
    const totalPayments = (formData.finance?.loanTerm || 30) * 12;
    const holdPeriod = formData.analysisHoldPeriod || 5;
    
    if (principal <= 0 || monthlyRate <= 0 || totalPayments <= 0) return [];
    
    // Calculate monthly payment using amortization formula
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                          (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    const yearlyBalances = [];
    let remainingBalance = principal;
    
    for (let year = 1; year <= holdPeriod; year++) {
      let yearlyPrincipalPaid = 0;
      let yearlyInterestPaid = 0;
      
      // Calculate 12 months of payments for this year
      for (let month = 1; month <= 12; month++) {
        if (remainingBalance <= 0.01) break; // Stop if loan is essentially paid off
        
        // Calculate interest portion for this month
        const monthlyInterest = remainingBalance * monthlyRate;
        
        // Calculate principal portion for this month
        const monthlyPrincipal = Math.min(monthlyPayment - monthlyInterest, remainingBalance);
        
        // Update running totals
        yearlyInterestPaid += monthlyInterest;
        yearlyPrincipalPaid += monthlyPrincipal;
        remainingBalance -= monthlyPrincipal;
      }
      
      yearlyBalances.push({
        year,
        remainingBalance: Math.max(0, remainingBalance),
        yearlyPrincipalPaid,
        yearlyInterestPaid,
        totalYearlyPayment: yearlyPrincipalPaid + yearlyInterestPaid
      });
    }
    
    return yearlyBalances;
  };

  const calculatePropertyValueByYear = () => {
    const currentValue = formData.purchasePrice || 0;
    const appreciationRate = (formData.appreciationRate || 2) / 100;
    const holdPeriod = formData.analysisHoldPeriod || 5;
    
    const yearlyValues = [];
    
    for (let year = 1; year <= holdPeriod; year++) {
      const appreciatedValue = currentValue * Math.pow(1 + appreciationRate, year);
      yearlyValues.push({
        year,
        propertyValue: appreciatedValue
      });
    }
    
    return yearlyValues;
  };

  const calculateNetProceedsByYear = () => {
    const loanBalances = calculateLoanBalanceByYear();
    const propertyValues = calculatePropertyValueByYear();
    
    const netProceeds = [];
    
    for (let i = 0; i < Math.min(loanBalances.length, propertyValues.length); i++) {
      const year = loanBalances[i].year;
      const salePrice = propertyValues[i].propertyValue;
      const remainingLoan = loanBalances[i].remainingBalance;
      const sellingCosts = salePrice * 0.07; // 7% selling costs
      const netProceeds_value = salePrice - remainingLoan - sellingCosts;
      
      netProceeds.push({
        year,
        salePrice,
        remainingLoan,
        sellingCosts,
        netProceeds: netProceeds_value
      });
    }
    
    return netProceeds;
  };

  const totalMonthlyIncome = calculateTotalMonthlyIncome();
  const totalMonthlyExpenses = calculateTotalMonthlyRecurringExpenses() + calculateMonthlyPayment();
  const monthlyCashFlow = totalMonthlyIncome - totalMonthlyExpenses;
  const cashOnCashROI = calculateCashOnCashROI();
  const irr = calculateIRR();
  const yearlyCashFlows = calculateYearlyCashFlows();
  const averageAnnualCashFlow = calculateAverageCashFlow();

  // Prepare data for cash flow line chart using frontend calculation
  const holdPeriod = formData.analysisHoldPeriod || 5;
  const frontendChartData = generateChartData(formData, holdPeriod);
  
  // Use frontend data if available, otherwise fallback to existing calculation
  const cashFlowChartData = frontendChartData.length > 0 ? frontendChartData : yearlyCashFlows.map(yearData => ({
    year: `Year ${yearData.year}`,
    Income: Math.round(yearData.monthlyIncome * 12), // Annual income
    'Operating Expenses': Math.round((yearData.monthlyExpenses - calculateMonthlyPayment()) * 12), // Annual operating expenses (excluding loan payment)
    'Net Income': Math.round(yearData.monthlyIncome * 12 - (yearData.monthlyExpenses - calculateMonthlyPayment()) * 12), // Annual net income before debt service
    'Cash Flow': Math.round(yearData.annualCashFlow), // Annual cash flow after all expenses
  }));

  const chartData = [
    { name: 'Income', value: totalMonthlyIncome, fill: '#10B981' },
    { name: 'Spending', value: totalMonthlyExpenses, fill: '#EF4444' },
    { name: 'Net cash flow', value: monthlyCashFlow, fill: monthlyCashFlow >= 0 ? '#3B82F6' : '#EF4444' },
  ];

  const maxValue = Math.max(totalMonthlyIncome, totalMonthlyExpenses);

  // --- Validation Functions ---
  const validateProperty = () => {
    return !!(formData.address && formData.address.trim() !== '' && formData.purchasePrice && formData.purchasePrice > 0);
  };

  const validateIncome = () => {
    const hasValidUnit = formData.units?.some(unit => 
      unit.monthlyRent && unit.monthlyRent > 0
    );
    
    // Validate other income if any exist
    if (formData.otherIncome && formData.otherIncome.length > 0) {
      for (const income of formData.otherIncome) {
        // Category validation
        if (!income.category) {
          return false;
        }
        // Amount validation
        if (!income.amount || income.amount <= 0) {
          return false;
        }
      }
    }
    
    return !!hasValidUnit;
  };

  const validateFinancing = () => {
    // Use the enhanced validation that includes closing costs conditionals
    return validateFinancingClosingCosts();
  };

  const validateExpenses = () => {
    // Property taxes and insurance are required for meaningful analysis
    if (!formData.expenses) return false;
    
    // Always required fields
    const alwaysRequired = ['annualPropertyTaxes', 'annualPropertyInsurance'];
    for (const field of alwaysRequired) {
      const value = formData.expenses[field as keyof typeof formData.expenses];
      if (typeof value !== 'number' || !value || value <= 0) return false;
    }
    
    // Validate custom expenses if any exist
    if (formData.expenses.customExpenses && formData.expenses.customExpenses.length > 0) {
      for (const expense of formData.expenses.customExpenses) {
        // Category validation
        if (!expense.category ) {
          return false;
        }
        // Amount validation
        if (!expense.amount || expense.amount <= 0) {
          return false;
        }
      }
    }
    
    // Validate one-time expenses if any exist
    if (formData.expenses.oneTimeExpenses && formData.expenses.oneTimeExpenses.length > 0) {
      for (const expense of formData.expenses.oneTimeExpenses) {
        // Category validation
        if (!expense.category ) {
          return false;
        }
        // Amount validation
        if (!expense.amount || expense.amount <= 0) {
          return false;
        }
      }
    }
    
    return true;
  };

  const validateFinancingClosingCosts = () => {
    if (!formData.finance) return false;
    
    // Basic financing validation
    const financeRequired = ['downPayment', 'downPaymentType', 'interestRate', 'loanTerm'];
    for (const field of financeRequired) {
      const value = formData.finance[field as keyof typeof formData.finance];
      if (value === undefined || value === null) return false;
    }
    
    // Interest rate must be greater than 0
    if (!formData.finance.interestRate || formData.finance.interestRate <= 0) return false;
    
    // Conditional: If closing costs are specified, they should be >= 0
    if (formData.finance.closingCosts !== undefined && formData.finance.closingCosts <= 0) {
      return false;
    }
    
    // Conditional: If points are specified, they should be >= 0 and <= 10
    if (formData.finance.points !== undefined && 
        (formData.finance.points < 0 || formData.finance.points > 10)) {
      return false;
    }
    
    // Conditional: If other costs are specified, they should be >= 0
    if (formData.finance.otherCosts !== undefined && formData.finance.otherCosts < 0) {
      return false;
    }
    
    return true;
  };

  const validateRehab = () => {
    // If rehab work is not required, this step is always valid
    if (!formData.hasRehabWork) return true;
    
    // If rehab work is required, must have at least one hard cost line item
    if (!formData.rehab || !formData.rehab.hardCosts || formData.rehab.hardCosts.length === 0) {
      return false;
    }
    
    // Check that at least one hard cost has both category and amount > 0
    const hasValidHardCost = formData.rehab.hardCosts.some(cost => 
      cost.category && cost.category.trim() !== '' && cost.amount && cost.amount > 0
    );
    
    return hasValidHardCost;
  };

  const getValidationErrorMessage = (section: string) => {
    if (section === 'Rehab/Development' && formData.hasRehabWork) {
      return 'Please enter rehab and development (hard cost) estimate';
    }
    return null;
  };

  // Dynamic validation array that includes conditional requirements
  const getDynamicValidations = () => {
    const validations = [
      { section: 'Property Information', isValid: validateProperty(), step: 1 },
      { section: 'Financing', isValid: validateFinancing(), step: 2 },
      { section: 'Income', isValid: validateIncome(), step: 3 },
      { section: 'Expenses', isValid: validateExpenses(), step: 4 },
    ];

    // Add rehab validation if rehab work is required
    if (formData.hasRehabWork) {
      validations.push({
        section: 'Rehab/Development',
        isValid: validateRehab(),
        step: 5
      });
    }

    return validations;
  };

  const incompleteValidations = getDynamicValidations();

  const incompleteSections = incompleteValidations.filter(v => !v.isValid);
  
  const hasIncompleteSections = incompleteSections.length > 0;

  // Always show all main sections for status navigation
  const allSections = [
    { section: 'Property Information', isValid: validateProperty(), step: 1, isTouched: touchedSections.has(1) },
    { section: 'Financing', isValid: validateFinancing(), step: 2, isTouched: touchedSections.has(2) },
    { section: 'Income', isValid: validateIncome(), step: 3, isTouched: touchedSections.has(3) },
    { section: 'Expenses', isValid: validateExpenses(), step: 4, isTouched: touchedSections.has(4) },
    ...(formData.hasRehabWork ? [{ section: 'Development/Rehab', isValid: validateRehab(), step: 5, isTouched: touchedSections.has(5) }] : []),
    { section: 'Summary', isValid: true, step: 6, isTouched: true }, // Summary is always valid since we're on it
  ];

  const getValidationMessage = (section: { section: string; isValid: boolean; step: number; isTouched: boolean }) => {
    if (!section.isTouched) {
      return 'Please complete this section to see analysis';
    } else if (!section.isValid) {
      const specificMessage = getValidationErrorMessage(section.section);
      return specificMessage || `Please complete ${section.section.toLowerCase()} requirements`;
    }
    return null;
  };

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Step 6: Summary</h2>
        <p className="text-slate-500">Review the complete analysis of your property below.</p>
        
        {/* Validation Messages */}
        {hasIncompleteSections && (
          <div className="mt-4">
            <div className="p-3 rounded-md border bg-blue-50 border-blue-200 text-blue-700">
              <div className="text-center">
                <p className="text-sm font-medium mb-3">Complete all sections to view analysis</p>
                
                {/* Circular Checkbox Legend */}
                <div className="flex justify-center items-center gap-4 md:gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 min-w-4 min-h-4 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    </div>
                    <span className="text-gray-600">Not Started</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 min-w-4 min-h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-green-700">Complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 min-w-4 min-h-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <span className="text-red-700">Incomplete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'overview' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500'}`}
          >
            <div className="text-left">
              <div className="font-medium">Overview</div>
              <div className="hidden md:block text-xs text-slate-400 mt-0.5">Analysis & Cash Flow</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('simulation')}
            className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'simulation' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500'}`}
          >
            <div className="text-left">
              <div className="font-medium">Simulation</div>
              <div className="hidden md:block text-xs text-slate-400 mt-0.5">Projections & Exit Analysis</div>
            </div>
          </button>
        </div>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Cash Flow Line Chart */}
          <div className="mb-6 bg-white p-3 sm:p-6 rounded-lg shadow-md">
            <h4 className="text-lg sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">Cash Flow Over Time</h4>
            <div className="h-56 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={cashFlowChartData} 
                  margin={{ top: 5, right: 15, left: 10, bottom: 35 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="year" 
                    tick={{ fontSize: 10 }}
                    stroke="#64748b"
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    stroke="#64748b"
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    width={45}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                      name
                    ]}
                    labelStyle={{ color: '#1e293b', fontSize: '12px' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                      padding: '8px',
                      maxWidth: '200px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: '11px',
                      paddingTop: '10px'
                    }}
                    iconSize={12}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Income" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Operating Expenses" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 5, stroke: '#F59E0B', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Net Income" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 5, stroke: '#3B82F6', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Cash Flow" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 5, stroke: '#8B5CF6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Key Financials</h3>
        
        <div className="flex gap-2 sm:gap-4 text-center">
          <div className="bg-rose-50 p-2 sm:p-4 rounded-lg shadow w-full">
            <p className="text-xs sm:text-sm font-medium text-rose-800">Acquisition Cost</p>
            <p className="text-sm sm:text-2xl lg:text-3xl font-bold text-rose-600">${calculateAcquisitionCost().toLocaleString()}</p>
          </div>
          <div className="bg-sky-50 p-2 sm:p-4 rounded-lg shadow w-full">
            <p className="text-xs sm:text-sm font-medium text-sky-800">Avg Cash on Cash ROI</p>
            <p className="text-sm sm:text-2xl lg:text-3xl font-bold text-sky-600">{cashOnCashROI.toFixed(2)}%</p>
          </div>
          <div className="bg-purple-50 p-2 sm:p-4 rounded-lg shadow w-full">
            <p className="text-xs sm:text-sm font-medium text-purple-800">IRR</p>
            <p className="text-sm sm:text-2xl lg:text-3xl font-bold text-purple-600">{irr.toFixed(2)}%</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl sm:text-2xl font-bold text-slate-800">Track your cash flow</h4>
            
            {/* Mobile collapse button */}
            <button
              type="button"
              onClick={() => setIsCashFlowCollapsed(!isCashFlowCollapsed)}
              className="sm:hidden p-1 rounded-md hover:bg-slate-100 transition-colors"
              aria-label={isCashFlowCollapsed ? "Expand cash flow chart" : "Collapse cash flow chart"}
            >
              {isCashFlowCollapsed ? (
                <ChevronDown className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronUp className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>
          
          {/* Collapsible content */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isCashFlowCollapsed ? 'sm:block hidden' : 'block'
          }`}>
            <div className="space-y-4">
              {chartData.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-base sm:text-lg font-semibold text-slate-800">{item.name}</p>
                    <p className="text-base sm:text-lg font-semibold text-slate-800">${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full" style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: item.fill }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Yearly Cash Flow Projections */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center justify-between sm:justify-start">
                <h4 className="text-xl sm:text-2xl font-bold text-slate-800">Cash Flow Projections</h4>
                
                {/* Mobile collapse button */}
                <button
                  type="button"
                  onClick={() => setIsProjectionsCollapsed(!isProjectionsCollapsed)}
                  className="sm:hidden p-1 rounded-md hover:bg-slate-100 transition-colors"
                  aria-label={isProjectionsCollapsed ? "Expand projections" : "Collapse projections"}
                >
                  {isProjectionsCollapsed ? (
                    <ChevronDown className="w-5 h-5 text-slate-600" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-slate-600" />
                  )}
                </button>
              </div>
              
              {/* Toggle buttons */}
              <div className={`flex bg-slate-100 rounded-lg p-1 w-fit transition-all duration-200 ${
                isProjectionsCollapsed ? 'sm:flex hidden' : 'flex'
              }`}>
                <button
                  type="button"
                  onClick={() => setViewMode('monthly')}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'monthly'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('annual')}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'annual'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Annual
                </button>
              </div>
            </div>
            
            <div className={`text-left sm:text-right transition-all duration-200 ${
              isProjectionsCollapsed ? 'sm:block hidden' : 'block'
            }`}>
              <p className="text-xs sm:text-sm font-medium text-slate-600">
                Avg {viewMode === 'monthly' ? 'Monthly' : 'Annual'} Cash Flow
              </p>
              <p className={`text-lg sm:text-xl font-bold ${averageAnnualCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ${viewMode === 'monthly' 
                  ? (averageAnnualCashFlow / 12).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                  : averageAnnualCashFlow.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                }
              </p>
            </div>
          </div>
          
          {/* Collapsible content */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isProjectionsCollapsed ? 'sm:block hidden' : 'block'
          }`}>
          
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm font-medium text-slate-700">Year</th>
                  <th className="px-1 sm:px-4 py-2 text-right text-xs sm:text-sm font-medium text-slate-700">
                    <span className="hidden sm:inline">{viewMode === 'monthly' ? 'Monthly' : 'Annual'} </span>Income
                  </th>
                  <th className="px-1 sm:px-4 py-2 text-right text-xs sm:text-sm font-medium text-slate-700">
                    <span className="hidden sm:inline">{viewMode === 'monthly' ? 'Monthly' : 'Annual'} </span>Expenses
                  </th>
                  <th className="px-1 sm:px-4 py-2 text-right text-xs sm:text-sm font-medium text-slate-700">
                    <span className="hidden sm:inline">{viewMode === 'monthly' ? 'Monthly' : 'Annual'} </span>Cash Flow
                  </th>
                </tr>
              </thead>
              <tbody>
                {yearlyCashFlows.map((yearData) => (
                  <tr key={yearData.year} className="border-b border-slate-200">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-slate-800">
                      <span className="sm:hidden">Y{yearData.year}</span>
                      <span className="hidden sm:inline">Year {yearData.year}</span>
                    </td>
                    <td className="px-1 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right text-slate-600">
                      <span className="block sm:hidden">
                        ${viewMode === 'monthly' 
                          ? Math.round(yearData.monthlyIncome).toLocaleString()
                          : Math.round(yearData.monthlyIncome * 12).toLocaleString()
                        }
                      </span>
                      <span className="hidden sm:block">
                        ${viewMode === 'monthly' 
                          ? yearData.monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : (yearData.monthlyIncome * 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                      </span>
                    </td>
                    <td className="px-1 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right text-slate-600">
                      <span className="block sm:hidden">
                        ${viewMode === 'monthly' 
                          ? Math.round(yearData.monthlyExpenses).toLocaleString()
                          : Math.round(yearData.monthlyExpenses * 12).toLocaleString()
                        }
                      </span>
                      <span className="hidden sm:block">
                        ${viewMode === 'monthly' 
                          ? yearData.monthlyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : (yearData.monthlyExpenses * 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                      </span>
                    </td>
                    <td className={`px-1 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-right font-bold ${
                      (viewMode === 'monthly' ? yearData.monthlyCashFlow : yearData.annualCashFlow) >= 0 
                        ? 'text-emerald-600' 
                        : 'text-red-600'
                    }`}>
                      <span className="block sm:hidden">
                        ${viewMode === 'monthly' 
                          ? Math.round(yearData.monthlyCashFlow).toLocaleString()
                          : Math.round(yearData.annualCashFlow).toLocaleString()
                        }
                      </span>
                      <span className="hidden sm:block">
                        ${viewMode === 'monthly' 
                          ? yearData.monthlyCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : yearData.annualCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-slate-600">
              <strong>Projection Details:</strong> Based on {formData.projectedRentGrowth || 2}% annual rent growth and {formData.expenseGrowthRate || 3}% annual expense growth over {formData.analysisHoldPeriod || 5} years. 
              Both income and expenses grow annually with compound growth.
            </p>
          </div>
        </div>
      </div>
      </div>
        </>
      )}

      {/* Simulation Tab */}
      {activeTab === 'simulation' && (
        <div className="space-y-6">
          {/* Investment Projections Section */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-800">Investment Projections</h3>
              
              {/* Mobile collapse button */}
              <button
                type="button"
                onClick={() => setIsInvestmentProjectionsCollapsed(!isInvestmentProjectionsCollapsed)}
                className="sm:hidden p-1 rounded-md hover:bg-blue-100 transition-colors"
                aria-label={isInvestmentProjectionsCollapsed ? "Expand investment projections" : "Collapse investment projections"}
              >
                {isInvestmentProjectionsCollapsed ? (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                )}
              </button>
            </div>
            
            {/* Collapsible content */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isInvestmentProjectionsCollapsed ? 'sm:block hidden' : 'block'
            }`}>
              <div className="mb-3 p-2 bg-blue-100 rounded-md">
                <p className="text-xs text-blue-700 font-medium">💡 Tip: Use the sliders below to adjust projection values and see how they impact your investment returns</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
                {/* Rent Growth */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (showRentGrowthSlider) {
                        setShowRentGrowthSlider(false);
                      } else {
                        collapseAllSlidersExcept('rentGrowth');
                        setShowRentGrowthSlider(true);
                      }
                    }}
                    className={`w-full h-16 md:h-20 p-2 md:p-3 border rounded-lg transition-colors flex items-center justify-between ${
                      showRentGrowthSlider 
                        ? 'bg-blue-100 border-blue-500 shadow-md' 
                        : 'bg-white border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <span className="text-xs md:text-sm font-medium text-slate-700 text-left">
                      <span className="block">Rent Growth:</span>
                      <span className="font-bold text-blue-600">{watch('projectedRentGrowth') || 2}%</span> per year
                    </span>
                    {showRentGrowthSlider ? (
                      <ChevronUp className="w-3 h-3 md:w-4 md:h-4 text-slate-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-slate-600 flex-shrink-0" />
                    )}
                  </button>
                </div>
                
                {/* Expense Growth Rate */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (showExpenseGrowthSlider) {
                        setShowExpenseGrowthSlider(false);
                      } else {
                        collapseAllSlidersExcept('expenseGrowth');
                        setShowExpenseGrowthSlider(true);
                      }
                    }}
                    className={`w-full h-16 md:h-20 p-2 md:p-3 border rounded-lg transition-colors flex items-center justify-between ${
                      showExpenseGrowthSlider 
                        ? 'bg-blue-100 border-blue-500 shadow-md' 
                        : 'bg-white border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <span className="text-xs md:text-sm font-medium text-slate-700 text-left">
                      <span className="block">Expense Growth:</span>
                      <span className="font-bold text-blue-600">{watch('expenseGrowthRate') || 3}%</span> per year
                    </span>
                    {showExpenseGrowthSlider ? (
                      <ChevronUp className="w-3 h-3 md:w-4 md:h-4 text-slate-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-slate-600 flex-shrink-0" />
                    )}
                  </button>
                </div>
                
                {/* Appreciation Rate */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (showAppreciationSlider) {
                        setShowAppreciationSlider(false);
                      } else {
                        collapseAllSlidersExcept('appreciation');
                        setShowAppreciationSlider(true);
                      }
                    }}
                    className={`w-full h-16 md:h-20 p-2 md:p-3 border rounded-lg transition-colors flex items-center justify-between ${
                      showAppreciationSlider 
                        ? 'bg-blue-100 border-blue-500 shadow-md' 
                        : 'bg-white border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <span className="text-xs md:text-sm font-medium text-slate-700 text-left">
                      <span className="block">Appreciation:</span>
                      <span className="font-bold text-blue-600">{watch('appreciationRate') || 2}%</span> per year
                    </span>
                    {showAppreciationSlider ? (
                      <ChevronUp className="w-3 h-3 md:w-4 md:h-4 text-slate-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-slate-600 flex-shrink-0" />
                    )}
                  </button>
                </div>
                
                {/* Hold Period */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (showHoldPeriodSlider) {
                        setShowHoldPeriodSlider(false);
                      } else {
                        collapseAllSlidersExcept('holdPeriod');
                        setShowHoldPeriodSlider(true);
                      }
                    }}
                    className={`w-full h-16 md:h-20 p-2 md:p-3 border rounded-lg transition-colors flex items-center justify-between ${
                      showHoldPeriodSlider 
                        ? 'bg-blue-100 border-blue-500 shadow-md' 
                        : 'bg-white border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <span className="text-xs md:text-sm font-medium text-slate-700 text-left">
                      <span className="block">Hold Period:</span>
                      <span className="font-bold text-blue-600">{watch('analysisHoldPeriod') || 5}</span> years
                    </span>
                    {showHoldPeriodSlider ? (
                      <ChevronUp className="w-3 h-3 md:w-4 md:h-4 text-slate-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-slate-600 flex-shrink-0" />
                    )}
                  </button>
                </div>
                
                {/* Average Lease Length */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (showLeaseSlider) {
                        setShowLeaseSlider(false);
                      } else {
                        collapseAllSlidersExcept('lease');
                        setShowLeaseSlider(true);
                      }
                    }}
                    className={`w-full h-16 md:h-20 p-2 md:p-3 border rounded-lg transition-colors flex items-center justify-between ${
                      showLeaseSlider 
                        ? 'bg-blue-100 border-blue-500 shadow-md' 
                        : 'bg-white border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <span className="text-xs md:text-sm font-medium text-slate-700 text-left">
                      <span className="block">Lease Length:</span>
                      <span className="font-bold text-blue-600">{watch('analysisAverageLeaseLength') || 12}</span> months
                    </span>
                    {showLeaseSlider ? (
                      <ChevronUp className="w-3 h-3 md:w-4 md:h-4 text-slate-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-slate-600 flex-shrink-0" />
                    )}
                  </button>
                </div>
                
                {/* Vacancy Rate */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (showVacancySlider) {
                        setShowVacancySlider(false);
                      } else {
                        collapseAllSlidersExcept('vacancy');
                        setShowVacancySlider(true);
                      }
                    }}
                    className={`w-full h-16 md:h-20 p-2 md:p-3 border rounded-lg transition-colors flex items-center justify-between ${
                      showVacancySlider 
                        ? 'bg-blue-100 border-blue-500 shadow-md' 
                        : 'bg-white border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <span className="text-xs md:text-sm font-medium text-slate-700 text-left">
                      <span className="block">Vacancy Rate:</span>
                      <span className="font-bold text-blue-600">{watch('vacancyRate') || 5}%</span> per year
                    </span>
                    {showVacancySlider ? (
                      <ChevronUp className="w-3 h-3 md:w-4 md:h-4 text-slate-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-slate-600 flex-shrink-0" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Full-width expanded sliders */}
              {showRentGrowthSlider && (
                <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Rent Growth Rate: <span className="font-bold text-blue-600">{watch('projectedRentGrowth') || 2}%</span> per year
                  </label>
                  <input
                    type="range"
                    id="projectedRentGrowth"
                    {...register('projectedRentGrowth', { valueAsNumber: true })}
                    min="-10"
                    max="20"
                    step="0.5"
                    defaultValue="2"
                    className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>-10%</span>
                    <span>0%</span>
                    <span>10%</span>
                    <span>20%</span>
                  </div>
                </div>
              )}
              
              {showExpenseGrowthSlider && (
                <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Expense Growth Rate: <span className="font-bold text-blue-600">{watch('expenseGrowthRate') || 3}%</span> per year
                  </label>
                  <input
                    type="range"
                    id="expenseGrowthRate"
                    {...register('expenseGrowthRate', { valueAsNumber: true })}
                    min="-5"
                    max="15"
                    step="0.5"
                    defaultValue="3"
                    className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>-5%</span>
                    <span>5%</span>
                    <span>10%</span>
                    <span>15%</span>
                  </div>
                </div>
              )}
              
              {showAppreciationSlider && (
                <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Property Appreciation Rate: <span className="font-bold text-blue-600">{watch('appreciationRate') || 2}%</span> per year
                  </label>
                  <input
                    type="range"
                    id="appreciationRate"
                    {...register('appreciationRate', { valueAsNumber: true })}
                    min="-5"
                    max="15"
                    step="0.5"
                    defaultValue="2"
                    className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>-5%</span>
                    <span>2%</span>
                    <span>8%</span>
                    <span>15%</span>
                  </div>
                </div>
              )}
              
              {showHoldPeriodSlider && (
                <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Investment Hold Period: <span className="font-bold text-blue-600">{watch('analysisHoldPeriod') || 5}</span> years
                  </label>
                  <input
                    type="range"
                    id="analysisHoldPeriod"
                    {...register('analysisHoldPeriod', { valueAsNumber: true })}
                    min="1"
                    max="50"
                    step="1"
                    defaultValue="5"
                    className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>1 year</span>
                    <span>10 years</span>
                    <span>25 years</span>
                    <span>50 years</span>
                  </div>
                </div>
              )}
              
              {showLeaseSlider && (
                <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Average Lease Length: <span className="font-bold text-blue-600">{watch('analysisAverageLeaseLength') || 12}</span> months
                  </label>
                  <input
                    type="range"
                    id="analysisAverageLeaseLength"
                    {...register('analysisAverageLeaseLength', { valueAsNumber: true })}
                    min="1"
                    max="60"
                    step="1"
                    defaultValue="12"
                    className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>1 month</span>
                    <span>12 months</span>
                    <span>36 months</span>
                    <span>60 months</span>
                  </div>
                </div>
              )}
              
              {showVacancySlider && (
                <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Vacancy Rate: <span className="font-bold text-blue-600">{watch('vacancyRate') || 5}%</span> per year
                  </label>
                  <input
                    type="range"
                    id="vacancyRate"
                    {...register('vacancyRate', { valueAsNumber: true })}
                    min="0"
                    max="30"
                    step="0.5"
                    defaultValue="5"
                    className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>0%</span>
                    <span>10%</span>
                    <span>20%</span>
                    <span>30%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Net Sale Proceeds by Year */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Net Sale Proceeds by Year</h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="px-1 sm:px-4 py-2 text-left text-slate-800 font-medium text-xs sm:text-sm">Year</th>
                    <th className="px-1 sm:px-4 py-2 text-right text-slate-800 font-medium text-xs sm:text-sm">
                      <span className="block sm:hidden">Sale</span>
                      <span className="hidden sm:block">Sale Price</span>
                    </th>
                    <th className="px-1 sm:px-4 py-2 text-right text-slate-800 font-medium text-xs sm:text-sm">
                      <span className="block sm:hidden">Loan</span>
                      <span className="hidden sm:block">Loan Payoff</span>
                    </th>
                    <th className="px-1 sm:px-4 py-2 text-right text-slate-800 font-medium text-xs sm:text-sm">
                      <span className="block sm:hidden">Costs</span>
                      <span className="hidden sm:block">Selling Costs</span>
                    </th>
                    <th className="px-1 sm:px-4 py-2 text-right text-slate-800 font-medium text-xs sm:text-sm">
                      <span className="block sm:hidden">Net</span>
                      <span className="hidden sm:block">Net Proceeds</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {calculateNetProceedsByYear().map((proceedsData) => (
                    <tr key={proceedsData.year} className="border-b border-slate-200">
                      <td className="px-1 sm:px-4 py-2 text-xs font-medium text-slate-800">
                        <span className="block sm:hidden">Y{proceedsData.year}</span>
                        <span className="hidden sm:block">Year {proceedsData.year}</span>
                      </td>
                      <td className="px-1 sm:px-4 py-2 text-xs text-right text-green-600">
                        <span className="block sm:hidden">
                          ${Math.round(proceedsData.salePrice / 1000).toLocaleString()}k
                        </span>
                        <span className="hidden sm:block">
                          ${proceedsData.salePrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </td>
                      <td className="px-1 sm:px-4 py-2 text-xs text-right text-red-600">
                        <span className="block sm:hidden">
                          ${Math.round(proceedsData.remainingLoan / 1000).toLocaleString()}k
                        </span>
                        <span className="hidden sm:block">
                          ${proceedsData.remainingLoan.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </td>
                      <td className="px-1 sm:px-4 py-2 text-xs text-right text-orange-600">
                        <span className="block sm:hidden">
                          ${Math.round(proceedsData.sellingCosts / 1000).toLocaleString()}k
                        </span>
                        <span className="hidden sm:block">
                          ${proceedsData.sellingCosts.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </td>
                      <td className="px-1 sm:px-4 py-2 text-xs text-right font-medium text-blue-600">
                        <span className="block sm:hidden">
                          ${Math.round(proceedsData.netProceeds / 1000).toLocaleString()}k
                        </span>
                        <span className="hidden sm:block">
                          ${proceedsData.netProceeds.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600">
              <strong>Assumptions:</strong> Property appreciates at {formData.appreciationRate || 2}% annually. 
              Selling costs estimated at 7% of sale price (includes agent fees, closing costs, etc.). 
              Loan amortization based on {formData.finance?.interestRate || 0}% interest rate over {formData.finance?.loanTerm || 30} years.
            </p>
          </div>
        </div>
      )}
    </>
  );
}