import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Contact } from './ContactInfoCard';
import { AdditionalInfoCard } from './AdditionalInfoCard';
import { KeyMetricsCard } from './KeyMetricsCard';
import { ContactInfoCard } from './ContactInfoCard';
import { StatusTab } from './StatusTab';
import { TaskHistory } from './TaskHistory';
import { UpdateNextStepButton } from './components/UpdateNextStepButton';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';

interface ClientContentProps {
  client: any;
  isEditing: boolean;
  parsedAdditionalContacts: Contact[];
}

interface DueItem {
  id: string;
  type: 'task' | 'next-step' | 'idea';
  dueDate: string;
  title?: string;
  notes?: string;
  description?: string;
  urgent?: boolean;
}

const formatText = (text: string) => {
  if (!text) return '';
  
  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  // For each paragraph, split by single newlines and join with line breaks
  return paragraphs
    .map(para => 
      para
        .split(/\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
    )
    .filter(para => para.length > 0)
    .join('\n\n');
};

export const ClientContent = ({ client, isEditing, parsedAdditionalContacts }: ClientContentProps) => {
  // Fetch all related tasks and next steps
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

  const renderDueItems = () => {
    if (isLoading) return <div>Loading items...</div>;
    if (!allItems) return null;

    const allDueItems: DueItem[] = [
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
    ].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return (
      <div className="space-y-4">
        {allDueItems.map((item) => (
          <Card key={`${item.type}-${item.id}`} className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={item.urgent ? "destructive" : "secondary"}>
                    {item.type === 'task' ? 'Task' : item.type === 'next-step' ? 'Next Step' : 'Strategic Idea'}
                  </Badge>
                  {item.urgent && (
                    <Badge variant="destructive">Urgent</Badge>
                  )}
                </div>
                <h4 className="font-medium">
                  {item.type === 'task' ? item.title : 
                   item.type === 'next-step' ? item.notes :
                   item.description}
                </h4>
                {item.description && item.type === 'task' && (
                  <p className="text-sm text-gray-500">{item.description}</p>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <CalendarDays className="h-4 w-4 mr-1" />
                {format(new Date(item.dueDate), 'MMM d, yyyy')}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Client Name Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
        {client.type && (
          <p className="text-gray-500 mt-1">{client.type}</p>
        )}
      </div>

      {/* Client Background Section */}
      {client.background && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Background</h3>
          <div className="text-gray-700 whitespace-pre-line">
            {formatText(client.background)}
          </div>
        </div>
      )}

      {/* Next Steps Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Next Steps</h3>
          <UpdateNextStepButton clientId={client.id} />
        </div>
        
        {/* Due Items Section */}
        <div className="mb-6">
          <h4 className="text-md font-medium mb-4">Due Items</h4>
          {renderDueItems()}
        </div>

        <TaskHistory clientId={client.id} />
      </div>

      {/* Status Section */}
      <StatusTab 
        clientId={client.id} 
        currentStatus={client.status}
      />

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