import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { PropertyData } from '../../types/property';
import { Trash2 } from 'lucide-react';

export default function ExpensesStep() {
  const { register } = useFormContext<PropertyData>();

  const { fields: customExpenseFields, append: appendCustomExpense, remove: removeCustomExpense } = useFieldArray({
    name: "expenses.customExpenses",
  });

  const { fields: oneTimeExpenseFields, append: appendOneTimeExpense, remove: removeOneTimeExpense } = useFieldArray({
    name: "expenses.oneTimeExpenses",
  });

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Step 4: Expenses</h2>
        <p className="text-slate-500">Add any recurring monthly expenses.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="expenses.propertyTaxes" className="block text-sm font-medium text-slate-700 mb-1">Property Taxes</label>
          <input type="number" id="expenses.propertyTaxes" {...register('expenses.propertyTaxes', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="expenses.propertyInsurance" className="block text-sm font-medium text-slate-700 mb-1">Property Insurance</label>
          <input type="number" id="expenses.propertyInsurance" {...register('expenses.propertyInsurance', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
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
          <label htmlFor="expenses.repairsMaintenance" className="block text-sm font-medium text-slate-700 mb-1">Repairs and Maintenance</label>
          <input type="number" id="expenses.repairsMaintenance" {...register('expenses.repairsMaintenance', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="expenses.propertyManagementPercentage" className="block text-sm font-medium text-slate-700 mb-1">Property Management (%)</label>
          <input type="number" id="expenses.propertyManagementPercentage" {...register('expenses.propertyManagementPercentage', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="expenses.leasingFee" className="block text-sm font-medium text-slate-700 mb-1">Leasing Fee</label>
          <input type="number" id="expenses.leasingFee" {...register('expenses.leasingFee', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="expenses.averageLengthOfStay" className="block text-sm font-medium text-slate-700 mb-1">Average Length of Stay (in yrs)</label>
          <input type="number" id="expenses.averageLengthOfStay" {...register('expenses.averageLengthOfStay', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label htmlFor="expenses.replacementReserves" className="block text-sm font-medium text-slate-700 mb-1">Replacement Reserves</label>
          <input type="number" id="expenses.replacementReserves" {...register('expenses.replacementReserves', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
        </div>
      </div>

      <hr className="my-6" />

      <h3 className="text-lg font-medium text-slate-800">Custom Recurring Expense</h3>
      {customExpenseFields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-4">
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

      <hr className="my-6" />

      <h3 className="text-lg font-medium text-slate-800">One-Time Expenses</h3>
      {oneTimeExpenseFields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-4">
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
    </>
  );
}