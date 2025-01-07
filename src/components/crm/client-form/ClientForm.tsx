import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContactsList } from './ContactsList';
import { StatusSection } from './StatusSection';
import { NextStepsSection } from './NextStepsSection';
import { CompanySection } from './CompanySection';
import { useClientFormState } from './useClientFormState';
import { useClientFormSubmit } from './useClientFormSubmit';
import { RevenueFormSection } from './revenue/RevenueFormSection';
import { useRevenueState } from './hooks/useRevenueState';
import { MonthlyForecast } from '../client-details/types/MonthlyForecast';

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
  onCancel?: () => void;
  onMonthlyForecastsChange?: (forecasts: MonthlyForecast[]) => void;
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
  onCancel,
  onMonthlyForecastsChange,
}: ClientFormProps) => {
  const formState = useClientFormState({ initialData, isEditing });
  const revenueState = useRevenueState(initialData);
  
  const resetForm = () => {
    formState.setCompanyName('');
    formState.setStatus('');
    formState.setLikelihood('');
    formState.setType('business');
    formState.setIndustry('');
    formState.setCompanySize('');
    formState.setWebsite('');
    formState.setBackground('');
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
    console.log('Form submission with state:', {
      projectRevenueSignedOff: revenueState.projectRevenueSignedOff,
      projectRevenueForecast: revenueState.projectRevenueForecast,
      annualRevenueSignedOff: revenueState.annualRevenueSignedOff,
      annualRevenueForecast: revenueState.annualRevenueForecast
    });

    const formData = {
      name: formState.companyName,
      type: formState.type,
      industry: formState.industry,
      company_size: formState.companySize || null,
      status: formState.status,
      annual_revenue: revenueState.annualRevenue ? parseFloat(revenueState.annualRevenue) : null,
      project_revenue: revenueState.projectRevenue ? parseFloat(revenueState.projectRevenue) : null,
      website: formState.website,
      notes: nextSteps,
      background: formState.background,
      likelihood: Number(formState.likelihood) || null,
      next_due_date: nextDueDate || null,
      project_revenue_signed_off: Boolean(revenueState.projectRevenueSignedOff),
      project_revenue_forecast: Boolean(revenueState.projectRevenueForecast),
      annual_revenue_signed_off: parseFloat(revenueState.annualRevenueSignedOff) || 0,
      annual_revenue_forecast: parseFloat(revenueState.annualRevenueForecast) || 0,
    };

    console.log('Submitting form data with explicit type conversion:', formData);
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
            type={formState.type}
            industry={formState.industry}
            companySize={formState.companySize}
            website={formState.website}
            background={formState.background}
            onStatusChange={formState.setStatus}
            onLikelihoodChange={formState.setLikelihood}
            onTypeChange={formState.setType}
            onIndustryChange={formState.setIndustry}
            onCompanySizeChange={formState.setCompanySize}
            onWebsiteChange={formState.setWebsite}
            onBackgroundChange={formState.setBackground}
          />

          <div className="col-span-2">
            <RevenueFormSection
              {...revenueState}
              onProjectRevenueChange={revenueState.setProjectRevenue}
              onAnnualRevenueChange={revenueState.setAnnualRevenue}
              onProjectRevenueSignedOffChange={revenueState.setProjectRevenueSignedOff}
              onProjectRevenueForecastChange={revenueState.setProjectRevenueForecast}
              onAnnualRevenueSignedOffChange={revenueState.setAnnualRevenueSignedOff}
              onAnnualRevenueForecastChange={revenueState.setAnnualRevenueForecast}
              onMonthlyForecastsChange={onMonthlyForecastsChange}
            />
          </div>

          <NextStepsSection
            nextSteps={nextSteps}
            nextDueDate={nextDueDate}
            onNextStepsChange={onNextStepsChange}
            onNextDueDateChange={onNextDueDateChange}
          />
        </div>

        <div className="mt-6 border-t pt-6 flex gap-4">
          {onCancel && (
            <Button 
              variant="outline"
              className="w-full py-6 text-lg font-medium"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
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