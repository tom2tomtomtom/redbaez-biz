import { Contact } from './ContactInfoCard';
import { KeyMetricsCard } from './KeyMetricsCard';
import { ContactInfoCard } from './ContactInfoCard';
import { AdditionalInfoCard } from './AdditionalInfoCard';

interface ClientContentProps {
  client: any;
  isEditing: boolean;
  parsedAdditionalContacts: Contact[];
}

export const ClientContent = ({
  client,
  isEditing,
  parsedAdditionalContacts,
}: ClientContentProps) => {
  const revenueData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth() + i);
    const month = date.toLocaleString('default', { month: 'short' });
    return {
      month,
      value: client.annual_revenue ? client.annual_revenue / 12 : 0
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <KeyMetricsCard 
        annualRevenue={client.annual_revenue}
        projectRevenue={client.project_revenue}
        likelihood={client.likelihood}
        revenueData={revenueData}
        projectRevenueSignedOff={client.project_revenue_signed_off}
        projectRevenueForecast={client.project_revenue_forecast}
        annualRevenueSignedOff={client.annual_revenue_signed_off}
        annualRevenueForecast={client.annual_revenue_forecast}
        clientId={client.id}
      />

      <ContactInfoCard 
        contactName={client.contact_name}
        companySize={client.company_size}
        contactEmail={client.contact_email}
        contactPhone={client.contact_phone}
        additionalContacts={parsedAdditionalContacts}
      />

      <AdditionalInfoCard 
        industry={client.industry}
        website={client.website}
        notes={client.notes}
        background={client.background}
      />
    </div>
  );
};