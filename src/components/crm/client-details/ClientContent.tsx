import React from 'react';
import { Contact } from './ContactInfoCard';
import { AdditionalInfoCard } from './AdditionalInfoCard';
import { KeyMetricsCard } from './KeyMetricsCard';
import { ContactInfoCard } from './ContactInfoCard';
import { StatusTab } from './StatusTab';
import { TaskHistory } from './TaskHistory';

interface ClientContentProps {
  client: any;
  isEditing: boolean;
  parsedAdditionalContacts: Contact[];
}

export const ClientContent = ({ client, isEditing, parsedAdditionalContacts }: ClientContentProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <ContactInfoCard
          contactName={client.contact_name}
          companySize={client.company_size}
          contactEmail={client.contact_email}
          contactPhone={client.contact_phone}
          additionalContacts={parsedAdditionalContacts}
          clientId={client.id}
        />
        <AdditionalInfoCard
          industry={client.industry}
          website={client.website}
          type={client.type}
        />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <KeyMetricsCard
          annualRevenue={client.annual_revenue}
          likelihood={client.likelihood}
          revenueData={[]}
          annualRevenueSignedOff={client.annual_revenue_signed_off || 0}
          annualRevenueForecast={client.annual_revenue_forecast || 0}
          clientId={client.id}
        />
        <StatusTab 
          clientId={client.id} 
          currentStatus={client.status}
        />
        <TaskHistory clientId={client.id} />
      </div>
    </div>
  );
};