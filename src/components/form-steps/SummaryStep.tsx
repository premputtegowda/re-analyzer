import React from 'react';
import { useFormContext } from 'react-hook-form';
import { PropertyData } from '../../types/property';

export default function SummaryStep() {
  const { watch } = useFormContext<PropertyData>();
  
  // We'll add calculation logic here in the next step.
  const allData = watch();

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Step 6: Summary</h2>
        <p className="text-slate-500">Review the complete analysis of your property below.</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-800">Property Summary</h3>
        <pre className="p-4 bg-slate-100 rounded-md text-sm overflow-x-auto">
          {JSON.stringify(allData, null, 2)}
        </pre>
      </div>
    </>
  );
}