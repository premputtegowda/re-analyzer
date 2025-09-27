import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { PropertyData } from '../../types/property';
import Button from '../Button';
import { Edit, Trash2 } from 'lucide-react';

export default function IncomeStep() {
  const [editingUnitIndex, setEditingUnitIndex] = useState<number | null>(null);
  const { register, control, watch } = useFormContext<PropertyData>();

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

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Step 3: Income</h2>
        <p className="text-slate-500">Review and edit your unit details below.</p>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-800">Unit Summary</h3>
        {unitFields.map((item, index) => (
          <div key={item.id} className="p-4 border rounded-md bg-slate-50">
            {editingUnitIndex === index ? (
              <div className="space-y-4">
                 <div className={`grid gap-4 ${propertyType === 'MultiFamily' ? 'grid-cols-4' : 'grid-cols-3'}`}>
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
                    {propertyType === 'MultiFamily' && (
                      <div>
                        <label htmlFor={`units.${index}.numberOfUnits`} className="block text-sm font-medium text-slate-600"># of Units</label>
                        <input {...register(`units.${index}.numberOfUnits`, { valueAsNumber: true })} id={`units.${index}.numberOfUnits`} className="w-full mt-1 p-2 border rounded-md" />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                      <Button type="button" onClick={() => setEditingUnitIndex(null)} className="w-auto" variant="secondary">
                          <span>Done</span>
                      </Button>
                  </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
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
                <div>
                    <label htmlFor={`units.${index}.monthlyRent`} className="block text-sm font-medium text-slate-700 text-right">Monthly Rent</label>
                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            id={`units.${index}.monthlyRent`}
                            {...register(`units.${index}.monthlyRent`, { valueAsNumber: true })}
                            className="w-full pl-7 pr-2 py-2 border border-slate-300 rounded-md shadow-sm"
                            placeholder="0"
                        />
                    </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <hr className="my-6" />

      <h3 className="text-lg font-medium text-slate-800">Other Income</h3>
      {otherIncomeFields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-4">
          <input
            {...register(`otherIncome.${index}.category`)}
            placeholder="e.g., Garage, Storage"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
          />
          <input
            type="number"
            {...register(`otherIncome.${index}.amount`, { valueAsNumber: true })}
            placeholder="Amount"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
          />
          <button
            type="button"
            onClick={() => removeOtherIncome(index)}
            className="p-2 rounded-md hover:bg-red-100"
            aria-label="Remove Other Income"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => appendOtherIncome({ category: '', amount: 0 })}
        className="text-rose-600 hover:text-rose-800 font-semibold"
      >
        + Add Other Income
      </button>
    </>
  );
}