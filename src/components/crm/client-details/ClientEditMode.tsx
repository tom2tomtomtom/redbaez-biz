import React from 'react';
import { ClientForm } from '../client-form/ClientForm';
import { Contact } from './ContactInfoCard';
import { MonthlyForecast } from './types/MonthlyForecast';

interface ClientEditModeProps {
  client: any;
  contacts: Contact[];
  nextSteps: string;
  nextDueDate: string;
  onSave: (formData: any) => void;
  onContactsChange: (contacts: Contact[]) => void;
  onNextStepsChange: (steps: string) => void;
  onNextDueDateChange: (date: string) => void;
  onMonthlyForecastsChange?: (forecasts: MonthlyForecast[]) => void;
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
  onMonthlyForecastsChange,
  onCancel
}) => {
  return (
    <ClientForm
      initialData={client}
      contacts={contacts}
      nextSteps={nextSteps}
      nextDueDate={nextDueDate}
      onSave={onSave}
      onContactsChange={onContactsChange}
      onNextStepsChange={onNextStepsChange}
      onNextDueDateChange={onNextDueDateChange}
      onMonthlyForecastsChange={onMonthlyForecastsChange}
      isEditing={true}
      onCancel={onCancel}
    />
  );
};