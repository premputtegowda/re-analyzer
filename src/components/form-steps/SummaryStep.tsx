import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { PropertyData } from '../../types/property';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export default function SummaryStep() {
  const { watch, register } = useFormContext<PropertyData>();
  const [viewMode, setViewMode] = useState<'monthly' | 'annual'>('monthly');
  const [isProjectionsCollapsed, setIsProjectionsCollapsed] = useState<boolean>(false);
  const [isCashFlowCollapsed, setIsCashFlowCollapsed] = useState<boolean>(false);
  const [isInvestmentProjectionsCollapsed, setIsInvestmentProjectionsCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'amortization'>('overview');
  
  const formData = watch();

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
      return rehab.lostRevenueAndCosts.reduce((acc, item) => acc + (item.amount || 0), 0);
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
    const holdPeriod = formData.holdPeriod || 5;
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
    const holdPeriod = formData.holdPeriod || 5;
    
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
    const holdPeriod = formData.holdPeriod || 5;
    
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

  const chartData = [
    { name: 'Income', value: totalMonthlyIncome, fill: '#10B981' },
    { name: 'Spending', value: totalMonthlyExpenses, fill: '#EF4444' },
    { name: 'Net cash flow', value: monthlyCashFlow, fill: monthlyCashFlow >= 0 ? '#3B82F6' : '#EF4444' },
  ];

  const maxValue = Math.max(totalMonthlyIncome, totalMonthlyExpenses);

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Step 6: Summary</h2>
        <p className="text-slate-500">Review the complete analysis of your property below.</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'overview' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500'}`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('amortization')}
            className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'amortization' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500'}`}
          >
            Amortization & Proceeds
          </button>
        </div>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Rent Growth and Hold Period Section */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                Rent Growth
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="projectedRentGrowth"
                  {...register('projectedRentGrowth', { valueAsNumber: true })}
                  step="0.5"
                  min="-10"
                  max="20"
                  className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                  placeholder="2"
                />
                <span className="text-sm font-medium text-slate-600">% per year</span>
              </div>
            </div>
            <div>
              <label htmlFor="expenseGrowthRate" className="block text-sm font-medium text-slate-700 mb-2">
                Expense Growth Rate
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="expenseGrowthRate"
                  {...register('expenseGrowthRate', { valueAsNumber: true })}
                  step="0.5"
                  min="-5"
                  max="15"
                  className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                  placeholder="3"
                />
                <span className="text-sm font-medium text-slate-600">% per year</span>
              </div>
            </div>
            <div>
              <label htmlFor="appreciationRate" className="block text-sm font-medium text-slate-700 mb-2">
                Appreciation Rate
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="appreciationRate"
                  {...register('appreciationRate', { valueAsNumber: true })}
                  step="0.5"
                  min="-5"
                  max="15"
                  className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                  placeholder="2"
                />
                <span className="text-sm font-medium text-slate-600">% per year</span>
              </div>
            </div>
            <div>
              <label htmlFor="holdPeriod" className="block text-sm font-medium text-slate-700 mb-2">
                Hold Period
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="holdPeriod"
                  {...register('holdPeriod', { valueAsNumber: true })}
                  step="1"
                  min="1"
                  max="50"
                  className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                  placeholder="5"
                />
                <span className="text-sm font-medium text-slate-600">years</span>
              </div>
            </div>
            <div>
              <label htmlFor="averageLeaseLength" className="block text-sm font-medium text-slate-700 mb-2">
                Average Lease Length
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="averageLeaseLength"
                  {...register('averageLeaseLength', { valueAsNumber: true })}
                  step="1"
                  min="1"
                  max="60"
                  className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                  placeholder="12"
                />
                <span className="text-sm font-medium text-slate-600">months</span>
              </div>
            </div>
          </div>
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
              <strong>Projection Details:</strong> Based on {formData.projectedRentGrowth || 2}% annual rent growth and {formData.expenseGrowthRate || 3}% annual expense growth over {formData.holdPeriod || 5} years. 
              Both income and expenses grow annually with compound growth.
            </p>
          </div>
        </div>
      </div>
      </div>
        </>
      )}

      {/* Amortization & Proceeds Tab */}
      {activeTab === 'amortization' && (
        <div className="space-y-6">
          {/* Loan Balance & Property Value by Year */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Loan Balance & Property Value by Year</h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="px-1 sm:px-4 py-2 text-left text-slate-800 font-medium text-xs sm:text-sm">Year</th>
                    <th className="px-1 sm:px-4 py-2 text-right text-slate-800 font-medium text-xs sm:text-sm">
                      <span className="block sm:hidden">Value</span>
                      <span className="hidden sm:block">Property Value</span>
                    </th>
                    <th className="px-1 sm:px-4 py-2 text-right text-slate-800 font-medium text-xs sm:text-sm">
                      <span className="block sm:hidden">Loan</span>
                      <span className="hidden sm:block">Loan Balance</span>
                    </th>
                    <th className="px-1 sm:px-4 py-2 text-right text-slate-800 font-medium text-xs sm:text-sm">Equity</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const loanBalances = calculateLoanBalanceByYear();
                    const propertyValues = calculatePropertyValueByYear();
                    
                    return loanBalances.map((loanData, index) => {
                      const propertyData = propertyValues[index];
                      const equity = propertyData ? propertyData.propertyValue - loanData.remainingBalance : 0;
                      
                      return (
                        <tr key={loanData.year} className="border-b border-slate-200">
                          <td className="px-1 sm:px-4 py-2 text-xs font-medium text-slate-800">
                            <span className="block sm:hidden">Y{loanData.year}</span>
                            <span className="hidden sm:block">Year {loanData.year}</span>
                          </td>
                          <td className="px-1 sm:px-4 py-2 text-xs text-right text-slate-600">
                            <span className="block sm:hidden">
                              ${propertyData ? Math.round(propertyData.propertyValue / 1000).toLocaleString() : '0'}k
                            </span>
                            <span className="hidden sm:block">
                              ${propertyData ? propertyData.propertyValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}
                            </span>
                          </td>
                          <td className="px-1 sm:px-4 py-2 text-xs text-right text-slate-600">
                            <span className="block sm:hidden">
                              ${Math.round(loanData.remainingBalance / 1000).toLocaleString()}k
                            </span>
                            <span className="hidden sm:block">
                              ${loanData.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                          </td>
                          <td className="px-1 sm:px-4 py-2 text-xs text-right font-medium text-green-600">
                            <span className="block sm:hidden">
                              ${Math.round(equity / 1000).toLocaleString()}k
                            </span>
                            <span className="hidden sm:block">
                              ${equity.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Proceeds by Year */}
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