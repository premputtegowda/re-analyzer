import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { PropertyData, PropertySummary } from '../types/property';
import Button from '../components/Button';
import { Home, Banknote, Wrench, Landmark, Receipt, ArrowLeft, ArrowRight, ClipboardList, LucideProps, Save, X } from 'lucide-react';
import PropertyInfoStep from '../components/form-steps/PropertyInfoStep';
import FinancingStep from '../components/form-steps/FinancingStep';
import IncomeStep from '../components/form-steps/IncomeStep';
import ExpensesStep from '../components/form-steps/ExpensesStep';
import RehabStep from '../components/form-steps/RehabStep';
import SummaryStep from '../components/form-steps/SummaryStep';

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
      units: [{ beds: 1, baths: 1, sqft: 0, monthlyRent: 0 }],
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

  const { reset } = methods;

  useEffect(() => {
    if (existingPropertyData) {
      reset(existingPropertyData);
    }
  }, [existingPropertyData, reset]);

  const onSubmit = (data: PropertyData) => {
    alert(JSON.stringify(data, null, 2));
  };

  const steps: Step[] = [
    { id: 1, name: 'Property', Icon: Home },
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
                    <span>Previous</span>
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setStep(step + 1)} 
                    className="w-auto px-4 py-2 flex items-center justify-center gap-2"
                    disabled={step === 6}
                  >
                    <span>Next</span>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
              </div>

              <div className="flex items-center gap-x-4">
                  <Button 
                    onClick={() => navigate('/dashboard')} 
                    variant="secondary" 
                    className="w-auto px-4 py-2 flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </Button>
                  <button 
                    type="submit" 
                    form="property-form" 
                    className={`font-bold py-2 px-6 rounded-lg transition-colors bg-rose-500 text-white hover:bg-rose-600 flex items-center gap-2`}
                  >
                     <Save className="w-5 h-5" />
                     <span>Save</span>
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