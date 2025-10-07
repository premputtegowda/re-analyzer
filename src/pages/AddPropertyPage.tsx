import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { PropertyData, PropertySummary } from '../types/property';
import Button from '../components/Button';
import { Home, Banknote, Wrench, Landmark, Receipt, ArrowLeft, ArrowRight, ClipboardList, LucideProps, Save, X, FileText, Check } from 'lucide-react';
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
  const [visitedSections, setVisitedSections] = useState<Set<number>>(new Set([1])); // Start with step 1 visited
  const [sectionCompletionStatus, setSectionCompletionStatus] = useState<Map<number, boolean>>(new Map());
  const [touchedSections, setTouchedSections] = useState<Set<number>>(new Set()); // Track sections with touched fields
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
      hasRehabWork: false,
      hasRehabRevenueImpact: false,
      incomeRentGrowth: 2,
      incomeAppreciationRate: 2,
      projectedRentGrowth: 2,
      holdPeriod: 5,
      analysisHoldPeriod: 5,
      averageLeaseLength: 12,
      analysisAverageLeaseLength: 12,
      expenseGrowthRate: 3,
      expensesExpenseGrowthRate: 3,
      appreciationRate: 2,
      vacancyRate: 5,
      expensesVacancyRate: 5,
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

  const { reset, watch, formState: { errors, isValid, touchedFields } } = methods;

  // Watch all form values to check completeness
  const watchedValues = watch();

  // Track touched sections based on touched fields
  useEffect(() => {
    const newTouchedSections = new Set<number>();
    
    // Check Property Information fields (step 1)
    if (touchedFields.address || touchedFields.purchasePrice || touchedFields.units || touchedFields.hasRehabWork) {
      newTouchedSections.add(1);
    }
    
    // Check Financing fields (step 2)
    if (touchedFields.finance?.downPayment || touchedFields.finance?.downPaymentType || 
        touchedFields.finance?.interestRate || touchedFields.finance?.loanTerm || 
        touchedFields.finance?.closingCosts || touchedFields.finance?.points || 
        touchedFields.finance?.otherCosts) {
      newTouchedSections.add(2);
    }
    
    // Check Income fields (step 3) - incomeRentGrowth, incomeAppreciationRate, averageLeaseLength, units with monthlyRent, otherIncome
    if (touchedFields.incomeRentGrowth || touchedFields.incomeAppreciationRate || touchedFields.averageLeaseLength || touchedFields.units || touchedFields.otherIncome) {
      newTouchedSections.add(3);
    }
    
    // Check Expenses fields (step 4)
    if (touchedFields.expenses || touchedFields.expensesExpenseGrowthRate || touchedFields.expensesVacancyRate) {
      newTouchedSections.add(4);
    }
    
    // Check Rehab fields (step 5) - only if rehab work is enabled
    if (watchedValues.hasRehabWork && touchedFields.rehab) {
      newTouchedSections.add(5);
    }
    
    // Only update if the set has actually changed
    const currentTouchedArray = Array.from(touchedSections).sort();
    const newTouchedArray = Array.from(newTouchedSections).sort();
    const hasChanged = currentTouchedArray.length !== newTouchedArray.length || 
                      currentTouchedArray.some((val, index) => val !== newTouchedArray[index]);
    
    if (hasChanged) {
      setTouchedSections(newTouchedSections);
    }
  }, [touchedFields.address, touchedFields.purchasePrice, touchedFields.units, touchedFields.hasRehabWork,
      touchedFields.finance?.downPayment, touchedFields.finance?.downPaymentType, 
      touchedFields.finance?.interestRate, touchedFields.finance?.loanTerm, 
      touchedFields.finance?.closingCosts, touchedFields.finance?.points, 
      touchedFields.finance?.otherCosts, touchedFields.incomeRentGrowth, touchedFields.incomeAppreciationRate, 
      touchedFields.averageLeaseLength, touchedFields.otherIncome, touchedFields.expenses, touchedFields.rehab, 
      watchedValues.hasRehabWork, touchedSections]);

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

    // Check expenses data (property taxes, insurance, expense growth rate, and vacancy rate are required)
    if (!watchedValues.expenses) return false;
    const expensesRequired = ['annualPropertyTaxes', 'annualPropertyInsurance'];
    for (const field of expensesRequired) {
      const value = watchedValues.expenses[field as keyof typeof watchedValues.expenses];
      if (typeof value !== 'number' || !value || value <= 0) return false;
    }
    
    // Check additional required expense fields
    if (watchedValues.expensesExpenseGrowthRate === undefined || watchedValues.expensesExpenseGrowthRate === null) return false;
    if (watchedValues.expensesVacancyRate === undefined || watchedValues.expensesVacancyRate === null) return false;

    // Check if there are any validation errors
    return isValid && Object.keys(errors).length === 0;
  };

  const canSave = isFormComplete() && !isSubmitting;

  // Functions to check step completion
  const isPropertyInfoComplete = () => {
    return watchedValues.address && 
           watchedValues.address.trim() !== '' && 
           watchedValues.purchasePrice && 
           watchedValues.purchasePrice > 0 &&
           watchedValues.units && 
           watchedValues.units.length > 0;
           // Note: monthlyRent is validated in Income step, not Property Info step
  };

  const isFinancingComplete = () => {
    if (!watchedValues.finance) return false;
    return watchedValues.finance.downPayment !== undefined &&
           watchedValues.finance.downPayment > 0 &&
           watchedValues.finance.downPaymentType &&
           watchedValues.finance.interestRate && 
           watchedValues.finance.interestRate > 0 &&
           watchedValues.finance.loanTerm &&
           watchedValues.finance.loanTerm > 0 &&
           watchedValues.finance.closingCosts &&
           watchedValues.finance.closingCosts > 0;
  };

  const isIncomeComplete = () => {
    return watchedValues.incomeRentGrowth !== undefined &&
           watchedValues.incomeRentGrowth !== null &&
           watchedValues.incomeAppreciationRate !== undefined &&
           watchedValues.incomeAppreciationRate !== null &&
           watchedValues.averageLeaseLength !== undefined &&
           watchedValues.averageLeaseLength !== null &&
           watchedValues.units && 
           watchedValues.units.length > 0 &&
           watchedValues.units.every(unit => unit.monthlyRent && unit.monthlyRent > 0);
  };

  const isExpensesComplete = () => {
    if (!watchedValues.expenses) return false;
    return watchedValues.expenses.annualPropertyTaxes && 
           watchedValues.expenses.annualPropertyTaxes > 0 &&
           watchedValues.expenses.annualPropertyInsurance && 
           watchedValues.expenses.annualPropertyInsurance > 0 &&
           watchedValues.expensesExpenseGrowthRate !== undefined &&
           watchedValues.expensesExpenseGrowthRate !== null &&
           watchedValues.expensesVacancyRate !== undefined &&
           watchedValues.expensesVacancyRate !== null;
  };

  const isRehabComplete = () => {
    // If no rehab work is required, this step is always complete
    if (!watchedValues.hasRehabWork) return true;
    
    // If rehab work is required, check if user has entered any rehab data
    if (!watchedValues.rehab) return false;
    
    // Must have at least one hard cost line item
    const hasHardCosts = watchedValues.rehab.hardCosts && watchedValues.rehab.hardCosts.length > 0 && 
                        watchedValues.rehab.hardCosts.some(cost => cost.category && cost.category.trim() !== '' && cost.amount > 0);
    
    return hasHardCosts;
  };

  const isSummaryComplete = () => {
    // Summary is complete if all previous steps are complete
    return isPropertyInfoComplete() && 
           isFinancingComplete() && 
           isIncomeComplete() && 
           isExpensesComplete();
  };

  const getStepCompletionStatus = (stepId: number) => {
    switch(stepId) {
      case 1: return isPropertyInfoComplete();
      case 2: return isFinancingComplete();
      case 3: return isIncomeComplete();
      case 4: return isExpensesComplete();
      case 5: 
        if (hasRehabWork) {
          return isRehabComplete();
        } else {
          return isSummaryComplete();
        }
      case 6: return isSummaryComplete();
      default: return false;
    }
  };

  // Helper function to handle step changes and track visited sections
  const handleStepChange = (newStep: number) => {
    // Save completion status of current step before leaving (only if it has been touched)
    if (touchedSections.has(step)) {
      const currentStepComplete = Boolean(getStepCompletionStatus(step));
      setSectionCompletionStatus(prev => {
        const newMap = new Map(prev);
        newMap.set(step, currentStepComplete);
        return newMap;
      });
    }
    
    setStep(newStep);
    setVisitedSections(prev => {
      const newSet = new Set(prev);
      newSet.add(newStep);
      return newSet;
    });
  };

  // Update completion status for touched sections in real-time
  useEffect(() => {
    let hasChanges = false;
    const newMap = new Map(sectionCompletionStatus);
    
    touchedSections.forEach(stepId => {
      if (stepId !== step) { // Don't update current step status
        const newStatus = Boolean(getStepCompletionStatus(stepId));
        const currentStatus = newMap.get(stepId);
        if (currentStatus !== newStatus) {
          newMap.set(stepId, newStatus);
          hasChanges = true;
        }
      }
    });
    
    if (hasChanges) {
      setSectionCompletionStatus(newMap);
    }
  }, [watchedValues.address, watchedValues.purchasePrice, watchedValues.units, 
      watchedValues.finance, watchedValues.expenses, watchedValues.rehab, 
      watchedValues.hasRehabWork, touchedSections, step, sectionCompletionStatus]);

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

  const hasRehabWork = watch('hasRehabWork');
  
  // Handle step adjustment when rehab flag changes
  useEffect(() => {
    // If user is on rehab step (5) and changes hasRehabWork to false, move to summary
    if (!hasRehabWork && step === 5) {
      setStep(5); // Summary step when no rehab
    }
    // If user is on summary step (5 when no rehab) and changes hasRehabWork to true, 
    // we don't automatically move them but the step numbers will adjust
  }, [hasRehabWork, step]);
  
  const steps: Step[] = [
    { id: 1, name: 'Property Information', Icon: Home },
    { id: 2, name: 'Financing', Icon: Landmark },
    { id: 3, name: 'Income', Icon: Banknote },
    { id: 4, name: 'Expenses', Icon: Receipt },
    ...(hasRehabWork ? [{ id: 5, name: 'Development/Rehab', Icon: Wrench }] : []),
    { id: hasRehabWork ? 6 : 5, name: 'Summary', Icon: ClipboardList },
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
        <div className={isMobile ? "flex justify-around w-full px-2" : "flex justify-around w-full max-w-6xl px-4"}>
          {currentSteps.map(({ id, name, Icon, path }) => {
            const isActive = step === id;
            const hasBeenVisited = visitedSections.has(id);
            const hasBeenTouched = touchedSections.has(id);
            const isComplete = sectionCompletionStatus.get(id) || false;
            
            const content = (
              <>
                <div className="relative flex-shrink-0">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-rose-500' : 'text-slate-400'}`} />
                  {/* Show circular checkbox for all sections */}
                  <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center ${
                    isActive 
                      ? 'bg-gray-300' // Always grey for active section
                      : hasBeenTouched
                        ? isComplete 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                        : 'bg-gray-300'
                  }`}>
                    {!isActive && hasBeenTouched && isComplete ? (
                      <Check className="w-2 h-2 text-white" />
                    ) : !isActive && hasBeenTouched && !isComplete ? (
                      <div className="w-1 h-1 bg-white rounded-full" />
                    ) : null}
                  </div>
                </div>
                <span className={`hidden md:inline whitespace-nowrap text-xs md:text-xs lg:text-sm text-center leading-tight ${isActive ? 'text-rose-600' : 'text-slate-500'}`}>
                  {name}
                </span>
              </>
            );

            const classNames = `flex items-center md:flex-col lg:flex-row justify-center gap-1 md:gap-1 lg:gap-2 p-2 md:p-2 lg:p-3 mx-1 md:mx-2 lg:mx-3 border-b-2 text-sm transition-colors min-w-0 ${
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
                onClick={() => handleStepChange(id)}
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
            className="absolute -top-3 -right-3 w-6 h-6 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors z-10"
            aria-label="Close form"
          >
            <X className="w-4 h-4" />
        </button>
        
        <StepperNavigation />

        <FormProvider {...methods}>
          <form id="property-form" onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && <PropertyInfoStep />}
            {step === 2 && <FinancingStep />}
            {step === 3 && <IncomeStep />}
            {step === 4 && <ExpensesStep />}
            {step === 5 && hasRehabWork && <RehabStep />}
            {step === 5 && !hasRehabWork && <SummaryStep touchedSections={touchedSections} />}
            {step === 6 && hasRehabWork && <SummaryStep touchedSections={touchedSections} />}
          </form>
        </FormProvider>
      </div>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t z-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-x-4">
                  <Button 
                    onClick={() => handleStepChange(step - 1)} 
                    variant="secondary" 
                    className="w-auto px-4 py-2 flex items-center justify-center gap-2"
                    disabled={step === 1}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => handleStepChange(step + 1)} 
                    className="w-auto px-4 py-2 flex items-center justify-center gap-2"
                    disabled={step >= (hasRehabWork ? 6 : 5)}
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