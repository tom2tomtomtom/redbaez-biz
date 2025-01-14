import React from 'react';
import { CompanySection } from '../CompanySection';
import { ContactsList } from '../ContactsList';
import { StatusSection } from '../StatusSection';
import { RevenueFormSection } from '../revenue/RevenueFormSection';
import { NextStepsSection } from '../NextStepsSection';

interface Contact {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  address: string;
  phone: string;
}

interface FormContentProps {
  formState: any;
  revenueState: any;
  contacts: Contact[];
  nextSteps: string;
  nextDueDate: string;
  onContactsChange: (contacts: Contact[]) => void;
  onNextStepsChange: (steps: string) => void;
  onNextDueDateChange: (date: string) => void;
}

export const FormContent = ({
  formState,
  revenueState,
  contacts,
  nextSteps,
  nextDueDate,
  onContactsChange,
  onNextStepsChange,
  onNextDueDateChange,
}: FormContentProps) => {
  return (
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
        />
      </div>

      <NextStepsSection
        nextSteps={nextSteps}
        nextDueDate={nextDueDate}
        onNextStepsChange={onNextStepsChange}
        onNextDueDateChange={onNextDueDateChange}
      />
    </div>
  );
};