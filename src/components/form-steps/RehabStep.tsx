import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { PropertyData } from '../../types/property';
import { Trash2 } from 'lucide-react';

export default function RehabStep() {
  const [activeRehabTab, setActiveRehabTab] = useState<'hardCosts' | 'softCosts'>('hardCosts');
  const { register, watch, formState: { errors } } = useFormContext<PropertyData>();

  const { fields: hardCostFields, append: appendHardCost, remove: removeHardCost } = useFieldArray({
    name: "rehab.hardCosts",
  });

  const { fields: softCostFields, append: appendSoftCost, remove: removeSoftCost } = useFieldArray({
    name: "rehab.softCosts",
  });
  
  const { fields: lostRevenueFields, append: appendLostRevenue, remove: removeLostRevenue } = useFieldArray({
    name: "rehab.lostRevenueAndCosts",
  });

  const rehabData = watch('rehab');

  const calculateTotalHardCosts = () => {
    return rehabData?.hardCosts?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;
  };

  const calculateTotalSoftCosts = () => {
    return rehabData?.softCosts?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;
  };

  const calculateTotalRehabCosts = () => {
    return calculateTotalHardCosts() + calculateTotalSoftCosts();
  };

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Step 5: Development/Rehab</h2>
        <p className="text-slate-500">Add any development or rehab costs here.</p>
      </div>
      
      <div className="flex border-b">
        <button
          type="button"
          onClick={() => setActiveRehabTab('hardCosts')}
          className={`px-4 py-2 -mb-px border-b-2 ${activeRehabTab === 'hardCosts' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500'}`}
        >
          Hard Costs
        </button>
        <button
          type="button"
          onClick={() => setActiveRehabTab('softCosts')}
          className={`px-4 py-2 -mb-px border-b-2 ${activeRehabTab === 'softCosts' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500'}`}
        >
          Soft Costs
        </button>
      </div>

      {activeRehabTab === 'hardCosts' && (
        <div className="space-y-4 pt-4">
          {hardCostFields.map((field, index) => (
            <div key={field.id}>
              {index > 0 && <hr className="my-4 border-slate-200" />}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="w-full">
                  <input
                    {...register(`rehab.hardCosts.${index}.category`, {
                      required: 'Hard cost category is required'
                    })}
                    placeholder="Category"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors.rehab?.hardCosts?.[index]?.category ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.rehab?.hardCosts?.[index]?.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.rehab?.hardCosts?.[index]?.category?.message}</p>
                  )}
                </div>
                <div className="w-full">
                  <input
                    type="number"
                    {...register(`rehab.hardCosts.${index}.amount`, {
                      valueAsNumber: true,
                      required: 'Hard cost amount is required',
                      min: { value: 0.01, message: 'Amount must be greater than 0' }
                    })}
                    placeholder="Amount"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors.rehab?.hardCosts?.[index]?.amount ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.rehab?.hardCosts?.[index]?.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.rehab?.hardCosts?.[index]?.amount?.message}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeHardCost(index)}
                  className="p-2 rounded-md hover:bg-red-100 self-start sm:self-center"
                  aria-label="Remove Hard Cost"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendHardCost({ category: '', amount: 0 })}
            className="text-rose-600 hover:text-rose-800 font-semibold"
          >
            + Add Hard Cost
          </button>
        </div>
      )}

      {activeRehabTab === 'softCosts' && (
        <div className="space-y-4 pt-4">
          {softCostFields.map((field, index) => (
            <div key={field.id}>
              {index > 0 && <hr className="my-4 border-slate-200" />}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="w-full">
                  <input
                    {...register(`rehab.softCosts.${index}.category`, {
                      required: 'Soft cost category is required'
                    })}
                    placeholder="Category"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors.rehab?.softCosts?.[index]?.category ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.rehab?.softCosts?.[index]?.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.rehab?.softCosts?.[index]?.category?.message}</p>
                  )}
                </div>
                <div className="w-full">
                  <input
                    type="number"
                    {...register(`rehab.softCosts.${index}.amount`, {
                      valueAsNumber: true,
                      required: 'Soft cost amount is required',
                      min: { value: 0.01, message: 'Amount must be greater than 0' }
                    })}
                    placeholder="Amount"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors.rehab?.softCosts?.[index]?.amount ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.rehab?.softCosts?.[index]?.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.rehab?.softCosts?.[index]?.amount?.message}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeSoftCost(index)}
                  className="p-2 rounded-md hover:bg-red-100 self-start sm:self-center"
                  aria-label="Remove Soft Cost"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendSoftCost({ category: '', amount: 0 })}
            className="text-rose-600 hover:text-rose-800 font-semibold"
          >
            + Add Soft Cost
          </button>
        </div>
      )}

      <div className="mt-6 pt-4 border-t-2 space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-slate-700">Total Hard Costs:</p>
          <p className="text-lg font-semibold text-slate-800">${calculateTotalHardCosts().toLocaleString()}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-slate-700">Total Soft Costs:</p>
          <p className="text-lg font-semibold text-slate-800">${calculateTotalSoftCosts().toLocaleString()}</p>
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
          <p className="text-base font-bold text-slate-800">Total Development/Rehab Costs:</p>
          <p className="text-xl font-bold text-slate-900">${calculateTotalRehabCosts().toLocaleString()}</p>
        </div>
      </div>

      <hr className="my-6" />

      {lostRevenueFields.length === 0 ? (
        <div className="text-center py-4">
          <button
            type="button"
            onClick={() => appendLostRevenue({ category: '', amount: 0 })}
            className="text-rose-600 hover:text-rose-800 font-semibold"
          >
            + Add Lost Revenue/Cost Incurred During Rehab
          </button>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-medium text-slate-800">Lost Revenue/Costs Incurred During Rehab</h3>
          {lostRevenueFields.map((field, index) => (
            <div key={field.id}>
              {index > 0 && <hr className="my-4 border-slate-200" />}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="w-full">
                  <input
                    {...register(`rehab.lostRevenueAndCosts.${index}.category`, {
                      required: 'Lost revenue/cost category is required'
                    })}
                    placeholder="e.g., Lost Revenue, Utilities"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors.rehab?.lostRevenueAndCosts?.[index]?.category ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.rehab?.lostRevenueAndCosts?.[index]?.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.rehab?.lostRevenueAndCosts?.[index]?.category?.message}</p>
                  )}
                </div>
                <div className="w-full">
                  <input
                    type="number"
                    {...register(`rehab.lostRevenueAndCosts.${index}.amount`, {
                      valueAsNumber: true,
                      required: 'Lost revenue/cost amount is required',
                      min: { value: 0.01, message: 'Amount must be greater than 0' }
                    })}
                    placeholder="Amount"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                      errors.rehab?.lostRevenueAndCosts?.[index]?.amount ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.rehab?.lostRevenueAndCosts?.[index]?.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.rehab?.lostRevenueAndCosts?.[index]?.amount?.message}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeLostRevenue(index)}
                  className="p-2 rounded-md hover:bg-red-100 self-start sm:self-center"
                  aria-label="Remove Cost"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendLostRevenue({ category: '', amount: 0 })}
            className="text-rose-600 hover:text-rose-800 font-semibold"
          >
            + Add Cost/Lost Revenue
          </button>
        </>
      )}
    </>
  );
}