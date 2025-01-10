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

  // Fetch both client next steps and general tasks
  const { data: activeNextSteps } = useQuery({
    queryKey: ['client-next-steps', client.id],
    queryFn: async () => {
      const [nextStepsResult, tasksResult] = await Promise.all([
        supabase
          .from('client_next_steps')
          .select('*')
          .eq('client_id', client.id)
          .is('completed_at', null)
          .order('due_date', { ascending: true }),
        supabase
          .from('general_tasks')
          .select('*')
          .eq('client_id', client.id)
          .is('completed_at', null)
          .order('next_due_date', { ascending: true })
      ]);

      if (nextStepsResult.error) throw nextStepsResult.error;
      if (tasksResult.error) throw tasksResult.error;

      // Combine and sort both types of items
      const combinedItems = [
        ...(nextStepsResult.data || []).map(step => ({
          ...step,
          type: 'next_step',
          dueDate: step.due_date,
          description: step.notes
        })),
        ...(tasksResult.data || []).map(task => ({
          ...task,
          type: 'task',
          dueDate: task.next_due_date,
          description: task.description || task.title
        }))
      ].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

      return combinedItems;
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
              activeNextSteps.map((item) => (
                <div 
                  key={`${item.type}-${item.id}`} 
                  className="bg-gray-50 p-4 rounded-lg border-l-4 border-l-blue-500"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-700">{item.description}</p>
                      {item.dueDate && (
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">
                      {item.type === 'next_step' ? 'Next Step' : 'Task'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No active next steps or tasks</p>
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
          clientId={client.id}
        />
        <AdditionalInfoCard 
          industry={client.industry}
          website={client.website}
          notes={client.notes}
          background={client.background}
          clientId={client.id}
        />
      </div>

      {/* Urgent Flag Toggle */}
      <div className="flex items-center justify-start gap-4 p-4 bg-white rounded-lg shadow-sm">
        <UrgentFlagToggle clientId={client.id} isUrgent={client.urgent || false} />
      </div>
    </div>
  );
};