import { PriorityItem } from './hooks/usePriorityData';
import { GeneralTaskItem } from './GeneralTaskItem';
import { PriorityActionItem } from './PriorityActionItem';
import { NextStepItem } from './NextStepItem';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { GeneralTaskRow } from '@/integrations/supabase/types/general-tasks.types';
import { ClientRow } from '@/integrations/supabase/types/clients.types';
import { useState } from 'react';
import { CompletionDialog } from './components/CompletionDialog';
import { ItemControls } from './components/ItemControls';

interface PriorityItemsListProps {
  items: PriorityItem[];
  onTaskClick: (task: GeneralTaskRow) => void;
}

export const PriorityItemsList = ({ items, onTaskClick }: PriorityItemsListProps) => {
  const queryClient = useQueryClient();
  const [itemToComplete, setItemToComplete] = useState<PriorityItem | null>(null);

  const handleCompletedChange = async (item: PriorityItem, completed: boolean) => {
    try {
      if (item.type === 'task') {
        const { error } = await supabase
          .from('general_tasks')
          .update({ status: completed ? 'completed' : 'incomplete' })
          .eq('id', item.data.id);
        if (error) throw error;
      } else if (item.type === 'client') {
        const { error } = await supabase
          .from('clients')
          .update({ status: completed ? 'completed' : 'incomplete' })
          .eq('id', item.data.id);
        if (error) throw error;
      } else if (item.type === 'next_step') {
        const { error } = await supabase
          .from('client_next_steps')
          .update({ completed_at: completed ? new Date().toISOString() : null })
          .eq('id', item.data.id);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      queryClient.invalidateQueries({ queryKey: ['nextSteps'] });

      toast({
        title: completed ? "Item completed" : "Item reopened",
        description: `Successfully ${completed ? 'completed' : 'reopened'} the item`,
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
      } else if (item.type === 'next_step') {
        const { error } = await supabase
          .from('client_next_steps')
          .update({ urgent: checked })
          .eq('id', item.data.id);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['priorityClients'] });
      queryClient.invalidateQueries({ queryKey: ['generalTasks'] });
      queryClient.invalidateQueries({ queryKey: ['nextSteps'] });

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
        {items.map((item, index) => (
          <div 
            key={item.data.id} 
            className="relative transition-all duration-500 transform animate-fade-in"
            style={{
              transitionDelay: `${index * 50}ms`,
            }}
          >
            <ItemControls
              item={item}
              onComplete={() => setItemToComplete(item)}
              onUrgentChange={(checked) => handleUrgentChange(item, checked)}
            />
            <div className="transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md rounded-lg">
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
          </div>
        ))}
      </div>
    </>
  );
};