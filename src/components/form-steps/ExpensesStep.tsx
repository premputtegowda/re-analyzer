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
    const totalOtherIncome = otherIncome.reduce((acc, item) => acc + (item.amount || 0), 0);
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
              min: { value: 0, message: 'Property tax cannot be negative' }
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
              min: { value: 0, message: 'Property insurance cannot be negative' }
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

      <h3 className="text-lg font-medium text-slate-800">Custom Monthly Recurring Expenses</h3>
      {customExpenseFields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-4 mb-4">
          <input
            {...register(`expenses.customExpenses.${index}.category`)}
            placeholder="Category"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
          />
          <input
            type="number"
            {...register(`expenses.customExpenses.${index}.amount`, { valueAsNumber: true })}
            placeholder="Amount"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
          />
          <button
            type="button"
            onClick={() => removeCustomExpense(index)}
            className="p-2 rounded-md hover:bg-red-100"
            aria-label="Remove Custom Expense"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
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
        <div key={field.id} className="flex items-center gap-4 mb-4">
          <input
            {...register(`expenses.oneTimeExpenses.${index}.category`)}
            placeholder="e.g., Inspection, Attorney Fees"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
          />
          <input
            type="number"
            {...register(`expenses.oneTimeExpenses.${index}.amount`, { valueAsNumber: true })}
            placeholder="Amount"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
          />
          <button
            type="button"
            onClick={() => removeOneTimeExpense(index)}
            className="p-2 rounded-md hover:bg-red-100"
            aria-label="Remove One-Time Expense"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
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