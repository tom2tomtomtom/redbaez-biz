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
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const revenueData = months.map((month) => {
    const monthLower = month.toLowerCase();
    return {
      month,
      actual: client[`actual_${monthLower}`] || 0,
      forecast: client[`forecast_${monthLower}`] || 0
    };
  });

  return (
    <div className="space-y-6">
      <KeyMetricsCard 
        annualRevenue={client.annual_revenue}
        likelihood={client.likelihood}
        revenueData={revenueData}
        annualRevenueSignedOff={client.annual_revenue_signed_off}
        annualRevenueForecast={client.annual_revenue_forecast}
        clientId={client.id}
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