import React from 'react';
import { ClientRow } from '@/integrations/supabase/types/client-types';
import { Contact } from './ContactInfoCard';
import { ContactInfoCard } from './ContactInfoCard';
import { AdditionalInfoCard } from './AdditionalInfoCard';
import { KeyMetricsCard } from './KeyMetricsCard';
import { StatusTab } from './StatusTab';
import { StrategicRecommendations } from './StrategicRecommendations';
import { NextStepsHistory } from './NextStepsHistory';

interface ClientContentProps {
  client: ClientRow;
  isEditing: boolean;
  parsedAdditionalContacts: Contact[];
}

export const ClientContent: React.FC<ClientContentProps> = ({
  client,
  isEditing,
  parsedAdditionalContacts,
}) => {
  const revenueData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.toLocaleString('default', { month: 'short' });
    const actualKey = `actual_${month.toLowerCase()}` as keyof typeof client;
    const forecastKey = `forecast_${month.toLowerCase()}` as keyof typeof client;
    
    return {
      month,
      actual: Number(client[actualKey] || 0),
      forecast: Number(client[forecastKey] || 0),
    };
  }).reverse();

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
        <p className="text-muted-foreground">{client.background}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ContactInfoCard
          contactName={client.contact_name}
          contactEmail={client.contact_email}
          contactPhone={client.contact_phone}
          additionalContacts={parsedAdditionalContacts}
          companySize={client.company_size}
          clientId={client.id}
        />
        <AdditionalInfoCard
          industry={client.industry || ''}
          website={client.website || ''}
          type={client.type}
        />
      </div>

      <KeyMetricsCard
        annualRevenue={client.annual_revenue}
        likelihood={client.likelihood}
        revenueData={revenueData}
        annualRevenueSignedOff={client.annual_revenue_signed_off || 0}
        annualRevenueForecast={client.annual_revenue_forecast || 0}
        clientId={client.id}
      />

      <StatusTab 
        clientId={client.id} 
        currentStatus={client.status || ''}
      />
      
      <StrategicRecommendations 
        clientId={client.id}
        clientName={client.name}
      />

      <NextStepsHistory clientId={client.id} />
    </div>
  );
};