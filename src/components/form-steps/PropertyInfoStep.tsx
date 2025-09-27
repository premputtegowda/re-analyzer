import React from 'react';
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { PropertyData, Unit } from '../../types/property';
import PropertyTypeSelector from '../PropertyTypeSelector';
import { Trash2 } from 'lucide-react';

const initialUnitState: Unit = { beds: 1, baths: 1, sqft: 0, numberOfUnits: 1, monthlyRent: 0 };

export default function PropertyInfoStep() {
  const { register, control, watch, setValue } = useFormContext<PropertyData>();
  
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "units",
  });

  const propertyType = watch('propertyType');

  const handlePropertyTypeChange = (type: PropertyData['propertyType']) => {
    setValue('propertyType', type);
    if (type === 'MultiFamily') {
      replace([{ ...initialUnitState }]);
    } else {
      replace([{ beds: 1, baths: 1, sqft: 0, monthlyRent: 0 }]);
    }
  };

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Property Information</h2>
        <p className="text-slate-500">Start by entering the basic details of the property.</p>
      </div>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
          Street Address
        </label>
        <input
          type="text"
          id="address"
          {...register('address', { required: true })}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
          placeholder="123 Main St"
        />
      </div>

      <div>
        <label htmlFor="purchasePrice" className="block text-sm font-medium text-slate-700 mb-1">
          Purchase Price
        </label>
        <input
          type="number"
          id="purchasePrice"
          {...register('purchasePrice', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
          placeholder="300000"
        />
      </div>

      <Controller
        name="propertyType"
        control={control}
        render={({ field }) => (
          <PropertyTypeSelector 
            value={field.value} 
            onChange={handlePropertyTypeChange} 
          />
        )}
      />

      <hr className="my-6" />

      <h3 className="text-lg font-medium text-slate-800">Unit Details</h3>
      
      {fields.map((item, index) => (
        <div key={item.id} className="p-4 border rounded-md space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[100px]">
              <label htmlFor={`units.${index}.beds`} className="block text-sm font-medium text-slate-600">Beds</label>
              <input {...register(`units.${index}.beds`, { valueAsNumber: true })} id={`units.${index}.beds`} className="w-full mt-1 p-2 border rounded-md" />
            </div>
            <div className="flex-1 min-w-[100px]">
              <label htmlFor={`units.${index}.baths`} className="block text-sm font-medium text-slate-600">Baths</label>
              <input {...register(`units.${index}.baths`, { valueAsNumber: true })} id={`units.${index}.baths`} className="w-full mt-1 p-2 border rounded-md" />
            </div>
            <div className="flex-1 min-w-[100px]">
              <label htmlFor={`units.${index}.sqft`} className="block text-sm font-medium text-slate-600">Sqft</label>
              <input {...register(`units.${index}.sqft`, { valueAsNumber: true })} id={`units.${index}.sqft`} className="w-full mt-1 p-2 border rounded-md" />
            </div>
            
            {propertyType === 'MultiFamily' && (
              <div className="flex-1 min-w-[100px]">
                <label htmlFor={`units.${index}.numberOfUnits`} className="block text-sm font-medium text-slate-600"># of Units</label>
                <input {...register(`units.${index}.numberOfUnits`, { valueAsNumber: true })} id={`units.${index}.numberOfUnits`} className="w-full mt-1 p-2 border rounded-md" />
              </div>
            )}
            
            {propertyType === 'MultiFamily' && fields.length > 1 && 
              <div className="pt-5">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 rounded-md hover:bg-red-100"
                  aria-label="Remove Unit"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            }
          </div>
        </div>
      ))}

      {propertyType === 'MultiFamily' && (
        <button type="button" onClick={() => append({ ...initialUnitState })} className="text-rose-600 hover:text-rose-800 font-semibold">
          + Add Another Unit Type
        </button>
      )}
    </>
  );
}