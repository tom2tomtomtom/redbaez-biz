import { Contact } from './ContactInfoCard';
import { KeyMetricsCard } from './KeyMetricsCard';
import { ContactInfoCard } from './ContactInfoCard';
import { AdditionalInfoCard } from './AdditionalInfoCard';
import { NextStepsHistory } from './NextStepsHistory';
import { UrgentFlagToggle } from './components/UrgentFlagToggle';
import { useRevenueCalculations } from './hooks/useRevenueCalculations';
import { StrategicRecommendations } from './StrategicRecommendations';

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
    <div className="space-y-6">
      {/* Current Next Step and History Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          {/* Current Next Step */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-2">Current Next Step</h3>
            <div className="space-y-2">
              <p className="text-gray-700">{client.notes || 'No next step set'}</p>
              {client.next_due_date && (
                <p className="text-sm text-gray-500">
                  Due: {new Date(client.next_due_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          
          {/* Next Steps History */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Next Steps History</h3>
            <NextStepsHistory clientId={client.id} />
          </div>
        </div>
      </div>

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

        <div className="col-span-12">
          <StrategicRecommendations 
            clientId={client.id} 
            clientName={client.name}
          />
        </div>

        <div className="col-span-12 flex items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm">
          <UrgentFlagToggle clientId={client.id} isUrgent={client.urgent || false} />
        </div>
      </div>
    </div>
  );
};