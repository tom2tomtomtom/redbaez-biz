import React from 'react';
import { ClientRow } from '@/integrations/supabase/types/client-types';
import { Contact } from './ContactInfoCard';
import { ContactInfoCard } from './ContactInfoCard';
import { AdditionalInfoCard } from './AdditionalInfoCard';
import { KeyMetricsCard } from './KeyMetricsCard';
import { StatusTab } from './StatusTab';
import { StrategicRecommendations } from './StrategicRecommendations';
import { NextStepsHistory } from './NextStepsHistory';
import { TaskHistory } from './TaskHistory';
import { UpdateNextStepButton } from './components/UpdateNextStepButton';
import { Card } from '@/components/ui/card';

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
    <div className="space-y-6 p-8 text-left">
      {/* Background Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Background</h2>
        <p className="text-muted-foreground">{client.background || 'No background information available.'}</p>
      </Card>

      {/* Tasks and Status Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tasks & Status</h2>
            <div className="flex items-center gap-4">
              <TaskHistory />
              <UpdateNextStepButton clientId={client.id} />
            </div>
          </div>
          
          <StatusTab 
            clientId={client.id} 
            currentStatus={client.status || ''}
          />
          
          <NextStepsHistory clientId={client.id} />
        </div>
      </Card>

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
      
      <StrategicRecommendations 
        clientId={client.id}
        clientName={client.name}
      />
    </div>
  );
};