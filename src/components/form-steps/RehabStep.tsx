import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { PropertyData } from '../../types/property';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RehabStep() {
  const [activeRehabTab, setActiveRehabTab] = useState<'hardCosts' | 'softCosts'>('hardCosts');
  const [currentYearPage, setCurrentYearPage] = useState(0); // For pagination
  const { register, watch, setValue, formState: { errors } } = useFormContext<PropertyData>();
                                updatedData[yearIndex] = {
                                  ...updatedData[yearIndex],
                                  items: [...updatedData[yearIndex].items, { category, amount: 0 }]
                                };
                                
                                setValue('rehab.lostRevenueAndCosts', updatedData);
                                
                                // Optional: Focus the newly created input field after a brief delay
                                setTimeout(() => {
                                  const newInputs = document.querySelectorAll(`input[name*="rehab.lostRevenueAndCosts.${yearIndex}.items"]`);
                                  const lastInput = newInputs[newInputs.length - 1] as HTMLInputElement;
                                  if (lastInput && lastInput.type === 'number') {
                                    lastInput.focus();
                                    lastInput.select();
                                  }
                                }, 100);
                              }}
                              className="w-full px-1 py-1 text-xs text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >rPage] = useState(0); // For pagination
  const { register, watch, setValue, formState: { errors } } = useFormContext<PropertyData>();

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
  const holdPeriod = watch('holdPeriod') || 5; // Default to 5 years if not set

  // Initialize yearly lost revenue structure if needed
  const initializeYearlyLostRevenue = () => {
    const years = Array.from({ length: holdPeriod }, (_, i) => ({
      year: i + 1,
      items: []
    }));
    return years;
  };

  const getYearlyLostRevenue = () => {
    if (!rehabData?.lostRevenueAndCosts || rehabData.lostRevenueAndCosts.length === 0) {
      return initializeYearlyLostRevenue();
    }
    
    // Ensure we have data for each year
    const existingYears = rehabData.lostRevenueAndCosts;
    const years = [];
    
    for (let i = 1; i <= holdPeriod; i++) {
      const existingYear = existingYears.find(y => y.year === i);
      years.push(existingYear || { year: i, items: [] });
    }
    
    return years;
  };

  // Helper functions for managing yearly lost revenue items
  const addItemToYear = (yearIndex: number) => {
    const currentData = getYearlyLostRevenue();
    const updatedData = [...currentData];
    updatedData[yearIndex] = {
      ...updatedData[yearIndex],
      items: [...updatedData[yearIndex].items, { category: '', amount: 0 }]
    };
    setValue('rehab.lostRevenueAndCosts', updatedData);
  };

  const removeItemFromYear = (yearIndex: number, itemIndex: number) => {
    const currentData = getYearlyLostRevenue();
    const updatedData = [...currentData];
    updatedData[yearIndex] = {
      ...updatedData[yearIndex],
      items: updatedData[yearIndex].items.filter((_, index) => index !== itemIndex)
    };
    setValue('rehab.lostRevenueAndCosts', updatedData);
  };

  const getDisplayYears = () => {
    const allYears = getYearlyLostRevenue();
    
    // If 2 or fewer years, show all
    if (holdPeriod <= 2) {
      return allYears;
    }
    
    // Show 2 years at a time for pagination
    const yearsPerPage = 2;
    const startIndex = currentYearPage * yearsPerPage;
    const endIndex = startIndex + yearsPerPage;
    
    return allYears.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    if (holdPeriod <= 2) return 1;
    return Math.ceil(holdPeriod / 2);
  };

  const getCurrentPageRange = () => {
    if (holdPeriod <= 2) return `1-${holdPeriod}`;
    const startYear = currentYearPage * 2 + 1;
    const endYear = Math.min(startYear + 1, holdPeriod);
    return `${startYear}-${endYear}`;
  };

  const getGrandTotal = () => {
    // Calculate total across ALL years, not just displayed ones
    const allYears = getYearlyLostRevenue();
    return allYears.reduce((total, year) => 
      total + year.items.reduce((yearTotal, item) => yearTotal + (item.amount || 0), 0), 0
    );
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

      {/* Lost Revenue/Costs Section - Spreadsheet View */}
      <div className="bg-slate-50 p-2 sm:p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
          <h3 className="text-base sm:text-lg font-medium text-slate-800">Lost Revenue/Costs During Rehab</h3>
          
          {/* Navigation Controls */}
          {holdPeriod > 2 && (
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 border">
              <button
                type="button"
                onClick={() => setCurrentYearPage(Math.max(0, currentYearPage - 1))}
                disabled={currentYearPage === 0}
                className={`p-1 rounded transition-colors ${
                  currentYearPage === 0 
                    ? 'text-slate-300 cursor-not-allowed' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
                aria-label="Previous years"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-xs sm:text-sm font-medium text-slate-700 px-2">
                <span className="hidden sm:inline">Years {getCurrentPageRange()} of {holdPeriod}</span>
                <span className="sm:hidden">Y{getCurrentPageRange()}/{holdPeriod}</span>
              </span>
              
              <button
                type="button"
                onClick={() => setCurrentYearPage(Math.min(getTotalPages() - 1, currentYearPage + 1))}
                disabled={currentYearPage >= getTotalPages() - 1}
                className={`p-1 rounded transition-colors ${
                  currentYearPage >= getTotalPages() - 1
                    ? 'text-slate-300 cursor-not-allowed' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
                aria-label="Next years"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Info badge for single page view */}
          {holdPeriod <= 2 && (
            <span className="text-xs sm:text-sm text-slate-600 bg-blue-100 px-2 py-1 rounded text-center">
              Showing all {holdPeriod} years
            </span>
          )}
        </div>
        
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="min-w-max px-2 sm:px-0">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm text-xs sm:text-sm">
              {/* Header Row */}
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-1 sm:px-3 py-1 sm:py-2 text-left font-semibold text-slate-700 min-w-[100px] sm:min-w-[200px]">
                    <span className="hidden sm:inline">Category</span>
                    <span className="sm:hidden">Item</span>
                  </th>
                  {getDisplayYears().map((yearData) => (
                    <th key={yearData.year} className="border border-slate-300 px-1 sm:px-3 py-1 sm:py-2 text-center font-semibold text-slate-700 min-w-[60px] sm:min-w-[120px]">
                      <span className="hidden sm:inline">Year {yearData.year}</span>
                      <span className="sm:hidden">Y{yearData.year}</span>
                    </th>
                  ))}
                  <th className="border border-slate-300 px-1 sm:px-3 py-1 sm:py-2 text-center font-semibold text-slate-700 min-w-[60px] sm:min-w-[100px]">
                    Total
                  </th>
                  <th className="border border-slate-300 px-1 py-1 sm:py-2 text-center font-semibold text-slate-700 w-8 sm:w-12">
                    
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Existing Cost Rows */}
                {(() => {
                  const allCategories = new Set<string>();
                  getDisplayYears().forEach(year => {
                    year.items.forEach(item => {
                      if (item.category) allCategories.add(item.category);
                    });
                  });

                  return Array.from(allCategories).map((category, categoryIndex) => (
                    <tr key={category} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-1 sm:px-3 py-1 sm:py-2">
                        <span className="font-medium text-slate-700 text-xs sm:text-sm leading-tight">
                          {category.length > 15 ? `${category.substring(0, 15)}...` : category}
                        </span>
                      </td>
                      {getDisplayYears().map((yearData, yearIndex) => {
                        const existingItem = yearData.items.find(item => item.category === category);
                        const existingItemIndex = yearData.items.findIndex(item => item.category === category);
                        
                        return (
                          <td key={yearData.year} className="border border-slate-300 px-1 py-1 sm:py-2">
                            {existingItem ? (
                              <input
                                type="number"
                                {...register(`rehab.lostRevenueAndCosts.${yearIndex}.items.${existingItemIndex}.amount`, {
                                  valueAsNumber: true,
                                  min: { value: 0, message: 'Must be ≥ 0' }
                                })}
                                className="w-full px-1 py-1 text-xs sm:text-sm border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                                placeholder="0"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  const currentData = getYearlyLostRevenue();
                                  const updatedData = [...currentData];
                                  updatedData[yearIndex] = {
                                    ...updatedData[yearIndex],
                                    items: [...updatedData[yearIndex].items, { category, amount: 0 }]
                                  };
                                  setValue('rehab.lostRevenueAndCosts', updatedData);
                                }}
                                className="w-full px-1 py-1 text-xs text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                <span className="hidden sm:inline">+ Add</span>
                                <span className="sm:hidden">+</span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                      <td className="border border-slate-300 px-1 sm:px-3 py-1 sm:py-2 text-center font-semibold text-slate-700">
                        <span className="text-xs sm:text-sm">
                          ${(() => {
                            // Calculate total across ALL years for this category, not just displayed
                            const allYears = getYearlyLostRevenue();
                            const total = allYears.reduce((total, yearData) => {
                              const item = yearData.items.find(item => item.category === category);
                              return total + (item?.amount || 0);
                            }, 0);
                            return total >= 1000 ? `${(total/1000).toFixed(0)}k` : total.toLocaleString();
                          })()}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-1 py-1 sm:py-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const currentData = getYearlyLostRevenue();
                            const updatedData = currentData.map(yearData => ({
                              ...yearData,
                              items: yearData.items.filter(item => item.category !== category)
                            }));
                            setValue('rehab.lostRevenueAndCosts', updatedData);
                          }}
                          className="p-0.5 sm:p-1 rounded hover:bg-red-100 transition-colors"
                          aria-label={`Remove ${category} row`}
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ));
                })()}

                {/* Add New Category Row */}
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 px-1 sm:px-3 py-1 sm:py-2">
                    <input
                      type="text"
                      placeholder="New category..."
                      className="w-full px-1 sm:px-2 py-1 text-xs sm:text-sm border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          const newCategory = input.value.trim();
                          if (newCategory) {
                            const currentData = getYearlyLostRevenue();
                            const updatedData = [...currentData];
                            // Add to first year by default
                            updatedData[0] = {
                              ...updatedData[0],
                              items: [...updatedData[0].items, { category: newCategory, amount: 0 }]
                            };
                            setValue('rehab.lostRevenueAndCosts', updatedData);
                            input.value = '';
                          }
                        }
                      }}
                    />
                  </td>
                  {getDisplayYears().map((yearData) => (
                    <td key={yearData.year} className="border border-slate-300 px-1 py-1 sm:py-2 text-center text-slate-400">
                      <span className="text-xs">-</span>
                    </td>
                  ))}
                  <td className="border border-slate-300 px-1 sm:px-3 py-1 sm:py-2 text-center text-slate-400">
                    <span className="text-xs">-</span>
                  </td>
                  <td className="border border-slate-300 px-1 py-1 sm:py-2">
                    
                  </td>
                </tr>

                {/* Totals Row */}
                <tr className="bg-slate-100 font-semibold">
                  <td className="border border-slate-300 px-1 sm:px-3 py-1 sm:py-2 text-slate-800">
                    <span className="text-xs sm:text-sm">
                      <span className="hidden sm:inline">Year Totals</span>
                      <span className="sm:hidden">Totals</span>
                    </span>
                  </td>
                  {getDisplayYears().map((yearData) => (
                    <td key={yearData.year} className="border border-slate-300 px-1 py-1 sm:py-2 text-center text-slate-800">
                      <span className="text-xs sm:text-sm">
                        ${(() => {
                          const total = yearData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
                          return total >= 1000 ? `${(total/1000).toFixed(0)}k` : total.toLocaleString();
                        })()}
                      </span>
                    </td>
                  ))}
                  <td className="border border-slate-300 px-1 sm:px-3 py-1 sm:py-2 text-center font-bold text-slate-900">
                    <span className="text-xs sm:text-sm">
                      ${(() => {
                        const grandTotal = getGrandTotal();
                        return grandTotal >= 1000 ? `${(grandTotal/1000).toFixed(0)}k` : grandTotal.toLocaleString();
                      })()}
                    </span>
                    {holdPeriod > 2 && (
                      <div className="text-xs text-slate-500 font-normal">
                        <span className="hidden sm:inline">(All {holdPeriod} years)</span>
                        <span className="sm:hidden">(All)</span>
                      </div>
                    )}
                  </td>
                  <td className="border border-slate-300 px-1 py-1 sm:py-2">
                    
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional info for paginated view */}
        {holdPeriod > 2 && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-slate-600">
            <p className="font-medium">
              📊 <span className="hidden sm:inline">Viewing years {getCurrentPageRange()} • Total column shows all {holdPeriod} years combined</span>
              <span className="sm:hidden">Y{getCurrentPageRange()} shown • Total = all {holdPeriod} years</span>
            </p>
          </div>
        )}

        <div className="mt-3 sm:mt-4 text-xs text-slate-600">
          <p className="font-medium mb-1 sm:mb-2">
            <span className="hidden sm:inline">Instructions:</span>
            <span className="sm:hidden">How to use:</span>
          </p>
          <ul className="list-disc list-inside space-y-0.5 sm:space-y-1">
            <li className="leading-tight">Type category name and press Enter to add row</li>
            <li className="leading-tight">
              <span className="hidden sm:inline">Click "+ Add" in any cell to add that category to that year</span>
              <span className="sm:hidden">Click "+" to add category to year</span>
            </li>
            <li className="leading-tight">Use trash icon to remove category rows</li>
            {holdPeriod > 2 && (
              <li className="leading-tight">
                <span className="hidden sm:inline">Use ← → arrows to navigate between year groups (showing 2 years at a time)</span>
                <span className="sm:hidden">Use ← → to see other years (2 at a time)</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}