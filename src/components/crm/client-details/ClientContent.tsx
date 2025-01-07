import { Contact } from './ContactInfoCard';
import { KeyMetricsCard } from './KeyMetricsCard';
import { ContactInfoCard } from './ContactInfoCard';
import { AdditionalInfoCard } from './AdditionalInfoCard';
import { MonthlyForecast } from './types/MonthlyForecast';
import { generateRevenueData, generateMonthlyForecasts } from './utils/forecastUtils';

interface ClientContentProps {
  client: any;
  isEditing: boolean;
  parsedAdditionalContacts: Contact[];
  onForecastUpdate: (forecasts: MonthlyForecast[]) => void;
}

export const ClientContent = ({
  client,
  isEditing,
  parsedAdditionalContacts,
  onForecastUpdate
}: ClientContentProps) => {
  const revenueData = generateRevenueData(client.annual_revenue);
  const monthlyForecasts = generateMonthlyForecasts(client);

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
        monthlyForecasts={monthlyForecasts}
        isEditing={isEditing}
        onForecastUpdate={onForecastUpdate}
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