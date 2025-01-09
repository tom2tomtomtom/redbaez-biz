import { Contact } from './ContactInfoCard';
import { KeyMetricsCard } from './KeyMetricsCard';
import { ContactInfoCard } from './ContactInfoCard';
import { AdditionalInfoCard } from './AdditionalInfoCard';
import { NextStepsHistory } from './NextStepsHistory';
import { UrgentFlagToggle } from './components/UrgentFlagToggle';
import { useRevenueCalculations } from './hooks/useRevenueCalculations';
import { StrategicRecommendations } from './StrategicRecommendations';
import { StatusTab } from './StatusTab';
import { UpdateNextStepButton } from './components/UpdateNextStepButton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

  const { data: activeNextSteps } = useQuery({
    queryKey: ['client-next-steps', client.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_next_steps')
        .select('*')
        .eq('client_id', client.id)
        .is('completed_at', null)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Status Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 text-left">
        <StatusTab 
          clientId={client.id}
          currentStatus={client.status}
        />
      </div>

      {/* Next Steps Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 text-left">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Current Next Steps</h3>
          </div>

          <div className="space-y-4 mb-6">
            {activeNextSteps && activeNextSteps.length > 0 ? (
              activeNextSteps.map((step) => (
                <div key={step.id} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{step.notes}</p>
                  {step.due_date && (
                    <p className="text-sm text-gray-500 mt-2">
                      Due: {new Date(step.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No active next steps</p>
            )}
          </div>

          <div className="flex justify-start">
            <UpdateNextStepButton 
              clientId={client.id}
              currentNotes=""
              currentDueDate=""
            />
          </div>
          
          <div className="text-left">
            <h3 className="text-lg font-semibold mb-4">Next Steps History</h3>
            <NextStepsHistory clientId={client.id} />
          </div>
        </div>
      </div>

      {/* Revenue Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 text-left">
        <KeyMetricsCard 
          annualRevenue={client.annual_revenue}
          likelihood={client.likelihood}
          revenueData={revenueData}
          annualRevenueSignedOff={totalActualRevenue}
          annualRevenueForecast={client.annual_revenue_forecast}
          clientId={client.id}
        />
      </div>

      {/* Strategic Recommendations Section */}
      <div className="bg-white rounded-lg shadow-sm text-left">
        <StrategicRecommendations 
          clientId={client.id} 
          clientName={client.name}
        />
      </div>

      {/* Client Info Section */}
      <div className="grid grid-cols-1 gap-6">
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

      {/* Urgent Flag Toggle */}
      <div className="flex items-center justify-start gap-4 p-4 bg-white rounded-lg shadow-sm">
        <UrgentFlagToggle clientId={client.id} isUrgent={client.urgent || false} />
      </div>
    </div>
  );
};