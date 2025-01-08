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
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const revenueData = months.map((month, index) => {
    const monthLower = month.toLowerCase();
    return {
      month,
      actual: client[`actual_${monthLower}`] || 0,
      forecast: client[`forecast_${monthLower}`] || 0
    };
  });

  // Calculate total actual revenue
  const totalActualRevenue = Object.entries(client)
    .filter(([key, value]) => key.startsWith('actual_'))
    .reduce((sum, [_, value]) => sum + (Number(value) || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <KeyMetricsCard 
        annualRevenue={client.annual_revenue}
        likelihood={client.likelihood}
        revenueData={revenueData}
        annualRevenueSignedOff={totalActualRevenue}
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