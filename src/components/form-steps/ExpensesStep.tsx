import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { PropertyData } from '../../types/property';
import { Trash2 } from 'lucide-react';

export default function ExpensesStep() {
  const { register, watch, formState: { errors } } = useFormContext<PropertyData>();

  const { fields: customExpenseFields, append: appendCustomExpense, remove: removeCustomExpense } = useFieldArray({
    name: "expenses.customExpenses",
  });

  const { fields: oneTimeExpenseFields, append: appendOneTimeExpense, remove: removeOneTimeExpense } = useFieldArray({
    name: "expenses.oneTimeExpenses",
  });

  const units = watch('units');
  const otherIncome = watch('otherIncome');
  const expenses = watch('expenses');

  const calculateTotalMonthlyIncome = () => {
    const totalUnitRent = units.reduce((acc, unit) => {
      const rent = unit.monthlyRent || 0;
      const numberOfUnits = unit.numberOfUnits || 1;
      return acc + (rent * numberOfUnits);
    }, 0);
    const totalOtherIncome = otherIncome?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;
    return totalUnitRent + totalOtherIncome;
  };

  const calculatePercentageAmount = (percentage: number) => {
    if (!percentage) return 0;
    const totalIncome = calculateTotalMonthlyIncome();
    return (totalIncome * percentage) / 100;
  };

  const calculateTotalMonthlyRecurringExpenses = () => {
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
      calculatePercentageAmount(expenses.repairsMaintenancePercentage) +
      calculatePercentageAmount(expenses.propertyManagementPercentage);
      
    const customRecurringExpenses = expenses.customExpenses.reduce((acc, item) => acc + (item.amount || 0), 0);

    return monthlyTaxes + monthlyInsurance + fixedMonthlyExpenses + percentageBasedExpenses + customRecurringExpenses;
  };

  const calculateTotalOneTimeExpenses = () => {
    if (!expenses || !expenses.oneTimeExpenses) return 0;
    return expenses.oneTimeExpenses.reduce((acc, item) => acc + (item.amount || 0), 0);
  };


  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Step 4: Expenses</h2>
        <p className="text-slate-500">Add any recurring monthly expenses.</p>
      </div>
      
      {/* Expense Growth Rate and Vacancy Rate Fields */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="expensesExpenseGrowthRate" className="block text-sm font-medium text-slate-700 mb-1">
            Expense Growth Rate (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="expensesExpenseGrowthRate"
            step="0.1"
            {...register('expensesExpenseGrowthRate', { 
              required: 'Expense growth rate is required',
              valueAsNumber: true,
              min: { value: -10, message: 'Expense growth rate must be at least -10%' },
              max: { value: 20, message: 'Expense growth rate cannot exceed 20%' }
            })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm ${
              errors.expensesExpenseGrowthRate ? 'border-red-500 focus:border-red-500' : 'border-slate-300'
            }`}
            placeholder="3.0"
          />
          {errors.expensesExpenseGrowthRate && (
            <p className="mt-1 text-sm text-red-600">{errors.expensesExpenseGrowthRate.message}</p>
          )}
          <p className="text-sm text-slate-500 mt-1">
            Expected annual percentage increase in expenses
          </p>
        </div>
        
        <div>
          <label htmlFor="expensesVacancyRate" className="block text-sm font-medium text-slate-700 mb-1">
            Vacancy Rate (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="expensesVacancyRate"
            step="0.1"
            {...register('expensesVacancyRate', { 
              required: 'Vacancy rate is required',
              valueAsNumber: true,
              min: { value: 0, message: 'Vacancy rate must be at least 0%' },
              max: { value: 100, message: 'Vacancy rate cannot exceed 100%' }
            })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm ${
              errors.expensesVacancyRate ? 'border-red-500 focus:border-red-500' : 'border-slate-300'
            }`}
            placeholder="5.0"
          />
          {errors.expensesVacancyRate && (
            <p className="mt-1 text-sm text-red-600">{errors.expensesVacancyRate.message}</p>
          )}
          <p className="text-sm text-slate-500 mt-1">
            Expected percentage of time units remain vacant
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="expenses.annualPropertyTaxes" className="block text-sm font-medium text-slate-700 mb-1">
            Annual Property Tax <span className="text-red-500">*</span>
          </label>
          <input 
            type="number" 
            id="expenses.annualPropertyTaxes" 
            {...register('expenses.annualPropertyTaxes', { 
              required: 'Annual Property Tax is required',
              valueAsNumber: true,
              min: { value: 0.01, message: 'Property tax must be greater than 0' }
            })} 
            className={`w-full px-3 py-2 border rounded-md shadow-sm ${
              errors.expenses?.annualPropertyTaxes ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {errors.expenses?.annualPropertyTaxes && (
            <p className="mt-1 text-sm text-red-600">{errors.expenses.annualPropertyTaxes.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="expenses.annualPropertyInsurance" className="block text-sm font-medium text-slate-700 mb-1">
            Annual Property Insurance <span className="text-red-500">*</span>
          </label>
          <input 
            type="number" 
            id="expenses.annualPropertyInsurance" 
            {...register('expenses.annualPropertyInsurance', { 
              required: 'Annual Property Insurance is required',
              valueAsNumber: true,
              min: { value: 0.01, message: 'Property insurance must be greater than 0' }
            })} 
            className={`w-full px-3 py-2 border rounded-md shadow-sm ${
              errors.expenses?.annualPropertyInsurance ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {errors.expenses?.annualPropertyInsurance && (
            <p className="mt-1 text-sm text-red-600">{errors.expenses.annualPropertyInsurance.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="expenses.hoa" className="block text-sm font-medium text-slate-700 mb-1">HOA</label>
          <input type="number" id="expenses.hoa" {...register('expenses.hoa', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="expenses.water" className="block text-sm font-medium text-slate-700 mb-1">Water</label>
          <input type="number" id="expenses.water" {...register('expenses.water', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="expenses.gas" className="block text-sm font-medium text-slate-700 mb-1">Gas</label>
          <input type="number" id="expenses.gas" {...register('expenses.gas', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="expenses.electricity" className="block text-sm font-medium text-slate-700 mb-1">Electricity</label>
          <input type="number" id="expenses.electricity" {...register('expenses.electricity', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="expenses.landscapingSnowRemoval" className="block text-sm font-medium text-slate-700 mb-1">Landscaping/Snow Removal</label>
          <input type="number" id="expenses.landscapingSnowRemoval" {...register('expenses.landscapingSnowRemoval', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="expenses.internet" className="block text-sm font-medium text-slate-700 mb-1">Internet</label>
          <input type="number" id="expenses.internet" {...register('expenses.internet', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="expenses.security" className="block text-sm font-medium text-slate-700 mb-1">Security</label>
          <input type="number" id="expenses.security" {...register('expenses.security', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="expenses.administrativeManagement" className="block text-sm font-medium text-slate-700 mb-1">Administrative/Management</label>
          <input type="number" id="expenses.administrativeManagement" {...register('expenses.administrativeManagement', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="expenses.repairsMaintenancePercentage" className="block text-sm font-medium text-slate-700 mb-1">Repairs and Maintenance (%)</label>
          <input type="number" id="expenses.repairsMaintenancePercentage" {...register('expenses.repairsMaintenancePercentage', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
          <p className="text-sm text-slate-500 mt-1">
            Calculated Amount: ${calculatePercentageAmount(expenses.repairsMaintenancePercentage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <label htmlFor="expenses.propertyManagementPercentage" className="block text-sm font-medium text-slate-700 mb-1">Property Management (%)</label>
          <input type="number" id="expenses.propertyManagementPercentage" {...register('expenses.propertyManagementPercentage', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
           <p className="text-sm text-slate-500 mt-1">
            Calculated Amount: ${calculatePercentageAmount(expenses.propertyManagementPercentage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <label htmlFor="expenses.leasingFee" className="block text-sm font-medium text-slate-700 mb-1">Leasing Fee</label>
          <input type="number" id="expenses.leasingFee" {...register('expenses.leasingFee', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="expenses.replacementReserves" className="block text-sm font-medium text-slate-700 mb-1">Replacement Reserves (%)</label>
          <input 
            type="number" 
            id="expenses.replacementReserves" 
            {...register('expenses.replacementReserves', { valueAsNumber: true })} 
            step="0.1"
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" 
          />
        </div>
      </div>

      <hr className="my-6" />

            <h3 className="text-lg font-medium text-slate-800">Custom Monthly Expenses</h3>
      {customExpenseFields.map((field, index) => (
        <div key={field.id}>
          {index > 0 && <hr className="my-4 border-slate-200" />}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div className="w-full">
              <input
                {...register(`expenses.customExpenses.${index}.category`, {
                  required: 'Custom expense category is required'
                })}
                placeholder="e.g., Property Manager, lawn care"
                className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                  errors.expenses?.customExpenses?.[index]?.category ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.expenses?.customExpenses?.[index]?.category && (
                <p className="mt-1 text-sm text-red-600">{errors.expenses?.customExpenses?.[index]?.category?.message}</p>
              )}
            </div>
            <div className="w-full">
              <input
                type="number"
                {...register(`expenses.customExpenses.${index}.amount`, {
                  valueAsNumber: true,
                  required: 'Custom expense amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                })}
                placeholder="Amount"
                className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                  errors.expenses?.customExpenses?.[index]?.amount ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.expenses?.customExpenses?.[index]?.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.expenses?.customExpenses?.[index]?.amount?.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeCustomExpense(index)}
              className="p-2 rounded-md hover:bg-red-100 self-start sm:self-center"
              aria-label="Remove Custom Monthly Expense"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => appendCustomExpense({ category: '', amount: 0 })}
        className="text-rose-600 hover:text-rose-800 font-semibold"
      >
        + Add Custom Expense
      </button>

      <div className="mt-6 pt-4 border-t-2 text-right">
        <p className="text-sm font-medium text-slate-700">Total Monthly Recurring Expenses:</p>
        <p className="text-2xl font-bold text-slate-800">${calculateTotalMonthlyRecurringExpenses().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>

      <hr className="my-6" />

      <h3 className="text-lg font-medium text-slate-800">One-Time Expenses</h3>
      {oneTimeExpenseFields.map((field, index) => (
        <div key={field.id}>
          {index > 0 && <hr className="my-4 border-slate-200" />}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div className="w-full">
              <input
                {...register(`expenses.oneTimeExpenses.${index}.category`, {
                  required: 'One-time expense category is required'
                })}
                placeholder="e.g., Inspection, Attorney Fees"
                className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                  errors.expenses?.oneTimeExpenses?.[index]?.category ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.expenses?.oneTimeExpenses?.[index]?.category && (
                <p className="mt-1 text-sm text-red-600">{errors.expenses?.oneTimeExpenses?.[index]?.category?.message}</p>
              )}
            </div>
            <div className="w-full">
              <input
                type="number"
                {...register(`expenses.oneTimeExpenses.${index}.amount`, {
                  valueAsNumber: true,
                  required: 'One-time expense amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                })}
                placeholder="Amount"
                className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                  errors.expenses?.oneTimeExpenses?.[index]?.amount ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.expenses?.oneTimeExpenses?.[index]?.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.expenses?.oneTimeExpenses?.[index]?.amount?.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeOneTimeExpense(index)}
              className="p-2 rounded-md hover:bg-red-100 self-start sm:self-center"
              aria-label="Remove One-Time Expense"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => appendOneTimeExpense({ category: '', amount: 0 })}
        className="text-rose-600 hover:text-rose-800 font-semibold"
      >
        + Add One-Time Expense
      </button>
      <div className="mt-6 pt-4 border-t-2 text-right">
        <p className="text-sm font-medium text-slate-700">Total One-Time Expenses:</p>
        <p className="text-2xl font-bold text-slate-800">${calculateTotalOneTimeExpenses().toLocaleString()}</p>
      </div>
    </>
  );
}