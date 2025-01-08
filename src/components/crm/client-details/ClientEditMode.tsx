import React from 'react';
import { ClientForm } from '../client-form/ClientForm';
import { Contact } from './ContactInfoCard';
import { KeyMetricsCard } from './KeyMetricsCard';

interface ClientEditModeProps {
  client: any;
  contacts: Contact[];
  nextSteps: string;
  nextDueDate: string;
  onSave: (formData: any) => void;
  onContactsChange: (contacts: Contact[]) => void;
  onNextStepsChange: (steps: string) => void;
  onNextDueDateChange: (date: string) => void;
  onCancel: () => void;
}

export const ClientEditMode: React.FC<ClientEditModeProps> = ({
  client,
  contacts,
  nextSteps,
  nextDueDate,
  onSave,
  onContactsChange,
  onNextStepsChange,
  onNextDueDateChange,
  onCancel
}) => {
  const revenueData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth() + i);
    const month = date.toLocaleString('default', { month: 'short' });
    return {
      month,
      value: client.annual_revenue ? client.annual_revenue / 12 : 0
    };
  });

  return (
    <div className="space-y-6">
      <KeyMetricsCard 
        annualRevenue={client.annual_revenue}
        projectRevenue={client.project_revenue}
        likelihood={client.likelihood}
        revenueData={revenueData}
        projectRevenueSignedOff={client.project_revenue_signed_off}
        projectRevenueForecast={client.project_revenue_forecast}
        annualRevenueSignedOff={client.annual_revenue_signed_off}
        annualRevenueForecast={client.annual_revenue_forecast}
      />
      
      <ClientForm
        initialData={client}
        contacts={contacts}
        nextSteps={nextSteps}
        nextDueDate={nextDueDate}
        onSave={onSave}
        onContactsChange={onContactsChange}
        onNextStepsChange={onNextStepsChange}
        onNextDueDateChange={onNextDueDateChange}
        isEditing={true}
        onCancel={onCancel}
      />
    </div>
  );
};