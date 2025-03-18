
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FormContent } from './form-sections/FormContent';
import { FormActions } from './form-sections/FormActions';
import { useClientFormState } from './useClientFormState';
import { useClientFormSubmit } from './useClientFormSubmit';
import { useRevenueState } from './hooks/useRevenueState';

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
  onClientAdded?: () => void;
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
  onClientAdded,
}: ClientFormProps) => {
  const formState = useClientFormState({ initialData, isEditing });
  const revenueState = useRevenueState(initialData);
  
  const { handleSubmit, isSubmitting } = useClientFormSubmit({
    clientId: initialData?.id?.toString(),
    onSuccess: () => {
      if (isEditing && onSave) {
        onSave(formState);
      } else if (!isEditing && onClientAdded) {
        onClientAdded();
      }
    }
  });

  const onSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const formData = {
      name: formState.companyName,
      type: formState.type,
      industry: formState.industry,
      company_size: formState.companySize,
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
      annual_revenue_signed_off: parseFloat(revenueState.annualRevenueSignedOff.toString()) || 0,
      annual_revenue_forecast: parseFloat(revenueState.annualRevenueForecast.toString()) || 0,
    };

    await handleSubmit(formData);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Client Information' : 'New Client Information'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormContent
            formState={formState}
            revenueState={revenueState}
            contacts={contacts}
            nextSteps={nextSteps}
            nextDueDate={nextDueDate}
            onContactsChange={onContactsChange}
            onNextStepsChange={onNextStepsChange}
            onNextDueDateChange={onNextDueDateChange}
          />
          <FormActions
            onCancel={onCancel}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            isEditing={isEditing}
          />
        </CardContent>
      </Card>
    </div>
  );
};
