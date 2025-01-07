import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContactsList } from './ContactsList';
import { StatusSection } from './StatusSection';
import { NextStepsSection } from './NextStepsSection';
import { CompanySection } from './CompanySection';
import { useClientFormState } from './useClientFormState';
import { useClientFormSubmit } from './useClientFormSubmit';

interface Contact {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  address: string;
  phone: string;
}

interface ClientFormProps {
  contacts: Contact[];
  nextSteps: string;
  nextDueDate: string;
  onContactsChange: (contacts: Contact[]) => void;
  onNextStepsChange: (steps: string) => void;
  onNextDueDateChange: (date: string) => void;
  initialData?: any;
  onSave?: (data: any) => void;
  isEditing?: boolean;
}

export const ClientForm = ({
  contacts,
  nextSteps,
  nextDueDate,
  onContactsChange,
  onNextStepsChange,
  onNextDueDateChange,
  initialData,
  onSave,
  isEditing = false,
}: ClientFormProps) => {
  const formState = useClientFormState({ initialData, isEditing });
  
  const resetForm = () => {
    formState.setCompanyName('');
    formState.setStatus('');
    formState.setLikelihood('');
    formState.setProjectRevenue('');
    formState.setRevenue('');
    formState.setType('business');
    formState.setIndustry('');
    formState.setCompanySize('');
    formState.setWebsite('');
    formState.setBackground('');
    formState.setProjectRevenueSignedOff(false);
    formState.setProjectRevenueForecast(false);
    formState.setAnnualRevenueSignedOff('');
    formState.setAnnualRevenueForecast('');
    onContactsChange([{ 
      firstName: '', 
      lastName: '', 
      title: '', 
      email: '', 
      address: '', 
      phone: '' 
    }]);
    onNextStepsChange('');
    onNextDueDateChange('');
  };

  const { handleSubmit } = useClientFormSubmit({
    isEditing,
    onSave,
    setIsLoading: formState.setIsLoading,
    resetForm,
  });

  const onSubmit = () => {
    const formData = {
      name: formState.companyName,
      type: formState.type,
      industry: formState.industry,
      companySize: formState.companySize,
      status: formState.status,
      revenue: formState.revenue,
      projectRevenue: formState.projectRevenue,
      website: formState.website,
      notes: nextSteps,
      background: formState.background,
      likelihood: formState.likelihood,
      nextDueDate: nextDueDate,
      project_revenue_signed_off: formState.projectRevenueSignedOff,
      project_revenue_forecast: formState.projectRevenueForecast,
      annual_revenue_signed_off: formState.annualRevenueSignedOff,
      annual_revenue_forecast: formState.annualRevenueForecast,
    };
    handleSubmit(formData);
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Client Information' : 'New Client Information'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CompanySection 
            companyName={formState.companyName}
            onCompanyNameChange={formState.setCompanyName}
          />

          <div className="col-span-2">
            <ContactsList 
              contacts={contacts}
              onContactsChange={onContactsChange}
            />
          </div>

          <StatusSection
            status={formState.status}
            likelihood={formState.likelihood}
            projectRevenue={formState.projectRevenue}
            revenue={formState.revenue}
            type={formState.type}
            industry={formState.industry}
            companySize={formState.companySize}
            website={formState.website}
            background={formState.background}
            projectRevenueSignedOff={formState.projectRevenueSignedOff}
            projectRevenueForecast={formState.projectRevenueForecast}
            annualRevenueSignedOff={formState.annualRevenueSignedOff}
            annualRevenueForecast={formState.annualRevenueForecast}
            onStatusChange={formState.setStatus}
            onLikelihoodChange={formState.setLikelihood}
            onProjectRevenueChange={formState.setProjectRevenue}
            onRevenueChange={formState.setRevenue}
            onTypeChange={formState.setType}
            onIndustryChange={formState.setIndustry}
            onCompanySizeChange={formState.setCompanySize}
            onWebsiteChange={formState.setWebsite}
            onBackgroundChange={formState.setBackground}
            onProjectRevenueSignedOffChange={formState.setProjectRevenueSignedOff}
            onProjectRevenueForecastChange={formState.setProjectRevenueForecast}
            onAnnualRevenueSignedOffChange={formState.setAnnualRevenueSignedOff}
            onAnnualRevenueForecastChange={formState.setAnnualRevenueForecast}
          />

          <NextStepsSection
            nextSteps={nextSteps}
            nextDueDate={nextDueDate}
            onNextStepsChange={onNextStepsChange}
            onNextDueDateChange={onNextDueDateChange}
          />
        </div>

        <div className="mt-6 border-t pt-6">
          <Button 
            className="w-full py-6 text-lg font-medium transition-all duration-300 hover:scale-[1.01]"
            onClick={onSubmit}
            disabled={formState.isLoading}
          >
            {formState.isLoading ? 'Saving...' : isEditing ? 'Update Client Information' : 'Save Client Information'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};