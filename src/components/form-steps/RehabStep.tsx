import React, { useState, useEffect, useMemo } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { PropertyData } from '../../types/property';
import { Trash2 } from 'lucide-react';

export default function RehabStep() {
  const [activeRehabTab, setActiveRehabTab] = useState<'hardCosts' | 'softCosts'>('hardCosts');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState<string>('');
  const { register, watch, setValue, formState: { errors } } = useFormContext<PropertyData>();

  const { fields: hardCostFields, append: appendHardCost, remove: removeHardCost } = useFieldArray({
    name: "rehab.hardCosts",
  });

  const { fields: softCostFields, append: appendSoftCost, remove: removeSoftCost } = useFieldArray({
    name: "rehab.softCosts",
  });

  const rehabData = watch('rehab');
  const holdPeriod = watch('holdPeriod') || 5;
  const hasRehabRevenueImpact = watch('hasRehabRevenueImpact');

  // Memoize the yearly structure to prevent infinite loops
  const yearlyLostRevenueData = useMemo(() => {
    const currentData = rehabData?.lostRevenueAndCosts || [];
    if (currentData.length === 0) {
      return Array.from({ length: holdPeriod }, (_, i) => ({
        year: i + 1,
        items: []
      }));
    }
    
    // Ensure we have data for all years in hold period
    const updatedData = [...currentData];
    for (let i = 0; i < holdPeriod; i++) {
      if (!updatedData[i]) {
        updatedData[i] = { year: i + 1, items: [] };
      }
    }
    // Remove extra years if hold period decreased
    if (updatedData.length > holdPeriod) {
      updatedData.splice(holdPeriod);
    }
    return updatedData;
  }, [rehabData?.lostRevenueAndCosts, holdPeriod]);

  // Initialize the structure only when needed
  useEffect(() => {
    const currentData = rehabData?.lostRevenueAndCosts || [];
    const needsInitialization = currentData.length === 0 || currentData.length !== holdPeriod;
    
    if (needsInitialization) {
      const yearlyData = Array.from({ length: holdPeriod }, (_, i) => ({
        year: i + 1,
        items: currentData[i]?.items || []
      }));
      setValue('rehab.lostRevenueAndCosts', yearlyData);
    }
  }, [holdPeriod, setValue, rehabData?.lostRevenueAndCosts]); // Include all dependencies

  // Automatically add/remove "Lost Revenue" category based on revenue impact flag
  useEffect(() => {
    const currentData = rehabData?.lostRevenueAndCosts || [];
    
    // Check if "Lost Revenue" category exists
    const hasLostRevenueCategory = currentData.some(yearData => 
      yearData.items.some(item => 
        item.category && item.category.trim().toLowerCase() === 'lost revenue'
      )
    );
    
    if (hasRehabRevenueImpact) {
      // Add "Lost Revenue" category if it doesn't exist
      if (!hasLostRevenueCategory) {
        addCategoryToAllYears('Lost Revenue');
      }
    } else {
      // Remove "Lost Revenue" category if it exists
      if (hasLostRevenueCategory) {
        const updatedData = currentData.map(yearData => ({
          ...yearData,
          items: yearData.items.filter(item => 
            !item.category || item.category.trim().toLowerCase() !== 'lost revenue'
          )
        }));
        setValue('rehab.lostRevenueAndCosts', updatedData);
      }
    }
  }, [hasRehabRevenueImpact, rehabData?.lostRevenueAndCosts, holdPeriod]);

  const addLostRevenueItem = (yearIndex: number, category: string = '') => {
    const currentData = rehabData?.lostRevenueAndCosts || [];
    const updatedData = [...currentData];
    
    // Ensure the year exists
    if (!updatedData[yearIndex]) {
      updatedData[yearIndex] = { year: yearIndex + 1, items: [] };
    }
    
    // Check if item with this category already exists for this year
    const existingItemIndex = updatedData[yearIndex].items.findIndex(item => 
      item.category && item.category.trim() === category.trim()
    );
    
    // Only add if it doesn't already exist
    if (existingItemIndex < 0) {
      updatedData[yearIndex] = {
        ...updatedData[yearIndex],
        items: [...updatedData[yearIndex].items, { category, amount: 0 }]
      };
      setValue('rehab.lostRevenueAndCosts', updatedData);
      
      // Force re-registration of form fields
      setTimeout(() => {
        const newItemIndex = updatedData[yearIndex].items.length - 1;
        setValue(`rehab.lostRevenueAndCosts.${yearIndex}.items.${newItemIndex}.category`, category);
        setValue(`rehab.lostRevenueAndCosts.${yearIndex}.items.${newItemIndex}.amount`, 0);
      }, 0);
    }
  };

  const addCategoryToAllYears = (category: string) => {
    if (!category.trim()) return;
    
    const currentData = rehabData?.lostRevenueAndCosts || [];
    const updatedData = [...currentData];
    
    // Ensure we have data for all years
    for (let yearIndex = 0; yearIndex < holdPeriod; yearIndex++) {
      if (!updatedData[yearIndex]) {
        updatedData[yearIndex] = { year: yearIndex + 1, items: [] };
      }
      
      // Check if item with this category already exists for this year
      const existingItemIndex = updatedData[yearIndex].items.findIndex(item => 
        item.category && item.category.trim() === category.trim()
      );
      
      // Only add if it doesn't already exist
      if (existingItemIndex < 0) {
        updatedData[yearIndex] = {
          ...updatedData[yearIndex],
          items: [...updatedData[yearIndex].items, { category, amount: 0 }]
        };
      }
    }
    
    setValue('rehab.lostRevenueAndCosts', updatedData);
    
    // Force re-registration of form fields for all years
    setTimeout(() => {
      for (let yearIndex = 0; yearIndex < holdPeriod; yearIndex++) {
        const items = updatedData[yearIndex].items;
        const itemIndex = items.findIndex(item => item.category === category);
        if (itemIndex >= 0) {
          setValue(`rehab.lostRevenueAndCosts.${yearIndex}.items.${itemIndex}.category`, category);
          setValue(`rehab.lostRevenueAndCosts.${yearIndex}.items.${itemIndex}.amount`, 0);
        }
      }
    }, 0);
  };

  const removeLostRevenueItem = (yearIndex: number, itemIndex: number) => {
    const currentData = rehabData?.lostRevenueAndCosts || [];
    if (currentData.length > yearIndex) {
      const updatedData = [...currentData];
      updatedData[yearIndex] = {
        ...updatedData[yearIndex],
        items: updatedData[yearIndex].items.filter((_, index) => index !== itemIndex)
      };
      setValue('rehab.lostRevenueAndCosts', updatedData);
    }
  };

  const renameCategoryInAllYears = (oldCategory: string, newCategory: string) => {
    if (!newCategory.trim() || oldCategory === newCategory) return;
    
    const currentData = rehabData?.lostRevenueAndCosts || [];
    const updatedData = [...currentData];
    
    // Update category name in all years where it exists
    for (let yearIndex = 0; yearIndex < updatedData.length; yearIndex++) {
      updatedData[yearIndex] = {
        ...updatedData[yearIndex],
        items: updatedData[yearIndex].items.map(item => 
          item.category && item.category.trim() === oldCategory.trim() 
            ? { ...item, category: newCategory.trim() }
            : item
        )
      };
    }
    
    setValue('rehab.lostRevenueAndCosts', updatedData);
    
    // Force re-registration of form fields with updated category names
    setTimeout(() => {
      for (let yearIndex = 0; yearIndex < updatedData.length; yearIndex++) {
        const items = updatedData[yearIndex].items;
        items.forEach((item, itemIndex) => {
          setValue(`rehab.lostRevenueAndCosts.${yearIndex}.items.${itemIndex}.category`, item.category);
          setValue(`rehab.lostRevenueAndCosts.${yearIndex}.items.${itemIndex}.amount`, item.amount);
        });
      }
    }, 0);
  };

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

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <h3 className="text-lg font-medium text-slate-800">Lost Revenue/Costs Incurred During Rehab</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">Hold Period: {holdPeriod} years</span>
          </div>
        </div>

        {/* Revenue Impact Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Do you anticipate revenue loss due to rehab?
          </label>
          <div className="relative inline-flex">
            <input
              type="hidden"
              {...register('hasRehabRevenueImpact')}
            />
            <button
              type="button"
              onClick={() => setValue('hasRehabRevenueImpact', !hasRehabRevenueImpact)}
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 ${
                hasRehabRevenueImpact ? 'bg-rose-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  hasRehabRevenueImpact ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="ml-3 text-sm font-medium text-slate-700">
              {hasRehabRevenueImpact ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {yearlyLostRevenueData.length === 0 || yearlyLostRevenueData.every(year => year.items.length === 0) ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <p className="text-slate-500 mb-3">No lost revenue or costs added yet</p>
            <p className="text-xs text-slate-400 mb-4">Add categories like "Lost Rent", "Utilities", "Insurance", etc.</p>
            <div className="max-w-sm mx-auto space-y-3">
              <input
                type="text"
                placeholder="Enter category name (e.g., Lost Rent, Utilities)"
                className="w-full px-3 py-2.5 text-sm border rounded-lg shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 border-slate-300 placeholder-slate-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const category = target.value.trim();
                    if (category) {
                      addCategoryToAllYears(category);
                      target.value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.querySelector('.bg-slate-50 input[placeholder*="Enter category name"]') as HTMLInputElement;
                  const category = input?.value.trim();
                  if (category) {
                    addCategoryToAllYears(category);
                    input.value = '';
                    input.focus();
                  } else {
                    input?.focus();
                  }
                }}
                className="text-rose-600 hover:text-rose-800 font-semibold bg-white border-2 border-rose-300 hover:border-rose-500 px-4 py-2 rounded-lg transition-colors"
              >
                + Add Lost Revenue/Cost Item
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View - Card Layout */}
            <div className="block sm:hidden space-y-4">
              {(() => {
                const allCategories = new Set<string>();
                yearlyLostRevenueData.forEach(year => 
                  year.items.forEach(item => {
                    if (item.category && item.category.trim()) allCategories.add(item.category.trim());
                  })
                );
                
                const categoriesArray = Array.from(allCategories);
                
                return categoriesArray.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="bg-white border border-slate-300 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0"></div>
                        {editingCategory === category && category.toLowerCase() !== 'lost revenue' ? (
                          <input
                            type="text"
                            value={editingCategoryValue}
                            onChange={(e) => setEditingCategoryValue(e.target.value)}
                            onBlur={() => {
                              if (editingCategoryValue.trim()) {
                                renameCategoryInAllYears(category, editingCategoryValue.trim());
                              }
                              setEditingCategory(null);
                              setEditingCategoryValue('');
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (editingCategoryValue.trim()) {
                                  renameCategoryInAllYears(category, editingCategoryValue.trim());
                                }
                                setEditingCategory(null);
                                setEditingCategoryValue('');
                              } else if (e.key === 'Escape') {
                                setEditingCategory(null);
                                setEditingCategoryValue('');
                              }
                            }}
                            className="font-medium text-slate-900 bg-white border border-rose-300 rounded px-2 py-1 text-sm flex-1 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                            autoFocus
                          />
                        ) : (
                          <span 
                            className={`font-medium text-slate-900 truncate ${
                              category.toLowerCase() === 'lost revenue' 
                                ? 'cursor-default text-slate-600' 
                                : 'cursor-pointer hover:text-rose-600 transition-colors'
                            }`}
                            onClick={() => {
                              if (category.toLowerCase() !== 'lost revenue') {
                                setEditingCategory(category);
                                setEditingCategoryValue(category);
                              }
                            }}
                            title={category.toLowerCase() === 'lost revenue' ? 'System-generated category' : 'Click to edit category'}
                          >
                            {category}
                          </span>
                        )}
                      </div>
                      {category.toLowerCase() !== 'lost revenue' && (
                        <button
                          type="button"
                          onClick={() => {
                            yearlyLostRevenueData.forEach((_, yearIndex) => {
                              const itemIndex = yearlyLostRevenueData[yearIndex].items.findIndex(item => item.category && item.category.trim() === category);
                              if (itemIndex >= 0) {
                                removeLostRevenueItem(yearIndex, itemIndex);
                              }
                            });
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                          aria-label="Remove Category"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {yearlyLostRevenueData.map((yearData, yearIndex) => {
                        const itemIndex = yearData.items.findIndex(item => item.category && item.category.trim() === category);
                        const actualIndex = itemIndex >= 0 ? itemIndex : yearData.items.length;
                        
                        return (
                          <div key={yearIndex} className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                              Year {yearIndex + 1}
                            </label>
                            {/* Hidden category field for form registration */}
                            <input
                              type="hidden"
                              {...register(`rehab.lostRevenueAndCosts.${yearIndex}.items.${actualIndex}.category`)}
                              value={category}
                            />
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm pointer-events-none">$</span>
                              <input
                                type="number"
                                step="0.01"
                                {...register(`rehab.lostRevenueAndCosts.${yearIndex}.items.${actualIndex}.amount`, {
                                  valueAsNumber: true,
                                  min: { value: 0, message: 'Amount cannot be negative' }
                                })}
                                placeholder="0.00"
                                className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 border-slate-300 text-center hover:border-slate-400 transition-colors"
                                onFocus={(e) => {
                                  if (itemIndex < 0) {
                                    addLostRevenueItem(yearIndex, category);
                                    // Re-register the field after adding the item
                                    setTimeout(() => {
                                      // Register the category field as well
                                      register(`rehab.lostRevenueAndCosts.${yearIndex}.items.${yearData.items.length}.category`);
                                      e.target.focus();
                                    }, 0);
                                  }
                                  e.target.select();
                                }}
                                onChange={(e) => {
                                  // Ensure the item exists when the user types
                                  if (itemIndex < 0) {
                                    addLostRevenueItem(yearIndex, category);
                                  }
                                  // Update the form value immediately
                                  const value = parseFloat(e.target.value) || 0;
                                  setValue(`rehab.lostRevenueAndCosts.${yearIndex}.items.${actualIndex}.amount`, value);
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="pt-3 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">Category Total:</span>
                        <span className="text-lg font-bold text-slate-900">
                          ${(() => {
                            const total = yearlyLostRevenueData.reduce((acc, yearData) => {
                              const item = yearData.items.find(item => item.category && item.category.trim() === category);
                              return acc + (item?.amount || 0);
                            }, 0);
                            return total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                ));
              })()}
              
              {/* Mobile Add Category Card */}
              <div className="bg-rose-25 border-2 border-rose-200 rounded-lg p-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700">Add New Category:</label>
                  <input
                    type="text"
                    placeholder="e.g., Lost Rent, Utilities..."
                    className="w-full px-3 py-2.5 text-sm border rounded-lg shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 border-slate-300 placeholder-slate-400"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        const category = target.value.trim();
                        if (category) {
                          addCategoryToAllYears(category);
                          target.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('.bg-rose-25 input[placeholder*="Lost Rent"]') as HTMLInputElement;
                      const category = input?.value.trim();
                      if (category) {
                        addCategoryToAllYears(category);
                        input.value = '';
                        input.focus();
                      } else {
                        input?.focus();
                      }
                    }}
                    className="w-full text-rose-600 hover:text-white hover:bg-rose-600 text-sm font-medium py-2.5 rounded-lg border border-rose-300 hover:border-rose-600 transition-colors"
                  >
                    + Add Category
                  </button>
                </div>
              </div>
              
              {/* Mobile Totals Summary */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-300 rounded-lg p-4">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full"></div>
                  Yearly Totals Summary
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {yearlyLostRevenueData.map((yearData, yearIndex) => (
                    <div key={yearIndex} className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                        Year {yearIndex + 1}
                      </div>
                      <div className="text-lg font-bold text-slate-800">
                        ${yearData.items.reduce((acc, item) => acc + (item.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-slate-300">
                  <div className="bg-white rounded-lg p-3 shadow-md border-2 border-rose-200">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                      Grand Total (All Years)
                    </div>
                    <div className="text-xl font-bold text-slate-900">
                      ${yearlyLostRevenueData.reduce((yearAcc, yearData) => 
                        yearAcc + yearData.items.reduce((itemAcc, item) => itemAcc + (item.amount || 0), 0), 0
                      ).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop View - Table Layout */}
            <div className="hidden sm:block bg-white border border-slate-300 rounded-lg shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="sticky left-0 bg-slate-50 px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-r border-slate-200 min-w-[180px] z-20 shadow-lg shadow-slate-200/50">
                        Category
                      </th>
                      {yearlyLostRevenueData.map((_, yearIndex) => (
                        <th key={yearIndex} className="px-3 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[130px] border-r border-slate-200">
                          <div className="flex flex-col">
                            <span>Year {yearIndex + 1}</span>
                            <span className="text-[10px] text-slate-400 font-normal">Amount ($)</span>
                          </div>
                        </th>
                      ))}
                      <th className="px-3 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[110px] border-r border-slate-200 bg-slate-100">
                        <div className="flex flex-col">
                          <span>Total</span>
                          <span className="text-[10px] text-slate-400 font-normal">All Years</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-12">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {/* Get all unique categories across all years */}
                    {(() => {
                      const allCategories = new Set<string>();
                      yearlyLostRevenueData.forEach(year => 
                        year.items.forEach(item => {
                          if (item.category && item.category.trim()) allCategories.add(item.category.trim());
                        })
                      );
                      
                      const categoriesArray = Array.from(allCategories);
                      
                      return categoriesArray.map((category, categoryIndex) => (
                        <tr key={categoryIndex} className="hover:bg-slate-50 group">
                          <td className="sticky left-0 bg-white group-hover:bg-slate-50 px-4 py-3 font-medium text-slate-900 border-r border-slate-200 z-10 shadow-lg shadow-slate-200/30">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0"></div>
                              {editingCategory === category && category.toLowerCase() !== 'lost revenue' ? (
                                <input
                                  type="text"
                                  value={editingCategoryValue}
                                  onChange={(e) => setEditingCategoryValue(e.target.value)}
                                  onBlur={() => {
                                    if (editingCategoryValue.trim()) {
                                      renameCategoryInAllYears(category, editingCategoryValue.trim());
                                    }
                                    setEditingCategory(null);
                                    setEditingCategoryValue('');
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      if (editingCategoryValue.trim()) {
                                        renameCategoryInAllYears(category, editingCategoryValue.trim());
                                      }
                                      setEditingCategory(null);
                                      setEditingCategoryValue('');
                                    } else if (e.key === 'Escape') {
                                      setEditingCategory(null);
                                      setEditingCategoryValue('');
                                    }
                                  }}
                                  className="font-medium text-slate-900 bg-white border border-rose-300 rounded px-2 py-1 text-sm min-w-0 flex-1 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                                  autoFocus
                                />
                              ) : (
                                <span 
                                  className={`font-medium text-slate-900 truncate ${
                                    category.toLowerCase() === 'lost revenue' 
                                      ? 'cursor-default text-slate-600' 
                                      : 'cursor-pointer hover:text-rose-600 transition-colors'
                                  }`}
                                  onClick={() => {
                                    if (category.toLowerCase() !== 'lost revenue') {
                                      setEditingCategory(category);
                                      setEditingCategoryValue(category);
                                    }
                                  }}
                                  title={category.toLowerCase() === 'lost revenue' ? 'System-generated category' : 'Click to edit category'}
                                >
                                  {category}
                                </span>
                              )}
                            </div>
                          </td>
                          {yearlyLostRevenueData.map((yearData, yearIndex) => {
                            const itemIndex = yearData.items.findIndex(item => item.category && item.category.trim() === category);
                            const actualIndex = itemIndex >= 0 ? itemIndex : yearData.items.length;
                            
                            return (
                              <td key={yearIndex} className="px-3 py-3 text-center border-r border-slate-200">
                                {/* Hidden category field for form registration */}
                                <input
                                  type="hidden"
                                  {...register(`rehab.lostRevenueAndCosts.${yearIndex}.items.${actualIndex}.category`)}
                                  value={category}
                                />
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs pointer-events-none">$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    {...register(`rehab.lostRevenueAndCosts.${yearIndex}.items.${actualIndex}.amount`, {
                                      valueAsNumber: true,
                                      min: { value: 0, message: 'Amount cannot be negative' }
                                    })}
                                    placeholder="0.00"
                                    className="w-full pl-6 pr-2 py-2 text-xs border rounded shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 border-slate-300 text-center hover:border-slate-400 transition-colors min-w-[110px]"
                                    onFocus={(e) => {
                                      // Ensure the item exists for this year and category
                                      if (itemIndex < 0) {
                                        addLostRevenueItem(yearIndex, category);
                                        // Re-register the field after adding the item
                                        setTimeout(() => {
                                          // Register the category field as well
                                          register(`rehab.lostRevenueAndCosts.${yearIndex}.items.${yearData.items.length}.category`);
                                          e.target.focus();
                                        }, 0);
                                      }
                                      e.target.select(); // Select all text on focus
                                    }}
                                    onChange={(e) => {
                                      // Ensure the item exists when the user types
                                      if (itemIndex < 0) {
                                        addLostRevenueItem(yearIndex, category);
                                      }
                                      // Update the form value immediately
                                      const value = parseFloat(e.target.value) || 0;
                                      setValue(`rehab.lostRevenueAndCosts.${yearIndex}.items.${actualIndex}.amount`, value);
                                    }}
                                  />
                                </div>
                              </td>
                            );
                          })}
                          <td className="px-3 py-3 text-center font-semibold border-r border-slate-200 bg-slate-50">
                            <div className="text-sm text-slate-900">
                              ${(() => {
                                const total = yearlyLostRevenueData.reduce((acc, yearData) => {
                                  const item = yearData.items.find(item => item.category && item.category.trim() === category);
                                  return acc + (item?.amount || 0);
                                }, 0);
                                return total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                              })()}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {category.toLowerCase() !== 'lost revenue' && (
                              <button
                                type="button"
                                onClick={() => {
                                  // Remove this category from all years
                                  yearlyLostRevenueData.forEach((_, yearIndex) => {
                                    const itemIndex = yearlyLostRevenueData[yearIndex].items.findIndex(item => item.category && item.category.trim() === category);
                                    if (itemIndex >= 0) {
                                      removeLostRevenueItem(yearIndex, itemIndex);
                                    }
                                  });
                                }}
                                className="p-1.5 rounded hover:bg-red-100 transition-colors group/button"
                                aria-label="Remove Category"
                                title={`Remove "${category}" from all years`}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600 group-hover/button:text-red-700" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ));
                    })()}
                    
                    {/* Add new category row */}
                    <tr className="bg-rose-25 border-t-2 border-rose-200">
                      <td className="sticky left-0 bg-rose-25 px-4 py-3 border-r border-slate-200 z-10 shadow-lg shadow-slate-200/30">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter new category (e.g., Lost Rent, Utilities)..."
                            className="flex-1 px-3 py-2 text-xs border rounded shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 border-slate-300 placeholder-slate-400"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                const category = target.value.trim();
                                if (category) {
                                  addCategoryToAllYears(category);
                                  target.value = '';
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.querySelector('input[placeholder*="Enter new category"]') as HTMLInputElement;
                              const category = input?.value.trim();
                              if (category) {
                                addCategoryToAllYears(category);
                                input.value = '';
                                input.focus();
                              } else {
                                input?.focus();
                              }
                            }}
                            className="text-rose-600 hover:text-white hover:bg-rose-600 text-xs font-medium px-2 py-2 rounded border border-rose-300 hover:border-rose-600 transition-colors whitespace-nowrap"
                          >
                            + Add
                          </button>
                        </div>
                      </td>
                      {yearlyLostRevenueData.map((_, yearIndex) => (
                        <td key={yearIndex} className="px-3 py-3 border-r border-slate-200">
                          {/* Empty cell */}
                        </td>
                      ))}
                      <td className="px-3 py-3 border-r border-slate-200">
                        {/* Empty cell */}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {/* Empty cell */}
                      </td>
                    </tr>
                    
                    {/* Table Footer with Yearly Totals - Now part of the same table */}
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-200">
                      <td className="sticky left-0 bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 text-xs font-bold text-slate-800 border-r border-slate-200 min-w-[180px] z-10 shadow-lg shadow-slate-200/50">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full"></div>
                          Yearly Totals:
                        </div>
                      </td>
                      {yearlyLostRevenueData.map((yearData, yearIndex) => (
                        <td key={yearIndex} className="px-3 py-3 text-center text-sm font-bold text-slate-800 border-r border-slate-200 min-w-[130px]">
                          <div className="bg-white rounded py-1.5 shadow-sm text-xs">
                            ${yearData.items.reduce((acc, item) => acc + (item.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </div>
                        </td>
                      ))}
                      <td className="px-3 py-3 text-center text-lg font-bold text-slate-900 border-r border-slate-200 min-w-[110px] bg-rose-50">
                        <div className="bg-white rounded py-1.5 shadow-md border-2 border-rose-200 text-sm">
                          ${yearlyLostRevenueData.reduce((yearAcc, yearData) => 
                            yearAcc + yearData.items.reduce((itemAcc, item) => itemAcc + (item.amount || 0), 0), 0
                          ).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                      </td>
                      <td className="w-12 px-3 py-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}