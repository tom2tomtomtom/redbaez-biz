import { PriorityItem } from './hooks/usePriorityData';
import { GeneralTaskItem } from './GeneralTaskItem';
import { PriorityActionItem } from './PriorityActionItem';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { GeneralTaskRow } from '@/integrations/supabase/types/general-tasks.types';
import { ClientRow } from '@/integrations/supabase/types/clients.types';
import { useState } from 'react';
import { NextStepItem } from './NextStepItem';
import { CompletionDialog } from './components/CompletionDialog';
import { ItemControls } from './components/ItemControls';

interface PriorityItemsListProps {
  items: PriorityItem[];
  onTaskClick: (task: GeneralTaskRow) => void;
}

export const PriorityItemsList = ({ items, onTaskClick }: PriorityItemsListProps) => {
  const queryClient = useQueryClient();
  const [itemToComplete, setItemToComplete] = useState<PriorityItem | null>(null);

  const handleUrgentChange = async (item: PriorityItem, checked: boolean) => {
    try {
      if (item.type === 'task') {
        const { error } = await supabase
          .from('general_tasks')
          .update({ urgent: checked })
          .eq('id', item.data.id);
        if (error) throw error;
      } else if (item.type === 'client') {
        const { error } = await supabase
          .from('clients')
          .update({ urgent: checked })
          .eq('id', item.data.id);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });

      toast({
        title: checked ? "Marked as urgent" : "Removed urgent flag",
        description: `Successfully ${checked ? 'marked' : 'unmarked'} as urgent`,
      });
    } catch (error) {
      console.error('Error updating urgent status:', error);
      toast({
        title: "Error",
        description: "Failed to update urgent status",
        variant: "destructive",
      });
    }
  };

  const createHistoryRecord = async (item: PriorityItem, completed: boolean) => {
    try {
      const historyEntry = {
        client_id: item.type === 'client' ? Number(item.data.id) : null,
        notes: item.type === 'task' 
          ? `Task completed: ${item.data.title}`
          : `Client action completed: ${
              'name' in item.data ? item.data.name : ''
            } - Next steps completed`,
        completed_at: completed ? new Date().toISOString() : null,
        due_date: item.date
      };

      const { error } = await supabase
        .from('next_steps_history')
        .insert(historyEntry);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating history record:', error);
    }
  };

  const handleCompletedChange = async (item: PriorityItem, checked: boolean) => {
    try {
      if (item.type === 'task') {
        const { error } = await supabase
          .from('general_tasks')
          .update({ status: checked ? 'completed' : 'incomplete' })
          .eq('id', item.data.id);
        if (error) throw error;
      } else if (item.type === 'client') {
        const { error } = await supabase
          .from('clients')
          .update({ status: checked ? 'completed' : 'incomplete' })
          .eq('id', Number(item.data.id));
        if (error) throw error;
      }

      if (checked) {
        await createHistoryRecord(item, checked);
      }

      queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });

      toast({
        title: checked ? "Marked as completed" : "Marked as incomplete",
        description: `Successfully ${checked ? 'completed' : 'reopened'} the ${item.type}`,
      });
      
      setItemToComplete(null);
    } catch (error) {
      console.error('Error updating completion status:', error);
      toast({
        title: "Error",
        description: "Failed to update completion status",
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
        <p className="text-gray-600 text-center">No priority actions found for this month</p>
      </div>
    );
  }

  return (
    <>
      <CompletionDialog
        itemToComplete={itemToComplete}
        onOpenChange={() => setItemToComplete(null)}
        onComplete={(item) => handleCompletedChange(item, true)}
      />

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.data.id} className="relative">
            <ItemControls
              item={item}
              onComplete={() => setItemToComplete(item)}
              onUrgentChange={(checked) => handleUrgentChange(item, checked)}
            />
            {item.type === 'task' ? (
              <div 
                onClick={() => onTaskClick(item.data as GeneralTaskRow)}
                className="cursor-pointer"
              >
                <GeneralTaskItem task={item.data as GeneralTaskRow} />
              </div>
            ) : item.type === 'client' ? (
              <PriorityActionItem client={item.data as ClientRow} />
            ) : (
              <NextStepItem nextStep={item.data} />
            )}
          </div>
        ))}
      </div>
    </>
  );
};