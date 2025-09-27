import React from 'react';
import { useFormContext } from 'react-hook-form';
import { PropertyData } from '../../types/property';

export default function FinancingStep() {
  const { register, watch, setValue, formState: { errors }, trigger } = useFormContext<PropertyData>();

  const purchasePrice = watch('purchasePrice');
  const finance = watch('finance');

  const calculateDownPaymentAmount = () => {
    if (finance.downPaymentType === 'percentage') {
      return (purchasePrice * finance.downPayment) / 100;
    }
    return finance.downPayment;
  };

  const calculateLoanAmount = () => {
    return purchasePrice - calculateDownPaymentAmount();
  };

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Step 2: Financing</h2>
        <p className="text-slate-500">Enter the financing details for the property.</p>
      </div>
      
      <div>
        <label htmlFor="downPayment" className="block text-sm font-medium text-slate-700 mb-1">
          Down Payment
        </label>
        <div className="flex">
          <input
            type="number"
            id="downPayment"
            {...register('finance.downPayment', {
              valueAsNumber: true,
              validate: (value, formValues) => {
                if (formValues.finance.downPaymentType === 'percentage') {
                  if (value < 0) return 'Percentage must be at least 0';
                  if (value > 100) return 'Percentage must not exceed 100';
                }
                return true;
              }
            })}
            className="w-full px-3 py-2 border border-slate-300 rounded-l-md shadow-sm"
          />
          <button
            type="button"
            onClick={() => {
              setValue('finance.downPaymentType', 'percentage');
              trigger('finance.downPayment');
            }}
            className={`px-4 py-2 border ${finance.downPaymentType === 'percentage' ? 'bg-rose-500 text-white' : 'bg-slate-200'}`}
          >
            %
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('finance.downPaymentType', 'amount');
              trigger('finance.downPayment');
            }}
            className={`px-4 py-2 border rounded-r-md ${finance.downPaymentType === 'amount' ? 'bg-rose-500 text-white' : 'bg-slate-200'}`}
          >
            $
          </button>
        </div>
        {errors.finance?.downPayment && (
          <p className="text-red-500 text-sm mt-1">
            {errors.finance.downPayment.message}
          </p>
        )}
        <p className="text-sm text-slate-500 mt-1">
          Calculated Down Payment: ${calculateDownPaymentAmount().toLocaleString()}
        </p>
      </div>
      <div>
        <label htmlFor="interestRate" className="block text-sm font-medium text-slate-700 mb-1">
          Interest Rate (%)
        </label>
        <input
          type="number"
          id="interestRate"
          {...register('finance.interestRate', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
        />
      </div>
      <p className="text-sm text-slate-500 mt-1">
        Loan Amount: ${calculateLoanAmount().toLocaleString()}
      </p>

      <hr className="my-6" />

      <h3 className="text-lg font-medium text-slate-800">Loan Costs</h3>
      <div>
        <label htmlFor="closingCosts" className="block text-sm font-medium text-slate-700 mb-1">
          Closing Costs
        </label>
        <input
          type="number"
          id="closingCosts"
          {...register('finance.closingCosts', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label htmlFor="points" className="block text-sm font-medium text-slate-700 mb-1">
          Points (%)
        </label>
        <input
          type="number"
          id="points"
          {...register('finance.points', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label htmlFor="otherCosts" className="block text-sm font-medium text-slate-700 mb-1">
          Other Costs
        </label>
        <input
          type="number"
          id="otherCosts"
          {...register('finance.otherCosts', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
        />
      </div>
    </>
  );
}