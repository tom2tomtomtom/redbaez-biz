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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Client Background Section */}
      {client.background && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Background</h3>
          <p className="text-gray-700">{client.background}</p>
        </div>
      )}

      {/* Status Section */}
      <StatusTab 
        clientId={client.id} 
        currentStatus={client.status}
      />

      {/* Task History (Next Steps) */}
      <TaskHistory clientId={client.id} />

      {/* Contact Information */}
      <ContactInfoCard
        contactName={client.contact_name}
        companySize={client.company_size}
        contactEmail={client.contact_email}
        contactPhone={client.contact_phone}
        additionalContacts={parsedAdditionalContacts}
        clientId={client.id}
      />

      {/* Additional Information */}
      <AdditionalInfoCard
        industry={client.industry}
        website={client.website}
        type={client.type}
      />

      {/* Strategic Analysis (Key Metrics) */}
      <KeyMetricsCard
        annualRevenue={client.annual_revenue}
        likelihood={client.likelihood}
        revenueData={[]}
        annualRevenueSignedOff={client.annual_revenue_signed_off || 0}
        annualRevenueForecast={client.annual_revenue_forecast || 0}
        clientId={client.id}
      />
    </div>
  );
};