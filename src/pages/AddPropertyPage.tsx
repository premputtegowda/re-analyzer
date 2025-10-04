import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { PropertyData, PropertySummary } from '../types/property';
import Button from '../components/Button';
import { Home, Banknote, Wrench, Landmark, Receipt, ArrowLeft, ArrowRight, ClipboardList, LucideProps, Save, X, FileText } from 'lucide-react';
import PropertyInfoStep from '../components/form-steps/PropertyInfoStep';
import FinancingStep from '../components/form-steps/FinancingStep';
import IncomeStep from '../components/form-steps/IncomeStep';
import ExpensesStep from '../components/form-steps/ExpensesStep';
import RehabStep from '../components/form-steps/RehabStep';
import SummaryStep from '../components/form-steps/SummaryStep';
import { propertyApi } from '../services/propertyApi';

type AddPropertyPageProps = {
  existingPropertyData?: PropertySummary;
};

type Step = {
  id: number;
  name: string;
  Icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  path?: string;
};

export default function AddPropertyPage({ existingPropertyData }: AddPropertyPageProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Get stored interest rate from localStorage
  const getStoredInterestRate = () => {
    const stored = localStorage.getItem('lastInterestRate');
    return stored ? parseFloat(stored) : 0;
  };
  
  const methods = useForm<PropertyData>({
    mode: 'onChange',
    defaultValues: existingPropertyData || {
      address: '',
      purchasePrice: 0,
      propertyType: 'MultiFamily',
      projectedRentGrowth: 2,
      holdPeriod: 5,
      averageLeaseLength: 12,
      expenseGrowthRate: 3,
      appreciationRate: 2,
      vacancyRate: 5,
      units: [{ beds: 1, baths: 1, sqft: 0, monthlyRent: 0, numberOfUnits: 1 }],
      otherIncome: [],
      finance: {
        downPayment: 25,
        downPaymentType: 'percentage',
        interestRate: getStoredInterestRate(),
        loanTerm: 30,
        closingCosts: 0,
        points: 0,
        otherCosts: 0,
      },
      expenses: {
        annualPropertyTaxes: 0,
        annualPropertyInsurance: 0,
        hoa: 0,
        water: 0,
        gas: 0,
        electricity: 0,
        landscapingSnowRemoval: 0,
        internet: 0,
        security: 0,
        administrativeManagement: 0,
        repairsMaintenancePercentage: 0,
        propertyManagementPercentage: 0,
        leasingFee: 0,
        replacementReserves: 5,
        customExpenses: [],
        oneTimeExpenses: [],
      },
      rehab: {
        hardCosts: [],
        softCosts: [],
        lostRevenueAndCosts: [],
      },
    },
  });

  const { reset, watch, formState: { errors, isValid } } = methods;

  // Watch all form values to check completeness
  const watchedValues = watch();

  // Function to check if all required fields are filled
  const isFormComplete = () => {
    const requiredFields = [
      'address',
      'purchasePrice'
    ];

    // Check critical required fields (only those that user must input)
    for (const field of requiredFields) {
      const value = watchedValues[field as keyof PropertyData];
      if (!value && value !== 0) return false;
    }

    // Address must be non-empty string
    if (!watchedValues.address || watchedValues.address.trim() === '') return false;

    // Purchase price must be greater than 0
    if (!watchedValues.purchasePrice || watchedValues.purchasePrice <= 0) return false;

    // Check units (at least one unit with monthly rent > 0)
    if (!watchedValues.units || watchedValues.units.length === 0) return false;
    const hasValidUnit = watchedValues.units.some(unit => 
      unit.monthlyRent && unit.monthlyRent > 0
    );
    if (!hasValidUnit) return false;

    // Check finance data (required fields only)
    if (!watchedValues.finance) return false;
    const financeRequired = ['downPayment', 'downPaymentType', 'interestRate', 'loanTerm'];
    for (const field of financeRequired) {
      const value = watchedValues.finance[field as keyof typeof watchedValues.finance];
      if (value === undefined || value === null) return false;
    }

    // Interest rate must be greater than 0
    if (!watchedValues.finance.interestRate || watchedValues.finance.interestRate <= 0) return false;

    // Check expenses data (property taxes and insurance are required)
    if (!watchedValues.expenses) return false;
    const expensesRequired = ['annualPropertyTaxes', 'annualPropertyInsurance'];
    for (const field of expensesRequired) {
      const value = watchedValues.expenses[field as keyof typeof watchedValues.expenses];
      if (typeof value !== 'number' || !value || value <= 0) return false;
    }

    // Check if there are any validation errors
    return isValid && Object.keys(errors).length === 0;
  };

  const canSave = isFormComplete() && !isSubmitting;

  useEffect(() => {
    if (existingPropertyData) {
      reset(existingPropertyData);
    }
  }, [existingPropertyData, reset]);

  const onSubmit = async (data: PropertyData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Store interest rate for future use
      localStorage.setItem('lastInterestRate', data.finance.interestRate.toString());
      
      if (existingPropertyData?.id) {
        // Update existing property
        await propertyApi.updateProperty(existingPropertyData.id, data);
      } else {
        // Create new property
        await propertyApi.createProperty(data);
      }
      
      // Navigate back to dashboard on success
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving property:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to save property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSaveDraft = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const data = methods.getValues();
      
      // Store interest rate for future use if it exists
      if (data.finance?.interestRate) {
        localStorage.setItem('lastInterestRate', data.finance.interestRate.toString());
      }
      
      // Save as draft with current data (even if incomplete)
      const draftData = {
        ...data,
        isDraft: true
      };
      
      if (existingPropertyData?.id) {
        await propertyApi.updateProperty(existingPropertyData.id, draftData);
      } else {
        await propertyApi.createProperty(draftData);
      }
      
      // Navigate back to dashboard on success
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving draft:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to save draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: Step[] = [
    { id: 1, name: 'Property Information', Icon: Home },
    { id: 2, name: 'Financing', Icon: Landmark },
    { id: 3, name: 'Income', Icon: Banknote },
    { id: 4, name: 'Expenses', Icon: Receipt },
    { id: 5, name: 'Development/Rehab', Icon: Wrench },
    { id: 6, name: 'Summary', Icon: ClipboardList },
  ];
  
  const mobileSteps: Step[] = [
    ...steps,
  ];

  const StepperNavigation = ({ isMobile = false }: { isMobile?: boolean }) => {
    const currentSteps = isMobile ? mobileSteps : steps;
    return (
      <div
        className={
          isMobile
            ? "w-full bg-white"
            : "hidden sm:flex sm:justify-center sm:border-b sm:border-slate-200 sm:mb-6"
        }
      >
        <div className={isMobile ? "flex justify-around w-full" : "flex"}>
          {currentSteps.map(({ id, name, Icon, path }) => {
            const isActive = step === id;
            
            const content = (
              <>
                <Icon className={`w-5 h-5 ${isActive ? 'text-rose-500' : 'text-slate-400'}`} />
                <span className={`hidden lg:inline ${isActive ? 'text-rose-600' : 'text-slate-500'}`}>
                  {name}
                </span>
              </>
            );

            const classNames = `flex items-center gap-2 p-4 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`;

            if (path) {
              return (
                <Link key={id} to={path} className={classNames}>
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={id}
                type="button"
                onClick={() => setStep(id)}
                className={classNames}
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 pb-48">
      <div className="bg-white rounded-lg shadow-md p-6 relative">
        <button
            onClick={() => navigate('/dashboard')}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
            aria-label="Close form"
          >
            <X className="w-6 h-6" />
        </button>
        
        <StepperNavigation />

        <FormProvider {...methods}>
          <form id="property-form" onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <p className="text-sm">{submitError}</p>
              </div>
            )}
            
            {step === 1 && <PropertyInfoStep />}
            {step === 2 && <FinancingStep />}
            {step === 3 && <IncomeStep />}
            {step === 4 && <ExpensesStep />}
            {step === 5 && <RehabStep />}
            {step === 6 && <SummaryStep />}
          </form>
        </FormProvider>
      </div>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t z-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-x-4">
                  <Button 
                    onClick={() => setStep(step - 1)} 
                    variant="secondary" 
                    className="w-auto px-4 py-2 flex items-center justify-center gap-2"
                    disabled={step === 1}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setStep(step + 1)} 
                    className="w-auto px-4 py-2 flex items-center justify-center gap-2"
                    disabled={step === 6}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Button>
              </div>

              <div className="flex items-center gap-x-4">
                  <Button 
                    onClick={() => navigate('/dashboard')} 
                    variant="secondary" 
                    className="hidden sm:flex w-auto px-4 py-2 items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </Button>
                  
                  {/* Save Draft button - shown when Save is disabled */}
                  {!canSave && (
                    <button 
                      type="button" 
                      onClick={onSaveDraft}
                      disabled={isSubmitting}
                      className="font-bold py-2 px-3 sm:px-6 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap text-sm sm:text-base"
                      title="Save current progress as draft"
                    >
                       <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                       <span className="hidden sm:inline">{isSubmitting ? 'Saving...' : 'Save Draft'}</span>
                       <span className="sm:hidden">{isSubmitting ? 'Draft' : 'Draft'}</span>
                    </button>
                  )}
                  
                  {/* Main Save button */}
                  <button 
                    type="submit" 
                    form="property-form" 
                    disabled={!canSave}
                    className={`font-bold py-2 px-3 sm:px-6 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${
                      !canSave
                        ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                        : 'bg-rose-500 text-white hover:bg-rose-600'
                    }`}
                    title={!canSave ? 'Please complete all required fields' : 'Save property'}
                  >
                     <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                     <span>{isSubmitting ? 'Saving...' : 'Save'}</span>
                  </button>
              </div>
          </div>
          <div className="sm:hidden border-t">
            <StepperNavigation isMobile />
          </div>
        </div>
      </footer>
    </main>
  );
}