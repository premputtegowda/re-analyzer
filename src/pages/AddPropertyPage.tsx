import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, useFieldArray, Controller, FormProvider } from 'react-hook-form';
import { PropertyData, Unit } from '../types/property';
import PropertyTypeSelector from '../components/PropertyTypeSelector';
import Button from '../components/Button';
import { Trash2, Home, Banknote, Wrench, Edit, Landmark, Receipt } from 'lucide-react';

const initialUnitState: Unit = { beds: 1, baths: 1, sqft: 0, numberOfUnits: 1, monthlyRent: 0 };

export default function AddPropertyPage() {
  const [step, setStep] = useState(1);
  const [editingUnitIndex, setEditingUnitIndex] = useState<number | null>(null);
  const methods = useForm<PropertyData>({
    defaultValues: {
      address: '',
      purchasePrice: 0,
      propertyType: 'Single Family Home',
      units: [{ beds: 1, baths: 1, sqft: 0, monthlyRent: 0 }],
    },
  });

  const { register, control, handleSubmit, watch, setValue } = methods;

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "units",
  });

  const propertyType = watch('propertyType');
  const units = watch('units'); // Get the current unit values

  const handlePropertyTypeChange = (type: PropertyData['propertyType']) => {
    setValue('propertyType', type);
    if (type === 'MultiFamily') {
      replace([{ ...initialUnitState }]);
    } else {
      replace([{ beds: 1, baths: 1, sqft: 0, monthlyRent: 0 }]);
    }
  };

  const onSubmit = (data: PropertyData) => {
    alert(JSON.stringify(data, null, 2));
  };

  const steps = [
    { id: 1, name: 'Property', Icon: Home },
    { id: 2, name: 'Financing', Icon: Landmark },
    { id: 3, name: 'Income', Icon: Banknote },
    { id: 4, name: 'Expenses', Icon: Receipt },
    { id: 5, name: 'Development/Rehab', Icon: Wrench },
  ];

  const StepperNavigation = ({ isMobile = false }) => (
    <div
      className={
        isMobile
          ? "sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-10"
          : "hidden sm:flex sm:justify-center sm:border-b sm:border-slate-200 sm:mb-6"
      }
    >
      <div className={isMobile ? "flex justify-around w-full max-w-xl mx-auto px-4" : "flex"}>
        {steps.map(({ id, name, Icon }) => {
          const isActive = step === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setStep(id)}
              className={`flex items-center gap-2 p-4 border-b-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-rose-500' : 'text-slate-400'}`} />
              <span className="hidden sm:inline whitespace-nowrap">{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 pb-24 sm:pb-8">
      <div className="mb-4">
        <Link to="/dashboard" className="text-slate-600 hover:text-rose-500 font-semibold">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <StepperNavigation />

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-slate-800">Property Information</h2>
                  <p className="text-slate-500">Start by entering the basic details of the property.</p>
                </div>
                
                {/* --- Property Information Fields --- */}
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
                    
                    {propertyType === 'MultiFamily' && fields.length > 1 && 
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 rounded-md hover:bg-red-100"
                        aria-label="Remove Unit"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    }
                  </div>
                ))}

                {propertyType === 'MultiFamily' && (
                  <button type="button" onClick={() => append({ ...initialUnitState })} className="text-rose-600 hover:text-rose-800 font-semibold">
                    + Add Another Unit Type
                  </button>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-slate-800">Step 2: Financing</h2>
                  <p className="text-slate-500">Enter the financing details for the property.</p>
                </div>
                {/* This section is empty for now */}
              </>
            )}

            {step === 3 && (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-slate-800">Step 3: Income</h2>
                  <p className="text-slate-500">Review and edit your unit details below.</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-800">Unit Summary</h3>
                  {fields.map((item, index) => (
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
              </>
            )}

            {step === 4 && (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-slate-800">Step 4: Expenses</h2>
                  <p className="text-slate-500">Add any recurring or one-time expenses.</p>
                </div>
                {/* This section is empty for now */}
              </>
            )}

            {step === 5 && (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-slate-800">Step 5: Development/Rehab</h2>
                  <p className="text-slate-500">Add any development or rehab costs here.</p>
                </div>
                {/* This section is empty for now */}
              </>
            )}

            <div className="flex justify-between pt-4">
              {step > 1 ? (
                <Button onClick={() => setStep(step - 1)} variant="secondary" className="w-auto">
                  <span>Back</span>
                </Button>
              ) : (
                <div></div> // Empty div to keep "Next" button on the right
              )}

              {step < 5 ? (
                <Button type="button" onClick={() => setStep(step + 1)} className="w-auto">
                  <span>Next</span>
                </Button>
              ) : (
                <button type="submit" className="bg-rose-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-rose-600 transition-colors">
                  Save Property
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>

      <StepperNavigation isMobile />
    </main>
  );
}

