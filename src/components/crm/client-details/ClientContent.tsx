import { Contact } from './ContactInfoCard';
import { KeyMetricsCard } from './KeyMetricsCard';
import { ContactInfoCard } from './ContactInfoCard';
import { AdditionalInfoCard } from './AdditionalInfoCard';
import { NextStepsHistory } from './NextStepsHistory';
import { UrgentFlagToggle } from './components/UrgentFlagToggle';
import { useRevenueCalculations } from './hooks/useRevenueCalculations';

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
  const { revenueData, totalActualRevenue } = useRevenueCalculations(client);

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

      <div className="col-span-12 flex items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm">
        <UrgentFlagToggle clientId={client.id} isUrgent={client.urgent || false} />
        <NextStepsHistory clientId={client.id} />
      </div>
    </div>
  );
};