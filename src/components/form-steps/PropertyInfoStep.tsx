import React from 'react';
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { PropertyData, Unit } from '../../types/property';
import PropertyTypeSelector from '../PropertyTypeSelector';
import { Trash2 } from 'lucide-react';

const initialUnitState: Unit = { beds: 1, baths: 1, sqft: 0, numberOfUnits: 1, monthlyRent: 0 };

export default function PropertyInfoStep() {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext<PropertyData>();
  
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
      replace([{ beds: 1, baths: 1, sqft: 0, monthlyRent: 0, numberOfUnits: 1 }]);
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
          Street Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="address"
          {...register('address', { 
            required: 'Street address is required' 
          })}
          className={`w-full px-3 py-2 border rounded-md shadow-sm ${
            errors.address ? 'border-red-500 focus:border-red-500' : 'border-slate-300'
          }`}
          placeholder="123 Main St"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="purchasePrice" className="block text-sm font-medium text-slate-700 mb-1">
            Purchase Price <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="purchasePrice"
            {...register('purchasePrice', { 
              required: 'Purchase price is required',
              valueAsNumber: true,
              min: { value: 1, message: 'Purchase price must be greater than 0' }
            })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm ${
              errors.purchasePrice ? 'border-red-500 focus:border-red-500' : 'border-slate-300'
            }`}
            placeholder="300000"
          />
          {errors.purchasePrice && (
            <p className="mt-1 text-sm text-red-600">{errors.purchasePrice.message}</p>
          )}
        </div>
      </div>

      <Controller
        name="propertyType"
        control={control}
        defaultValue="MultiFamily"
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
        <div key={item.id} className="p-3 sm:p-4 border rounded-md">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 sm:gap-4">
            {propertyType === 'MultiFamily' && fields.length > 1 && 
              <div className="flex justify-start order-first">
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
            <div className="flex gap-2 flex-1">
              <div className="flex-1">
                <label htmlFor={`units.${index}.beds`} className="block text-xs font-medium text-slate-600">Beds</label>
                <input {...register(`units.${index}.beds`, { valueAsNumber: true })} id={`units.${index}.beds`} className="w-full mt-1 p-2 border rounded-md text-sm" />
              </div>
              <div className="flex-1">
                <label htmlFor={`units.${index}.baths`} className="block text-xs font-medium text-slate-600">Baths</label>
                <input {...register(`units.${index}.baths`, { valueAsNumber: true })} id={`units.${index}.baths`} className="w-full mt-1 p-2 border rounded-md text-sm" />
              </div>
            </div>
            <div className="flex-1 min-w-[80px]">
              <label htmlFor={`units.${index}.sqft`} className="block text-xs font-medium text-slate-600">Sqft</label>
              <input {...register(`units.${index}.sqft`, { valueAsNumber: true })} id={`units.${index}.sqft`} className="w-full mt-1 p-2 border rounded-md text-sm" />
            </div>
            
            {propertyType === 'MultiFamily' && (
              <div className="flex-1 min-w-[80px]">
                <label htmlFor={`units.${index}.numberOfUnits`} className="block text-xs font-medium text-slate-600"># of Units</label>
                <input {...register(`units.${index}.numberOfUnits`, { valueAsNumber: true })} id={`units.${index}.numberOfUnits`} className="w-full mt-1 p-2 border rounded-md text-sm" />
              </div>
            )}
          </div>
        </div>
      ))}

      {propertyType === 'MultiFamily' && (
        <button type="button" onClick={() => append({ ...initialUnitState })} className="text-rose-600 hover:text-rose-800 font-semibold mt-4">
          + Add Another Unit Type
        </button>
      )}
    </>
  );
}