import React from 'react';
import { ClientForm } from '../client-form/ClientForm';
import { Contact } from './ContactInfoCard';
import { MonthlyForecast } from './types/MonthlyForecast';

interface ClientEditModeProps {
  client: any;
  contacts: Contact[];
  nextSteps: string;
  nextDueDate: string;
  onCancel: () => void;
  onSave: (formData: any) => void;
  onContactsChange: (contacts: Contact[]) => void;
  onNextStepsChange: (steps: string) => void;
  onNextDueDateChange: (date: string) => void;
  onMonthlyForecastsChange?: (forecasts: MonthlyForecast[]) => void;
}

export const ClientEditMode: React.FC<ClientEditModeProps> = ({
  client,
  contacts,
  nextSteps,
  nextDueDate,
  onCancel,
  onSave,
  onContactsChange,
  onNextStepsChange,
  onNextDueDateChange,
  onMonthlyForecastsChange
}) => {
  const handleSave = (formData: any) => {
    onSave({
      ...formData,
      monthly_revenue_forecasts: client.monthly_revenue_forecasts
    });
  };

  return (
    <ClientForm
      initialData={client}
      contacts={contacts}
      nextSteps={nextSteps}
      nextDueDate={nextDueDate}
      onCancel={onCancel}
      onSave={handleSave}
      onContactsChange={onContactsChange}
      onNextStepsChange={onNextStepsChange}
      onNextDueDateChange={onNextDueDateChange}
      onMonthlyForecastsChange={onMonthlyForecastsChange}
      isEditing={true}
    />
  );
};