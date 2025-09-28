import React from 'react';
import { useFormContext } from 'react-hook-form';
import { PropertyData } from '../../types/property';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export default function SummaryStep() {
  const { watch } = useFormContext<PropertyData>();
  
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
    const totalMonthlyIncome = calculateTotalMonthlyIncome();
    const totalMonthlyExpenses = calculateTotalMonthlyRecurringExpenses() + calculateMonthlyPayment();
    const annualCashFlow = (totalMonthlyIncome - totalMonthlyExpenses) * 12;

    if (totalCashInvested > 0) {
      return (annualCashFlow / totalCashInvested) * 100;
    }
    return 0;
  };

  const totalMonthlyIncome = calculateTotalMonthlyIncome();
  const totalMonthlyExpenses = calculateTotalMonthlyRecurringExpenses() + calculateMonthlyPayment();
  const monthlyCashFlow = totalMonthlyIncome - totalMonthlyExpenses;
  const cashOnCashROI = calculateCashOnCashROI();

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

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Key Financials</h3>
        
        <div className="flex flex-col sm:flex-row gap-4 text-center">
          <div className="bg-rose-50 p-4 rounded-lg shadow w-full">
            <p className="text-sm font-medium text-rose-800">Acquisition Cost</p>
            <p className="text-2xl sm:text-3xl font-bold text-rose-600">${calculateAcquisitionCost().toLocaleString()}</p>
          </div>
          <div className={`p-4 rounded-lg shadow w-full ${monthlyCashFlow >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <p className={`text-sm font-medium ${monthlyCashFlow >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>Monthly Cash Flow</p>
            <p className={`text-2xl sm:text-3xl font-bold ${monthlyCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${monthlyCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-sky-50 p-4 rounded-lg shadow w-full">
            <p className="text-sm font-medium text-sky-800">Cash on Cash ROI</p>
            <p className="text-2xl sm:text-3xl font-bold text-sky-600">{cashOnCashROI.toFixed(2)}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-2xl font-bold text-slate-800 mb-4">Track your cash flow</h4>
          <div className="space-y-4">
            {chartData.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-lg font-semibold text-slate-800">{item.name}</p>
                  <p className="text-lg font-semibold text-slate-800">${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full" style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: item.fill }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}