import React from 'react';
import { ClientForm } from '../client-form/ClientForm';
import { Contact } from './ContactInfoCard';
import { MonthlyForecast } from './types/MonthlyForecast';
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
  // Generate monthly revenue data including forecasts
  const revenueData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth() + i);
    const month = date.toLocaleString('default', { month: 'short' });
    return {
      month,
      value: client.annual_revenue ? client.annual_revenue / 12 : 0
    };
  });

  // Parse monthly forecasts from client data
  const monthlyForecasts: MonthlyForecast[] = Array.isArray(client.monthly_revenue_forecasts) 
    ? client.monthly_revenue_forecasts.map((forecast: any) => ({
        month: String(forecast.month),
        amount: Number(forecast.amount)
      }))
    : [];

  console.log('ClientEditMode isEditing:', true); // Debug log

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
        monthlyForecasts={monthlyForecasts}
        isEditing={true}
        onForecastUpdate={onMonthlyForecastsChange}
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
        onMonthlyForecastsChange={onMonthlyForecastsChange}
        isEditing={true}
        onCancel={onCancel}
      />
    </div>
  );
};