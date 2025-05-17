import logger from '@/utils/logger';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Contact } from './ContactInfoCard';
import { AdditionalInfoCard } from './AdditionalInfoCard';
import { KeyMetricsCard } from './KeyMetricsCard';
import { ContactInfoCard } from './ContactInfoCard';
import { StatusTab } from './StatusTab';
import { TaskHistory } from './TaskHistory';
import { UpdateNextStepButton } from './components/UpdateNextStepButton';
import { supabase } from '@/lib/supabaseClient';
import { BackgroundSection } from './sections/BackgroundSection';
import { DueItemsSection } from './sections/DueItemsSection';
import { useRevenueCalculations } from './hooks/useRevenueCalculations';

interface ClientContentProps {
  client: any;
  isEditing: boolean;
  parsedAdditionalContacts: Contact[];
}

export const ClientContent = ({ client, isEditing, parsedAdditionalContacts }: ClientContentProps) => {
  logger.info('ClientContent rendering with client data:', client);
  
  // Get revenue calculations
  const { revenueData, totalActualRevenue, totalForecastRevenue } = useRevenueCalculations(client);
  
  // Use the calculated values if available, otherwise fall back to stored values from client
  // This ensures we always have some value to display
  const displayActualRevenue = client?.annual_revenue_signed_off ?? totalActualRevenue ?? 0;
  const displayForecastRevenue = client?.annual_revenue_forecast ?? totalForecastRevenue ?? 0;
  
  logger.info('Revenue calculation results:', { 
    revenueData, 
    totalActualRevenue, 
    totalForecastRevenue,
    displayActualRevenue,
    displayForecastRevenue,
    clientAnnualRevenueSignedOff: client?.annual_revenue_signed_off,
    clientAnnualRevenueForecast: client?.annual_revenue_forecast
  });

  const { data: allItems, isLoading } = useQuery({
    queryKey: ['client-items', client.id],
    queryFn: async () => {
      const [tasksResponse, nextStepsResponse, ideasResponse] = await Promise.all([
        supabase
          .from('general_tasks')
          .select('*')
          .eq('client_id', client.id)
          .is('status', null)
          .not('next_due_date', 'is', null)
          .order('next_due_date', { ascending: true }),
        supabase
          .from('client_next_steps')
          .select('*')
          .eq('client_id', client.id)
          .is('completed_at', null)
          .not('due_date', 'is', null)
          .order('due_date', { ascending: true }),
        supabase
          .from('recommendations')
          .select('*')
          .eq('client_id', client.id)
          .eq('status', 'pending')
          .not('due_date', 'is', null)
          .order('due_date', { ascending: true })
      ]);

      return {
        tasks: tasksResponse.data || [],
        nextSteps: nextStepsResponse.data || [],
        ideas: ideasResponse.data || []
      };
    }
  });

  const dueItems = allItems ? [
    ...allItems.tasks.map(task => ({
      ...task,
      type: 'task' as const,
      dueDate: task.next_due_date,
      title: task.title,
      description: task.description
    })),
    ...allItems.nextSteps.map(step => ({
      ...step,
      type: 'next-step' as const,
      dueDate: step.due_date,
      notes: step.notes
    })),
    ...allItems.ideas.map(idea => ({
      ...idea,
      type: 'idea' as const,
      dueDate: idea.due_date,
      description: idea.description
    }))
  ].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
        {client.type && (
          <p className="text-gray-500 mt-1">{client.type}</p>
        )}
      </div>

      <BackgroundSection 
        clientId={client.id}
        background={client.background}
      />

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Next Steps</h3>
          <UpdateNextStepButton clientId={client.id} />
        </div>
        
        {/* Due Items Section */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-4">Due Items</h4>
          <DueItemsSection items={dueItems} isLoading={isLoading} />
        </div>

        <TaskHistory clientId={client.id} />
      </div>

      <StatusTab 
        clientId={client.id} 
        currentStatus={client.status}
      />

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
        clientId={client.id}
      />

      <KeyMetricsCard
        annualRevenue={client.annual_revenue}
        likelihood={client.likelihood}
        revenueData={revenueData}
        annualRevenueSignedOff={displayActualRevenue}
        annualRevenueForecast={displayForecastRevenue}
        clientId={client.id}
      />
    </div>
  );
};
