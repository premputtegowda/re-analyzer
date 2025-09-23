import React from 'react';
import { Home, Building2, Building, LandPlot } from 'lucide-react'; // Icon imports
import { PropertyType } from '../types/property';

// Define the options with their corresponding icons
const propertyOptions = [
  { value: 'Single Family Home', label: 'Single Family', Icon: Home },
  { value: 'MultiFamily', label: 'Multifamily', Icon: Building2 },
  { value: 'Condo', label: 'Condo', Icon: Building },
  { value: 'Townhouse', label: 'Townhouse', Icon: LandPlot },
];

type PropertyTypeSelectorProps = {
  value: PropertyType;
  onChange: (value: PropertyType) => void;
};

export default function PropertyTypeSelector({ value, onChange }: PropertyTypeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Property Type *
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {propertyOptions.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value as PropertyType)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors
                ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-blue-500'
                }
              `}
            >
              <option.Icon className="w-8 h-8 mb-2" />
              <span className="font-semibold">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}