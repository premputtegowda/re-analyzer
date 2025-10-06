import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { PropertyData } from '../../types/property';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RehabStep() {
  const [activeRehabTab, setActiveRehabTab] = useState<'hardCosts' | 'softCosts'>('hardCosts');
  const [currentYearPage, setCurrentYearPage] = useState(0); // For pagination
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

  const calculateTotalLostRevenue = () => {
    return getGrandTotal();
  };

  const calculateTotalRehab = () => {
    return calculateTotalHardCosts() + calculateTotalSoftCosts() + calculateTotalLostRevenue();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Rehab/Development Details</h2>
        <p className="text-slate-600">
          Add information about any renovation or development work needed for this property.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600">Hard Costs</h3>
          <p className="text-2xl font-bold text-blue-800">${calculateTotalHardCosts().toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-600">Soft Costs</h3>
          <p className="text-2xl font-bold text-green-800">${calculateTotalSoftCosts().toLocaleString()}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-600">Lost Revenue</h3>
          <p className="text-2xl font-bold text-red-800">${calculateTotalLostRevenue().toLocaleString()}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-slate-600">Total Rehab</h3>
          <p className="text-2xl font-bold text-slate-800">${calculateTotalRehab().toLocaleString()}</p>
        </div>
      </div>

      {/* All Cost Types in One Row - Compact Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Hard Costs Column */}
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-lg font-medium text-blue-800">Hard Costs</h3>
            <span className="text-xl sm:text-2xl font-bold text-blue-800">${calculateTotalHardCosts().toLocaleString()}</span>
          </div>
          
          {hardCostFields.length === 0 ? (
            <div className="text-center py-4">
              <button
                type="button"
                onClick={() => appendHardCost({ category: '', amount: 0 })}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                + Add Hard Cost
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {hardCostFields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-2">
                  <input
                    {...register(`rehab.hardCosts.${index}.category`, {
                      required: 'Category is required'
                    })}
                    placeholder="e.g., Flooring, Kitchen"
                    className={`w-full px-2 py-1 text-xs sm:text-sm border rounded ${
                      errors.rehab?.hardCosts?.[index]?.category ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      {...register(`rehab.hardCosts.${index}.amount`, {
                        valueAsNumber: true,
                        required: 'Amount is required',
                        min: { value: 0.01, message: 'Must be > 0' }
                      })}
                      placeholder="Amount"
                      className={`flex-1 px-2 py-1 text-xs sm:text-sm border rounded ${
                        errors.rehab?.hardCosts?.[index]?.amount ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => removeHardCost(index)}
                      className="p-1 rounded hover:bg-red-100"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendHardCost({ category: '', amount: 0 })}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                + Add Hard Cost
              </button>
            </div>
          )}
        </div>

        {/* Soft Costs Column */}
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-lg font-medium text-green-800">Soft Costs</h3>
            <span className="text-xl sm:text-2xl font-bold text-green-800">${calculateTotalSoftCosts().toLocaleString()}</span>
          </div>
          
          {softCostFields.length === 0 ? (
            <div className="text-center py-4">
              <button
                type="button"
                onClick={() => appendSoftCost({ category: '', amount: 0 })}
                className="text-green-600 hover:text-green-800 font-medium text-sm"
              >
                + Add Soft Cost
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {softCostFields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-2">
                  <input
                    {...register(`rehab.softCosts.${index}.category`, {
                      required: 'Category is required'
                    })}
                    placeholder="e.g., Permits, Architecture"
                    className={`w-full px-2 py-1 text-xs sm:text-sm border rounded ${
                      errors.rehab?.softCosts?.[index]?.category ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      {...register(`rehab.softCosts.${index}.amount`, {
                        valueAsNumber: true,
                        required: 'Amount is required',
                        min: { value: 0.01, message: 'Must be > 0' }
                      })}
                      placeholder="Amount"
                      className={`flex-1 px-2 py-1 text-xs sm:text-sm border rounded ${
                        errors.rehab?.softCosts?.[index]?.amount ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => removeSoftCost(index)}
                      className="p-1 rounded hover:bg-red-100"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendSoftCost({ category: '', amount: 0 })}
                className="text-green-600 hover:text-green-800 font-medium text-sm"
              >
                + Add Soft Cost
              </button>
            </div>
          )}
        </div>

        {/* Lost Revenue/Costs Column */}
        <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-lg font-medium text-red-800">Lost Revenue</h3>
            <span className="text-xl sm:text-2xl font-bold text-red-800">${calculateTotalLostRevenue().toLocaleString()}</span>
          </div>
          
          {/* Navigation Controls for Lost Revenue */}
          {holdPeriod > 2 && (
            <div className="flex items-center justify-center gap-2 mb-3">
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
                <ChevronLeft className="w-3 h-3" />
              </button>
              
              <span className="text-xs font-medium text-slate-700 px-2">
                Y{getCurrentPageRange()}/{holdPeriod}
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
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {/* Compact Lost Revenue Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded overflow-hidden text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-1 py-1 text-left font-semibold text-slate-700 text-xs">
                    Item
                  </th>
                  {getDisplayYears().map((yearData) => (
                    <th key={yearData.year} className="border border-slate-300 px-1 py-1 text-center font-semibold text-slate-700 text-xs">
                      Y{yearData.year}
                    </th>
                  ))}
                  <th className="border border-slate-300 px-1 py-1 text-center font-semibold text-slate-700 w-4">
                    
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

                  return Array.from(allCategories).map((category) => (
                    <tr key={category} className="hover:bg-slate-50">
                      <td className="border border-slate-300 px-1 py-1">
                        <span className="font-medium text-slate-700 text-xs">
                          {category.length > 10 ? `${category.substring(0, 10)}...` : category}
                        </span>
                      </td>
                      {getDisplayYears().map((yearData, yearIndex) => {
                        const existingItem = yearData.items.find(item => item.category === category);
                        const existingItemIndex = yearData.items.findIndex(item => item.category === category);
                        
                        return (
                          <td key={yearData.year} className="border border-slate-300 px-1 py-1">
                            {existingItem ? (
                              <input
                                type="number"
                                {...register(`rehab.lostRevenueAndCosts.${yearIndex}.items.${existingItemIndex}.amount`, {
                                  valueAsNumber: true,
                                  min: { value: 0, message: 'Must be ≥ 0' }
                                })}
                                className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded"
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
                                className="w-full px-1 py-0.5 text-xs text-slate-400 hover:text-blue-600 rounded"
                              >
                                +
                              </button>
                            )}
                          </td>
                        );
                      })}
                      <td className="border border-slate-300 px-1 py-1 text-center">
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
                          className="p-0.5 rounded hover:bg-red-100"
                          aria-label={`Remove ${category}`}
                        >
                          <Trash2 className="w-2 h-2 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ));
                })()}

                {/* Add New Category Row */}
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 px-1 py-1">
                    <input
                      type="text"
                      placeholder="New item..."
                      className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          const newCategory = input.value.trim();
                          if (newCategory) {
                            const currentData = getYearlyLostRevenue();
                            const updatedData = [...currentData];
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
                    <td key={yearData.year} className="border border-slate-300 px-1 py-1 text-center text-slate-400">
                      <span className="text-xs">-</span>
                    </td>
                  ))}
                  <td className="border border-slate-300 px-1 py-1">
                    
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {holdPeriod > 2 && (
            <div className="mt-1 text-xs text-slate-600 text-center">
              📊 Total includes all {holdPeriod} years
            </div>
          )}
        </div>
      </div>
          
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
          
          {holdPeriod > 2 && (
            <div className="mt-1 text-xs text-slate-600 text-center">
              📊 Total includes all {holdPeriod} years
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
