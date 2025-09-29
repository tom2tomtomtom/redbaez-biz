import logger from '@/utils/logger';
import React from 'react';
import { Contact } from './ContactInfoCard';
import { AdditionalInfoCard } from './AdditionalInfoCard';
import { KeyMetricsCard } from './KeyMetricsCard';
import { ContactInfoCard } from './ContactInfoCard';
import { StatusTab } from './StatusTab';
import { TaskHistory } from './TaskHistory';
import { UpdateNextStepButton } from './components/UpdateNextStepButton';
import { BackgroundSection } from './sections/BackgroundSection';
import { useRevenueCalculations } from './hooks/useRevenueCalculations';
import { UnifiedTaskList } from '../priority-actions/UnifiedTaskList';
import { TaskDialog } from '../priority-actions/TaskDialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ClientContentProps {
  client: any;
  isEditing: boolean;
  parsedAdditionalContacts: Contact[];
}

export const ClientContent = ({ client, isEditing, parsedAdditionalContacts }: ClientContentProps) => {
  logger.info('ClientContent rendering with client data:', client);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

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

  // No longer need complex query - UnifiedTaskList handles this


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
        
        {/* Client Tasks Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium">Client Tasks</h4>
            <Button onClick={() => setIsNewTaskOpen(true)} size="sm">
              <Plus size={16} className="mr-2" />
              Add Task
            </Button>
          </div>
          <UnifiedTaskList
            title=""
            showAddButton={false}
            clientId={client.id}
          />
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

      <TaskDialog
        isOpen={isNewTaskOpen}
        onOpenChange={setIsNewTaskOpen}
        task={null}
        onSaved={() => setIsNewTaskOpen(false)}
        defaultCategory="Client Work"
        clientId={client.id}
      />
    </div>
  );
};
