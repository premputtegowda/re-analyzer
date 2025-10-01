import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { PropertyData } from '../../types/property';

export default function FinancingStep() {
  const { register, watch, setValue, formState: { errors }, trigger } = useFormContext<PropertyData>();

  const purchasePrice = watch('purchasePrice');
  const finance = watch('finance');
  const interestRate = watch('finance.interestRate');

  // Save interest rate to localStorage whenever it changes
  useEffect(() => {
    if (interestRate !== undefined && interestRate !== null) {
      localStorage.setItem('lastInterestRate', interestRate.toString());
    }
  }, [interestRate]);

  const calculateDownPaymentAmount = () => {
    if (purchasePrice && finance.downPayment) {
        if (finance.downPaymentType === 'percentage') {
            return (purchasePrice * finance.downPayment) / 100;
        }
        return finance.downPayment;
    }
    return 0;
  };

  const calculateLoanAmount = () => {
    return purchasePrice > 0 ? purchasePrice - calculateDownPaymentAmount() : 0;
  };

  const calculateMonthlyPayment = () => {
    const principal = calculateLoanAmount();
    const monthlyInterestRate = (finance.interestRate || 0) / 100 / 12;
    const numberOfPayments = (finance.loanTerm || 0) * 12;

    if (principal > 0 && monthlyInterestRate > 0 && numberOfPayments > 0) {
      const numerator = monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments);
      const denominator = Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1;
      return principal * (numerator / denominator);
    }
    return 0;
  };

  const calculatePointsAmount = () => {
    const loanAmount = calculateLoanAmount();
    if (loanAmount && finance.points) {
      return (loanAmount * finance.points) / 100;
    }
    return 0;
  };

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Step 2: Financing</h2>
        <p className="text-slate-500">Enter the financing details for the property.</p>
      </div>
      
      {/* Down Payment Input */}
      <div>
        <label htmlFor="downPayment" className="block text-sm font-medium text-slate-700 mb-1">
          Down Payment <span className="text-red-500">*</span>
        </label>
        <div className="flex">
          <input
            type="number"
            id="downPayment"
            {...register('finance.downPayment', {
              required: 'Down payment is required',
              valueAsNumber: true,
              validate: (value, formValues) => {
                if (value === undefined || value === null) return 'Down payment is required';
                if (formValues.finance.downPaymentType === 'percentage') {
                  if (value < 0) return 'Percentage must be at least 0';
                  if (value > 100) return 'Percentage must not exceed 100';
                } else {
                  if (value < 0) return 'Amount must be at least 0';
                }
                return true;
              }
            })}
            className={`w-full px-3 py-2 border rounded-l-md shadow-sm ${
              errors.finance?.downPayment ? 'border-red-500 focus:border-red-500' : 'border-slate-300'
            }`}
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

      {/* Interest Rate and Loan Term */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="interestRate" className="block text-sm font-medium text-slate-700 mb-1">
            Interest Rate (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="interestRate"
            step="0.01"
            {...register('finance.interestRate', { 
              required: 'Interest rate is required',
              valueAsNumber: true,
              min: { value: 0, message: 'Interest rate must be 0 or greater' }
            })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm ${
              errors.finance?.interestRate ? 'border-red-500 focus:border-red-500' : 'border-slate-300'
            }`}
          />
          {errors.finance?.interestRate && (
            <p className="mt-1 text-sm text-red-600">{errors.finance.interestRate.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="loanTerm" className="block text-sm font-medium text-slate-700 mb-1">
            Loan Term (Years) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="loanTerm"
            {...register('finance.loanTerm', { 
              required: 'Loan term is required',
              valueAsNumber: true,
              min: { value: 1, message: 'Loan term must be at least 1 year' },
              max: { value: 50, message: 'Loan term cannot exceed 50 years' }
            })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm ${
              errors.finance?.loanTerm ? 'border-red-500 focus:border-red-500' : 'border-slate-300'
            }`}
          />
          {errors.finance?.loanTerm && (
            <p className="mt-1 text-sm text-red-600">{errors.finance.loanTerm.message}</p>
          )}
        </div>
      </div>

      {/* Loan Amount and Monthly Payment */}
      <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-sm font-medium text-slate-700">Loan Amount:</p>
            <p className="text-lg font-semibold text-slate-800">${calculateLoanAmount().toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Monthly Payment (P&I):</p>
            <p className="text-lg font-semibold text-slate-800">${calculateMonthlyPayment().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
      </div>


      <hr className="my-6" />

      {/* Loan Costs */}
      <h3 className="text-lg font-medium text-slate-800">Loan Costs</h3>
      <div>
        <label htmlFor="closingCosts" className="block text-sm font-medium text-slate-700 mb-1">
          Closing Costs <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="closingCosts"
          {...register('finance.closingCosts', { 
            required: 'Closing costs is required',
            valueAsNumber: true,
            min: { value: 0, message: 'Closing costs must be 0 or greater' }
          })}
          className={`w-full px-3 py-2 border rounded-md shadow-sm ${
            errors.finance?.closingCosts ? 'border-red-500 focus:border-red-500' : 'border-slate-300'
          }`}
        />
        {errors.finance?.closingCosts && (
          <p className="mt-1 text-sm text-red-600">{errors.finance.closingCosts.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="points" className="block text-sm font-medium text-slate-700 mb-1">
          Points (%)
        </label>
        <input
          type="number"
          id="points"
          step="0.01"
          {...register('finance.points', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
        />
        <p className="text-sm text-slate-500 mt-1">
          Calculated Points Amount: ${calculatePointsAmount().toLocaleString()}
        </p>
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