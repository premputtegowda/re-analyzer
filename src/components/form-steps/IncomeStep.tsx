import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { PropertyData } from '../../types/property';
import Button from '../Button';
import { Edit, Trash2 } from 'lucide-react';

export default function IncomeStep() {
  const [editingUnitIndex, setEditingUnitIndex] = useState<number | null>(null);
  const { register, control, watch, formState: { errors } } = useFormContext<PropertyData>();
  const { fields: unitFields } = useFieldArray({
    control,
    name: "units",
  });

  const { fields: otherIncomeFields, append: appendOtherIncome, remove: removeOtherIncome } = useFieldArray({
    control,
    name: "otherIncome",
  });

  const propertyType = watch('propertyType');
  const units = watch('units');
  const otherIncome = watch('otherIncome');

  const calculateTotalUnitRent = () => {
    return units.reduce((acc, unit) => {
      const rent = unit.monthlyRent || 0;
      const numberOfUnits = unit.numberOfUnits || 1;
      return acc + (rent * numberOfUnits);
    }, 0);
  };

  const calculateTotalOtherIncome = () => {
    return otherIncome?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;
  };

  const calculateTotalMonthlyIncome = () => {
    return calculateTotalUnitRent() + calculateTotalOtherIncome();
  };

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Step 3: Income</h2>
        <p className="text-slate-500">Review and edit your unit details below.</p>
      </div>
      
      {/* Rent Growth and Property Appreciation Fields */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="incomeRentGrowth" className="block text-sm font-medium text-slate-700 mb-1">
            Annual Rent Growth (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="incomeRentGrowth"
            step="0.1"
            {...register('incomeRentGrowth', { 
              required: 'Annual rent growth is required',
              valueAsNumber: true,
              min: { value: -10, message: 'Rent growth must be at least -10%' },
              max: { value: 20, message: 'Rent growth cannot exceed 20%' }
            })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm ${
              errors.incomeRentGrowth ? 'border-red-500 focus:border-red-500' : 'border-slate-300'
            }`}
            placeholder="2.0"
          />
          {errors.incomeRentGrowth && (
            <p className="mt-1 text-sm text-red-600">{errors.incomeRentGrowth.message}</p>
          )}
          <p className="text-sm text-slate-500 mt-1">
            Expected annual percentage increase in rental income
          </p>
        </div>
        
        <div>
          <label htmlFor="incomeAppreciationRate" className="block text-sm font-medium text-slate-700 mb-1">
            Property Appreciation (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="incomeAppreciationRate"
            step="0.1"
            {...register('incomeAppreciationRate', { 
              required: 'Property appreciation rate is required',
              valueAsNumber: true,
              min: { value: -5, message: 'Appreciation rate must be at least -5%' },
              max: { value: 15, message: 'Appreciation rate cannot exceed 15%' }
            })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm ${
              errors.incomeAppreciationRate ? 'border-red-500 focus:border-red-500' : 'border-slate-300'
            }`}
            placeholder="2.0"
          />
          {errors.incomeAppreciationRate && (
            <p className="mt-1 text-sm text-red-600">{errors.incomeAppreciationRate.message}</p>
          )}
          <p className="text-sm text-slate-500 mt-1">
            Expected annual percentage increase in property value
          </p>
        </div>
      </div>
      
      {/* Average Lease Length Field */}
      <div className="mb-6">
        <label htmlFor="averageLeaseLength" className="block text-sm font-medium text-slate-700 mb-1">
          Average Lease Length (Months) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="averageLeaseLength"
          {...register('averageLeaseLength', { 
            required: 'Average lease length is required',
            valueAsNumber: true,
            min: { value: 1, message: 'Lease length must be at least 1 month' },
            max: { value: 60, message: 'Lease length cannot exceed 60 months' }
          })}
          className={`w-full px-3 py-2 border rounded-md shadow-sm ${
            errors.averageLeaseLength ? 'border-red-500 focus:border-red-500' : 'border-slate-300'
          }`}
          placeholder="12"
        />
        {errors.averageLeaseLength && (
          <p className="mt-1 text-sm text-red-600">{errors.averageLeaseLength.message}</p>
        )}
        <p className="text-sm text-slate-500 mt-1">
          Typical duration of tenant leases in months
        </p>
      </div>
      
      <div className="space-y-4">

        <h3 className="text-lg font-medium text-slate-800">Unit Summary</h3>
            {unitFields.map((item, index) => (
          <div key={item.id} className="p-4 border rounded-md bg-slate-50">
            {editingUnitIndex === index ? (
              <div className="space-y-4">
                 <div className="grid gap-4 grid-cols-3">
                    <div>
                      <label htmlFor={`units.${index}.beds`} className="block text-sm font-medium text-slate-600">Beds</label>
                      <input {...register(`units.${index}.beds`, { valueAsNumber: true })} id={`units.${index}.beds`} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                    <div>
                      <label htmlFor={`units.${index}.baths`} className="block text-sm font-medium text-slate-600">Baths</label>
                      <input {...register(`units.${index}.baths`, { valueAsNumber: true })} id={`units.${index}.baths`} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                    <div>
                      <label htmlFor={`units.${index}.sqft`} className="block text-sm font-medium text-slate-600">Sqft</label>
                      <input {...register(`units.${index}.sqft`, { valueAsNumber: true })} id={`units.${index}.sqft`} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                  </div>
                  {propertyType === 'MultiFamily' && (
                    <div>
                      <label htmlFor={`units.${index}.numberOfUnits`} className="block text-sm font-medium text-slate-600"># of Units</label>
                      <input {...register(`units.${index}.numberOfUnits`, { valueAsNumber: true })} id={`units.${index}.numberOfUnits`} className="w-full mt-1 p-2 border rounded-md" />
                    </div>
                  )}
                  <div className="flex justify-end">
                      <Button 
                        type="button" 
                        onClick={() => setEditingUnitIndex(null)} 
                        variant="secondary" 
                        className="w-auto px-4 py-2"
                      >
                        Done
                      </Button>
                  </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="flex items-center gap-4">
                     <button type="button" onClick={() => setEditingUnitIndex(index)} className="p-2 rounded-md hover:bg-slate-200">
                        <Edit className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <p className="font-semibold">
                        Unit {index + 1}: {units[index]?.beds} bed / {units[index]?.baths} bath
                        </p>
                        <p className="text-sm text-slate-500">
                          {units[index]?.sqft} sqft
                          {propertyType === 'MultiFamily' && ` • ${units[index]?.numberOfUnits || 1} units`}
                        </p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0">
                      <label htmlFor={`units.${index}.monthlyRent`} className="block text-sm font-medium text-slate-700 sm:text-right">Monthly Rent/Unit <span className="text-red-500">*</span></label>
                      <div className="relative mt-1">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                              type="number"
                              id={`units.${index}.monthlyRent`}
                              {...register(`units.${index}.monthlyRent`, {
                                valueAsNumber: true,
                                required: 'Monthly rent is required',
                                min: { value: 0.01, message: 'Monthly rent must be greater than 0' }
                              })}
                              className={`w-full pl-7 pr-2 py-2 border rounded-md shadow-sm ${
                                errors.units?.[index]?.monthlyRent ? 'border-red-500' : 'border-slate-300'
                              }`}
                              placeholder="0"
                          />
                      </div>
                      {errors.units?.[index]?.monthlyRent && (
                        <p className="mt-1 text-sm text-red-600">{errors.units?.[index]?.monthlyRent?.message}</p>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        <div className="pt-2 text-right">
            <p className="text-sm font-medium text-slate-700">Total Monthly Rent:</p>
            <p className="text-lg font-semibold text-slate-800">${calculateTotalUnitRent().toLocaleString()}</p>
        </div>
        
        <hr className="my-6" />

        {otherIncomeFields.length === 0 ? (
          <div className="text-center py-4">
            <button
              type="button"
              onClick={() => appendOtherIncome({ category: '', amount: 0 })}
              className="text-rose-600 hover:text-rose-800 font-semibold"
            >
              + Add Other Monthly Income
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-medium text-slate-800">Other Monthly Income</h3>
            {otherIncomeFields.map((field, index) => (
              <div key={field.id}>
                {index > 0 && <hr className="my-4 border-slate-200" />}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <div className="w-full">
                    <input
                      {...register(`otherIncome.${index}.category`, {
                        required: 'Other income category is required'
                      })}
                      placeholder="e.g., Garage, Storage"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                        errors.otherIncome?.[index]?.category ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.otherIncome?.[index]?.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.otherIncome?.[index]?.category?.message}</p>
                    )}
                  </div>
                  <div className="w-full">
                    <input
                      type="number"
                      {...register(`otherIncome.${index}.amount`, {
                        valueAsNumber: true,
                        required: 'Other income amount is required',
                        min: { value: 0.01, message: 'Amount must be greater than 0' }
                      })}
                      placeholder="Amount"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm ${
                        errors.otherIncome?.[index]?.amount ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {errors.otherIncome?.[index]?.amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.otherIncome?.[index]?.amount?.message}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOtherIncome(index)}
                    className="p-2 rounded-md hover:bg-red-100 self-start sm:self-center"
                    aria-label="Remove Other Income"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendOtherIncome({ category: '', amount: 0 })}
              className="text-rose-600 hover:text-rose-800 font-semibold"
            >
              + Add Other Monthly Income
            </button>
            <div className="pt-2 text-right">
                <p className="text-sm font-medium text-slate-700">Total Other Monthly Income:</p>
                <p className="text-lg font-semibold text-slate-800">${calculateTotalOtherIncome().toLocaleString()}</p>
            </div>
          </>
        )}
        
        <div className="mt-6 pt-4 border-t-2 text-right">
          <p className="text-sm font-medium text-slate-700">Total Monthly Income:</p>
          <p className="text-2xl font-bold text-slate-800">${calculateTotalMonthlyIncome().toLocaleString()}</p>
        </div>

      </div>
    </>
  );
}